-- Consolidated Schema for Imago (v1.0.0)

-- ============================================================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update 'updated_at' column
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. USER CREDIT SYSTEM
-- ============================================================================

-- Table: user_credit_balances
CREATE TABLE IF NOT EXISTS public.user_credit_balances (
    user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    paid_credits integer NOT NULL DEFAULT 0,
    bonus_credits integer NOT NULL DEFAULT 0,
    bonus_expires_at timestamptz,
    signup_bonus_claimed boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: user_credit_balances updated_at
DROP TRIGGER IF EXISTS trg_user_credit_balances_updated ON public.user_credit_balances;
CREATE TRIGGER trg_user_credit_balances_updated
  BEFORE UPDATE ON public.user_credit_balances
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Table: credit_transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    amount integer NOT NULL,
    reason text NOT NULL,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON public.credit_transactions(created_at DESC);

-- ============================================================================
-- 3. USER DAILY USAGE TRACKING
-- ============================================================================

-- Table: user_daily_usage
CREATE TABLE IF NOT EXISTS public.user_daily_usage (
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    usage_date date NOT NULL,
    nano_used integer NOT NULL DEFAULT 0,         -- Legacy/Fast tier
    pro_used integer NOT NULL DEFAULT 0,          -- Legacy/Quality tier
    image_used integer NOT NULL DEFAULT 0,        -- Image tier
    video_used integer NOT NULL DEFAULT 0,        -- Video tier
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, usage_date)
);

-- Trigger: user_daily_usage updated_at
DROP TRIGGER IF EXISTS trg_user_daily_usage_updated ON public.user_daily_usage;
CREATE TRIGGER trg_user_daily_usage_updated
  BEFORE UPDATE ON public.user_daily_usage
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- 4. GENERATIONS & TASKS
-- ============================================================================

-- Table: generations (Main history table)
CREATE TABLE IF NOT EXISTS public.generations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    model_id text NOT NULL,
    image_url text, -- Primary media URL (image or video result)
    video_url text, -- Specific video URL (if applicable, for easier querying)
    summary text,
    prompt_raw text,
    metadata jsonb,
    credits_spent integer DEFAULT 0,
    status text DEFAULT 'completed',
    type text NOT NULL DEFAULT 'image', -- 'image' or 'video'
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_generations_user_created ON public.generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_type ON public.generations(type);

-- Table: video_tasks (Async video generation tracking)
CREATE TABLE IF NOT EXISTS public.video_tasks (
    task_id text PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_used integer NOT NULL DEFAULT 0,
    paid_used integer NOT NULL DEFAULT 0,
    refunded boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_video_tasks_user_id ON public.video_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_video_tasks_created_at ON public.video_tasks(created_at);

-- ============================================================================
-- 5. GUEST USAGE TRACKING
-- ============================================================================

-- Table: guest_usage
CREATE TABLE IF NOT EXISTS public.guest_usage (
    visitor_id text NOT NULL,
    usage_date date NOT NULL,
    tier text DEFAULT '',
    request_count integer DEFAULT 0,
    last_ip text,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (visitor_id, usage_date, tier)
);
CREATE INDEX IF NOT EXISTS idx_guest_usage_tier ON public.guest_usage (visitor_id, usage_date, tier);

-- Table: guest_ip_usage
CREATE TABLE IF NOT EXISTS public.guest_ip_usage (
    ip_hash text NOT NULL,
    usage_date date NOT NULL,
    request_count integer DEFAULT 0,
    last_ip text,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (ip_hash, usage_date)
);

-- ============================================================================
-- 6. FUNCTIONS & PROCEDURES
-- ============================================================================

-- Function: deduct_credits (Transactionally deduct credits)
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id uuid,
  p_cost integer,
  p_signup_bonus integer,
  p_bonus_ttl_hours integer
)
RETURNS TABLE(bonus_used integer, paid_used integer, error_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  balance record;
  now_ts timestamptz := now();
  bonus_valid boolean;
BEGIN
  -- Ensure user record exists
  INSERT INTO public.user_credit_balances (user_id, paid_credits, bonus_credits, bonus_expires_at, signup_bonus_claimed)
  VALUES (p_user_id, 0, 0, null, false)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO balance
    FROM public.user_credit_balances
    WHERE user_id = p_user_id
    FOR UPDATE;

  -- Apply signup bonus if eligible
  IF NOT balance.signup_bonus_claimed THEN
    balance.bonus_credits := COALESCE(balance.bonus_credits, 0) + GREATEST(p_signup_bonus, 0);
    balance.bonus_expires_at := now_ts + make_interval(hours => p_bonus_ttl_hours);
    balance.signup_bonus_claimed := true;
  END IF;

  -- Check bonus expiration
  bonus_valid := balance.bonus_expires_at IS NULL OR balance.bonus_expires_at > now_ts;
  IF NOT bonus_valid THEN
    balance.bonus_credits := 0;
  END IF;

  -- Zero cost check
  IF p_cost <= 0 THEN
    UPDATE public.user_credit_balances
      SET bonus_credits = balance.bonus_credits,
          paid_credits = balance.paid_credits,
          bonus_expires_at = balance.bonus_expires_at,
          signup_bonus_claimed = balance.signup_bonus_claimed
      WHERE user_id = p_user_id;
    bonus_used := 0;
    paid_used := 0;
    error_code := null;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate deduction
  bonus_used := LEAST(balance.bonus_credits, p_cost);
  paid_used := p_cost - bonus_used;

  -- Check insufficient funds
  IF paid_used > balance.paid_credits THEN
    bonus_used := 0;
    paid_used := 0;
    error_code := 'insufficient_credits';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Apply deduction
  balance.bonus_credits := balance.bonus_credits - bonus_used;
  balance.paid_credits := balance.paid_credits - paid_used;

  UPDATE public.user_credit_balances
    SET bonus_credits = balance.bonus_credits,
        paid_credits = balance.paid_credits,
        bonus_expires_at = balance.bonus_expires_at,
        signup_bonus_claimed = balance.signup_bonus_claimed
    WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, reason, metadata)
  VALUES (
    p_user_id,
    -(bonus_used + paid_used),
    'generation',
    jsonb_build_object('bonusPortion', bonus_used, 'paidPortion', paid_used)
  );

  error_code := null;
  RETURN NEXT;
