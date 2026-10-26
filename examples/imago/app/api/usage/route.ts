import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";
import { CREDIT_RULES } from "@lib/credits";
import { decodeGuestUsage, getGuestCookieName } from "../../../utils/guestUsage";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const costs = {
    nano: CREDIT_RULES.nanoCreditCost,
    pro: CREDIT_RULES.proCreditCost,
    image: CREDIT_RULES.imageCreditCost,
    video: CREDIT_RULES.videoCreditCost
  };

  // Preview Mode: return guest response when Supabase is not configured
  if (!supabase) {
    const guestUsage = decodeGuestUsage(request.cookies.get(getGuestCookieName())?.value);
    return NextResponse.json({
      authenticated: false,
      guest: {
        limit: CREDIT_RULES.guestNanoLimit,
        used: guestUsage.used
      },
      nano: {
        limit: CREDIT_RULES.nanoDailyLimit,
        used: Math.min(guestUsage.used, CREDIT_RULES.nanoDailyLimit)
      },
      pro: { limit: CREDIT_RULES.proDailyLimit, used: 0 },
      image: { limit: CREDIT_RULES.imageDailyLimit, used: 0 },
      video: { limit: CREDIT_RULES.videoDailyLimit, used: 0 },
      credits: { paid: 0, bonus: 0, bonusExpiresAt: null },
      signupBonus: {
        amount: CREDIT_RULES.signupBonusCredits,
        expiresInDays: CREDIT_RULES.signupBonusExpiryDays,
        claimed: false
      },
      costs
    });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const guestUsage = decodeGuestUsage(request.cookies.get(getGuestCookieName())?.value);
    return NextResponse.json({
      authenticated: false,
      guest: {
        limit: CREDIT_RULES.guestNanoLimit,
        used: guestUsage.used
      },
      nano: {
        limit: CREDIT_RULES.nanoDailyLimit,
        used: Math.min(guestUsage.used, CREDIT_RULES.nanoDailyLimit)
      },
      pro: {
        limit: CREDIT_RULES.proDailyLimit,
        used: 0
      },
      image: {
        limit: CREDIT_RULES.imageDailyLimit,
        used: 0
      },
      video: {
        limit: CREDIT_RULES.videoDailyLimit,
        used: 0
      },
      credits: {
        paid: 0,
        bonus: 0,
        bonusExpiresAt: null
      },
      signupBonus: {
        amount: CREDIT_RULES.signupBonusCredits,
        expiresInDays: CREDIT_RULES.signupBonusExpiryDays,
        claimed: false
      },
      costs
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const [
    { data: usage, error: usageError },
    { data: balance, error: balanceError }
  ] = await Promise.all([
    supabase
      .from("user_daily_usage")
      .select("*")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .maybeSingle(),
    supabase.from("user_credit_balances").select("*").eq("user_id", user.id).maybeSingle()
  ]);

  if (usageError) {
    console.error("Failed to fetch usage summary", usageError);
  }
  if (balanceError) {
    console.error("Failed to fetch credit balance summary", balanceError);
  }

  const nanoUsed = usage?.nano_used ?? 0;
  const proUsed = usage?.pro_used ?? 0;
  const zimageUsed = usage?.image_used ?? 0;
  const seedreamUsed = usage?.video_used ?? 0;
  const bonusValid =
    balance?.bonus_expires_at && new Date(balance.bonus_expires_at).getTime() > Date.now()
      ? balance.bonus_credits ?? 0
      : 0;

  return NextResponse.json({
    authenticated: true,
    nano: {
      limit: CREDIT_RULES.nanoDailyLimit,
      used: nanoUsed
    },
    pro: {
      limit: CREDIT_RULES.proDailyLimit,
      used: proUsed
    },
    image: {
      limit: CREDIT_RULES.imageDailyLimit,
      used: zimageUsed
    },
    video: {
      limit: CREDIT_RULES.videoDailyLimit,
      used: seedreamUsed
    },
    credits: {
      paid: balance?.paid_credits ?? 0,
      bonus: bonusValid,
      bonusExpiresAt: balance?.bonus_expires_at ?? null
    },
    signupBonus: {
      amount: CREDIT_RULES.signupBonusCredits,
      expiresInDays: CREDIT_RULES.signupBonusExpiryDays,
      claimed: Boolean(balance?.signup_bonus_claimed)
    },
    costs
  });
}