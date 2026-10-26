
import type { SupabaseClient } from "@supabase/supabase-js";
import { getVideoCreditCost, CREDIT_RULES } from "@lib/credits";

type SupabaseClientType = SupabaseClient<any, "public", any>;

type VideoConsumeArgs = {
    supabase: SupabaseClientType;
    userId: string;
    resolution: "720p" | "1080p";
    duration: "5" | "10" | "15";
};

type VideoSuccessResult = {
    ok: true;
    creditsSpent: number;
    deductionBreakdown: { bonus: number; paid: number };
};

type VideoErrorResult = {
    ok: false;
    status: number;
    message: string;
    code: "insufficient_credits" | "unknown";
    required?: number;
    available?: number;
};

export async function consumeVideoQuota(
    args: VideoConsumeArgs
): Promise<VideoSuccessResult | VideoErrorResult> {
    const { supabase, userId, resolution, duration } = args;
    const cost = getVideoCreditCost(resolution, duration);

    const { data, error } = await supabase.rpc("deduct_credits", {
        p_user_id: userId,
        p_cost: cost,
        p_signup_bonus: CREDIT_RULES.signupBonusCredits,
        p_bonus_ttl_hours: CREDIT_RULES.signupBonusExpiryDays * 24
    });

    if (error) {
        console.error("Failed to deduct video credits", error);
        return {
            ok: false,
            status: 500,
            message: "Failed to deduct credits",
            code: "unknown"
        };
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (result?.error_code === "insufficient_credits") {
        const { data: balance } = await supabase
            .from("user_credit_balances")
            .select("bonus_credits, paid_credits")
            .eq("user_id", userId)
            .maybeSingle();

        const available = (balance?.bonus_credits ?? 0) + (balance?.paid_credits ?? 0);

        return {
            ok: false,
            status: 402,
            message: "insufficient_credits",
            code: "insufficient_credits",
            required: cost,
            available
        };
    }

    return {
        ok: true,
        creditsSpent: cost,
        deductionBreakdown: {
            bonus: result?.bonus_used ?? 0,
            paid: result?.paid_used ?? 0
        }
    };
}

export async function refundVideoQuota(
    supabase: SupabaseClientType,
    userId: string,
    deductionBreakdown: { bonus: number; paid: number }
) {
    const { error } = await supabase.rpc("refund_credits", {
        p_user_id: userId,
        p_bonus_amount: deductionBreakdown.bonus,
        p_paid_amount: deductionBreakdown.paid,
        p_tier: "video", // mark as video, though RPC may not distinguish
        p_date: new Date().toISOString().slice(0, 10),
        p_is_quota: false
    });

    if (error) {
        console.error("Failed to refund video credits", error);
    }
}