END;
$$;

-- Function: consume_daily_usage (Track daily free limits)
CREATE OR REPLACE FUNCTION public.consume_daily_usage(
  p_user_id uuid,
  p_usage_date date,
  p_limit integer,
  p_tier text
)
RETURNS TABLE(consumed boolean, used integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier_lower text := lower(COALESCE(p_tier, 'nano'));
BEGIN
  INSERT INTO public.user_daily_usage (user_id, usage_date, nano_used, pro_used, image_used, video_used)
  VALUES (p_user_id, p_usage_date, 0, 0, 0, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  -- Handle 'nano'
  IF tier_lower = 'nano' THEN
    UPDATE public.user_daily_usage
      SET nano_used = nano_used + 1
      WHERE user_id = p_user_id AND usage_date = p_usage_date AND nano_used < p_limit
      RETURNING nano_used INTO used;
    IF FOUND THEN consumed := true; RETURN NEXT; RETURN; END IF;
    SELECT nano_used INTO used FROM public.user_daily_usage WHERE user_id = p_user_id AND usage_date = p_usage_date;
    consumed := false; RETURN NEXT; RETURN;
  END IF;

  -- Handle 'image'
  IF tier_lower = 'image' THEN
    UPDATE public.user_daily_usage
      SET image_used = image_used + 1
      WHERE user_id = p_user_id AND usage_date = p_usage_date AND image_used < p_limit
      RETURNING image_used INTO used;
    IF FOUND THEN consumed := true; RETURN NEXT; RETURN; END IF;
    SELECT image_used INTO used FROM public.user_daily_usage WHERE user_id = p_user_id AND usage_date = p_usage_date;
    consumed := false; RETURN NEXT; RETURN;
  END IF;

  -- Handle 'video'
  IF tier_lower = 'video' THEN
    UPDATE public.user_daily_usage
      SET video_used = video_used + 1
      WHERE user_id = p_user_id AND usage_date = p_usage_date AND video_used < p_limit
      RETURNING video_used INTO used;
    IF FOUND THEN consumed := true; RETURN NEXT; RETURN; END IF;
    SELECT video_used INTO used FROM public.user_daily_usage WHERE user_id = p_user_id AND usage_date = p_usage_date;
    consumed := false; RETURN NEXT; RETURN;
  END IF;

  -- Handle 'pro' (legacy fallback)
  UPDATE public.user_daily_usage
    SET pro_used = pro_used + 1
    WHERE user_id = p_user_id AND usage_date = p_usage_date AND pro_used < p_limit
    RETURNING pro_used INTO used;
  IF FOUND THEN consumed := true; RETURN NEXT; RETURN; END IF;
  SELECT pro_used INTO used FROM public.user_daily_usage WHERE user_id = p_user_id AND usage_date = p_usage_date;
  consumed := false; RETURN NEXT;
END;
$$;

-- Function: refund_credits (Refund on generation failure)
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id uuid,
  p_bonus_amount integer,
  p_paid_amount integer,
  p_tier text,
  p_date date,
  p_is_quota boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier_lower text := lower(COALESCE(p_tier, 'nano'));
BEGIN
  -- Case 1: Refund Quota
  IF p_is_quota THEN
    IF tier_lower = 'nano' THEN
      UPDATE public.user_daily_usage SET nano_used = GREATEST(nano_used - 1, 0) WHERE user_id = p_user_id AND usage_date = p_date;
    ELSIF tier_lower = 'image' THEN
      UPDATE public.user_daily_usage SET image_used = GREATEST(image_used - 1, 0) WHERE user_id = p_user_id AND usage_date = p_date;
    ELSIF tier_lower = 'video' THEN
      UPDATE public.user_daily_usage SET video_used = GREATEST(video_used - 1, 0) WHERE user_id = p_user_id AND usage_date = p_date;
    ELSE
      UPDATE public.user_daily_usage SET pro_used = GREATEST(pro_used - 1, 0) WHERE user_id = p_user_id AND usage_date = p_date;
    END IF;
    RETURN;
  END IF;

  -- Case 2: Refund Credits
  UPDATE public.user_credit_balances
    SET bonus_credits = bonus_credits + p_bonus_amount,
        paid_credits = paid_credits + p_paid_amount
    WHERE user_id = p_user_id;

  INSERT INTO public.credit_transactions (user_id, amount, reason, metadata)
  VALUES (
    p_user_id,
    p_bonus_amount + p_paid_amount,
    'refund',
    jsonb_build_object(
      'bonusPortion', p_bonus_amount,
      'paidPortion', p_paid_amount,
      'reason', 'generation_failed'
    )
  );
END;
$$;

-- Function: consume_guest_quota
CREATE OR REPLACE FUNCTION public.consume_guest_quota(
  p_visitor_id text,
  p_ip_hash text,
  p_ip text,
  p_usage_date date,
  p_limit integer,
  p_ip_limit integer,
  p_tier_suffix text DEFAULT ''
)
RETURNS TABLE(allowed boolean, visitor_used integer, ip_used integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_guest integer;
  current_ip integer;
  v_tier text := COALESCE(p_tier_suffix, '');
BEGIN
  -- Cleanup
  DELETE FROM public.guest_usage WHERE usage_date < p_usage_date - interval '7 days';
  DELETE FROM public.guest_ip_usage WHERE usage_date < p_usage_date - interval '7 days';

  IF p_visitor_id IS NULL OR length(trim(p_visitor_id)) = 0 THEN
    allowed := false; visitor_used := 0; ip_used := 0; RETURN NEXT; RETURN;
  END IF;

  -- Init record
  INSERT INTO public.guest_usage (visitor_id, usage_date, request_count, last_ip, tier)
  VALUES (p_visitor_id, p_usage_date, 0, p_ip, v_tier)
  ON CONFLICT (visitor_id, usage_date, tier) DO NOTHING;

  SELECT request_count INTO current_guest
    FROM public.guest_usage
    WHERE visitor_id = p_visitor_id AND usage_date = p_usage_date AND tier = v_tier
    FOR UPDATE;

  IF p_limit IS NULL OR p_limit <= 0 THEN p_limit := 0; END IF;
  IF current_guest >= p_limit THEN
    allowed := false; visitor_used := current_guest; ip_used := NULL; RETURN NEXT; RETURN;
  END IF;

  -- IP Check
  IF p_ip_hash IS NOT NULL AND p_ip_limit IS NOT NULL AND p_ip_limit > 0 THEN
    INSERT INTO public.guest_ip_usage (ip_hash, usage_date, request_count, last_ip)
    VALUES (p_ip_hash, p_usage_date, 0, p_ip)
    ON CONFLICT DO NOTHING;

    SELECT request_count INTO current_ip
      FROM public.guest_ip_usage
      WHERE ip_hash = p_ip_hash AND usage_date = p_usage_date
      FOR UPDATE;

    IF current_ip >= p_ip_limit THEN
      allowed := false; visitor_used := current_guest; ip_used := current_ip; RETURN NEXT; RETURN;
    END IF;
  ELSE
    current_ip := NULL;
  END IF;

  -- Increment
  UPDATE public.guest_usage
    SET request_count = current_guest + 1, last_ip = p_ip
    WHERE visitor_id = p_visitor_id AND usage_date = p_usage_date AND tier = v_tier;

  IF p_ip_hash IS NOT NULL AND current_ip IS NOT NULL THEN
    UPDATE public.guest_ip_usage
      SET request_count = current_ip + 1, last_ip = p_ip
      WHERE ip_hash = p_ip_hash AND usage_date = p_usage_date;
    ip_used := current_ip + 1;
  ELSE
    ip_used := NULL;
  END IF;

  allowed := true;
  visitor_used := current_guest + 1;
  RETURN NEXT;
END;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.user_credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tasks ENABLE ROW LEVEL SECURITY;

-- Policies: User Access Only
CREATE POLICY "Users view own balance" ON public.user_credit_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own daily usage" ON public.user_daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own generations" ON public.generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own generations" ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own video tasks" ON public.video_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own video tasks" ON public.video_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own video tasks" ON public.video_tasks FOR UPDATE USING (auth.uid() = user_id);
