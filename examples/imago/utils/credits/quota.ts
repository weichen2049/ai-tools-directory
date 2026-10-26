import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID, createHash } from "crypto";
import { CREDIT_RULES, resolveModelTier, type ModelTier } from "@lib/credits";
import { decodeGuestUsage, encodeGuestUsage, getGuestCookieName, guestCookieOptions } from "../guestUsage";

type SupabaseClientNonNull = SupabaseClient<any, "public", any>;
type SupabaseClientType = SupabaseClientNonNull | null;

type ConsumeArgs = {
  request: NextRequest;
  supabase: SupabaseClientType;
  userId: string | null;
  modelId?: string | null;
  imageSize?: string | null;
};

type SuccessResult = {
  ok: true;
  source: "guest" | "daily" | "bonus" | "paid";
  creditsSpent: number;
  responseCookie?: { name: string; value: string };
  deductionBreakdown?: { bonus: number; paid: number };
};

type ErrorResult = {
  ok: false;
  status: number;
  message: string;
  code: "guest_limit" | "login_required" | "insufficient_credits" | "unknown";
};

export async function consumeGenerationQuota(args: ConsumeArgs): Promise<SuccessResult | ErrorResult> {
  // Preview Mode: allow unlimited usage when Supabase is not configured
  if (!args.supabase) {
    return { ok: true, source: "daily", creditsSpent: 0 };
  }
  const supabase = args.supabase; // TypeScript narrows to non-null
  const tier = resolveModelTier(args.modelId);
  const isHighResolution = args.imageSize === "2K" || args.imageSize === "4K";
  if (!args.userId) {
    if (isHighResolution) {
      return {
        ok: false,
        status: 401,
        message: "login_required",
        code: "login_required"
      } as ErrorResult;
    }
    return handleGuestQuota(args.request, supabase, tier);
  }
  return handleAuthenticatedQuota(supabase, args.userId, tier, isHighResolution);
}

function getClientIp(request: NextRequest) {
  const header = request.headers.get("x-forwarded-for");
  if (header) {
    const first = header.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const edgeIp = request.headers.get("x-vercel-ip")?.trim();
  if (edgeIp) return edgeIp;
  const requestAny = request as unknown as Record<string, unknown>;
  const geoValue = requestAny.geo as Record<string, unknown> | undefined;
  const geoIp =
    geoValue && typeof geoValue.ip === "string"
      ? (geoValue.ip as string)
      : null;
  if (geoIp && geoIp.length > 0) {
    return geoIp;
  }
  const anyIp = requestAny.ip;
  if (typeof anyIp === "string" && anyIp.length > 0) {
    return anyIp;
  }
  return null;
}

function hashIp(ip: string | null) {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex");
}

type VisitorContext = {
  id: string;
  used: number;
};

function resolveVisitorContext(request: NextRequest): VisitorContext {
  const cookieValue = request.cookies.get(getGuestCookieName())?.value;
  const payload = decodeGuestUsage(cookieValue);
  if (payload.visitor && payload.visitor.trim().length > 0) {
    return { id: payload.visitor.trim(), used: payload.used ?? 0 };
  }
  const headerId = request.headers.get("x-visitor-id")?.trim();
  if (headerId) {
    return { id: headerId, used: payload.used ?? 0 };
  }
  return { id: randomUUID(), used: payload.used ?? 0 };
}

async function handleGuestQuota(
  request: NextRequest,
  supabase: SupabaseClientNonNull,
  tier: ModelTier
): Promise<SuccessResult | ErrorResult> {
  if (tier === "image" || tier === "video") {
    return {
      ok: false,
      status: 401,
      message: "login_required",
      code: "login_required"
    } as ErrorResult;
  }

  const visitorContext = resolveVisitorContext(request);
  const ip = getClientIp(request);
  const ipHash = hashIp(ip);
  const today = new Date().toISOString().slice(0, 10);

  const guestLimit = CREDIT_RULES.guestNanoLimit;
  const tierSuffix = "";

  const { data, error } = await supabase.rpc("consume_guest_quota", {
    p_visitor_id: visitorContext.id,
    p_ip: ip,
    p_ip_hash: ipHash,
    p_usage_date: today,
    p_limit: guestLimit,
    p_ip_limit: 20, // hardcoded or from rules
    p_tier_suffix: tierSuffix
  });

  if (error) {
    console.error("Failed to consume guest quota", error);
    return {
      ok: false,
      status: 500,
      message: "unknown",
      code: "unknown"
    } as ErrorResult;
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.allowed) {
    return {
      ok: false,
      status: 401,
      message: "guest_limit",
      code: "guest_limit"
    } as ErrorResult;
  }

  const usedCount =
    typeof result.visitor_used === "number" ? result.visitor_used : visitorContext.used ?? guestLimit;
  return {
    ok: true,
    source: "guest",
    creditsSpent: 0,
    responseCookie: {
      name: getGuestCookieName(),
      value: encodeGuestUsage({ used: usedCount, visitor: visitorContext.id })
    }
  };
}

async function handleAuthenticatedQuota(
  supabase: SupabaseClientNonNull,
  userId: string,
  tier: ModelTier,
  skipDailyQuota: boolean = false
): Promise<SuccessResult | ErrorResult> {
  const today = new Date().toISOString().slice(0, 10);

  let limit: number;
  let cost: number;

  if (tier === "video") {
    limit = CREDIT_RULES.videoDailyLimit;
    cost = CREDIT_RULES.videoCreditCost;
  } else {
    limit = CREDIT_RULES.imageDailyLimit;
    cost = CREDIT_RULES.imageCreditCost;
  }

  if (!skipDailyQuota) {
    const { data: usageData, error: usageError } = await supabase.rpc("consume_daily_usage", {
      p_user_id: userId,
      p_usage_date: today,
      p_limit: limit,
      p_tier: tier
    });

    if (usageError) {
      console.error("Failed to consume daily usage", usageError);
      return {
        ok: false,
        status: 500,
        message: "unknown",
        code: "unknown"
      };
    }

    const usageResult = Array.isArray(usageData) ? usageData[0] : usageData;
    if (usageResult?.consumed) {
      return { ok: true, source: "daily", creditsSpent: 0 };
    }
  }

  const { data: debitData, error: debitError } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_cost: cost,
    p_signup_bonus: CREDIT_RULES.signupBonusCredits,
    p_bonus_ttl_hours: CREDIT_RULES.signupBonusExpiryDays * 24
  });

  if (debitError) {
    console.error("Failed to deduct credits", debitError);
    return {
      ok: false,
      status: 500,
      message: "unknown",
      code: "unknown"
    };
  }

  const debitResult = Array.isArray(debitData) ? debitData[0] : debitData;
  if (debitResult?.error_code === "insufficient_credits") {
    return {
      ok: false,
      status: 402,
      message: "insufficient_credits",
      code: "insufficient_credits"
    };
  }

  return {
    ok: true,
    source: debitResult?.paid_used > 0 ? "paid" : "bonus",
    creditsSpent: cost,
    deductionBreakdown: {
      bonus: debitResult?.bonus_used ?? 0,
      paid: debitResult?.paid_used ?? 0
    }
  };
}

export async function refundGenerationQuota(
  supabase: SupabaseClientType,
  userId: string | null,
  quota: SuccessResult,
  modelId?: string | null,
  visitorId?: string | null
) {
  // Preview Mode: skip refund when Supabase is not configured
  if (!supabase) return;

  if (quota.source === "guest" && visitorId) {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.rpc("refund_guest_quota", {
      p_visitor_id: visitorId,
      p_usage_date: today
    });
    if (error) {
      console.error("Failed to refund guest quota", error);
    }
    return;
  }

  if (!userId) return;

  const tier = resolveModelTier(modelId);
  const today = new Date().toISOString().slice(0, 10);
  const isQuota = quota.source === "daily";
  const bonusAmount = quota.deductionBreakdown?.bonus ?? 0;
  const paidAmount = quota.deductionBreakdown?.paid ?? 0;

  const { error } = await supabase.rpc("refund_credits", {
    p_user_id: userId,
    p_bonus_amount: bonusAmount,
    p_paid_amount: paidAmount,
    p_tier: tier,
    p_date: today,
    p_is_quota: isQuota
  });

  if (error) {
    console.error("Failed to refund credits", error);
  }
}

export function applyGuestCookie(response: NextResponse, cookie?: { name: string; value: string }) {
  if (!cookie) return;
  response.cookies.set(cookie.name, cookie.value, guestCookieOptions);
}