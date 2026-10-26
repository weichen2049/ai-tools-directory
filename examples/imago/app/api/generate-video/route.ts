export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createVideoTask } from "@providers/video";
import { createClient } from "../../../utils/supabase/server";
import { consumeVideoQuota, refundVideoQuota } from "../../../utils/credits/videoQuota";

const videoGenerateSchema = z.object({
    prompt: z.string().trim().max(5000, "Prompt too long"),
    image_url: z.string().url().optional(),
    duration: z.enum(["5", "10", "15"]).optional().default("5"),
    resolution: z.enum(["720p", "1080p"]).optional().default("1080p"),
    multi_shots: z.boolean().optional().default(false),
}).superRefine((data, ctx) => {
    const minLength = data.image_url ? 2 : 1;
    if (data.prompt.length < minLength) {
        ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: minLength,
            type: "string",
            inclusive: true,
            message: `Prompt must be at least ${minLength} characters`,
            path: ["prompt"]
        });
    }
});

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsed = videoGenerateSchema.parse(body);

        const quotaResult = await consumeVideoQuota({
            supabase,
            userId: user.id,
            resolution: parsed.resolution,
            duration: parsed.duration
        });

        if (!quotaResult.ok) {
            return NextResponse.json(
                {
                    error: quotaResult.code,
                    message: quotaResult.message,
                    required: quotaResult.required,
                    available: quotaResult.available
                },
                { status: quotaResult.status }
            );
        }

        const imageUrls = parsed.image_url ? [parsed.image_url] : undefined;

        try {
            const { taskId } = await createVideoTask({
                prompt: parsed.prompt,
                imageUrls: imageUrls,
                duration: parsed.duration,
                resolution: parsed.resolution,
                multiShots: parsed.multi_shots
            });

            const { error: insertError } = await supabase.from("video_tasks").insert({
                task_id: taskId,
                user_id: user.id,
                bonus_used: quotaResult.deductionBreakdown.bonus,
                paid_used: quotaResult.deductionBreakdown.paid,
                prompt: parsed.prompt,
                metadata: {
                    duration: parsed.duration,
                    resolution: parsed.resolution,
                    multi_shots: parsed.multi_shots,
                    image_urls: imageUrls
                }
            });

            if (insertError) {
                console.error("Failed to record video task:", insertError);
                const { data: existingTask, error: fetchError } = await supabase
                    .from("video_tasks")
                    .select("task_id")
                    .eq("task_id", taskId)
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (fetchError || !existingTask) {
                    console.error("Video task record missing after insert failure:", fetchError);
                    await refundVideoQuota(supabase, user.id, quotaResult.deductionBreakdown);
                    return NextResponse.json({ error: "Failed to record video task" }, { status: 500 });
                }
            }

            return NextResponse.json({
                taskId,
                creditsSpent: quotaResult.creditsSpent
            });
        } catch (taskError) {
            console.error("Video task creation failed, refunding credits:", taskError);
            await refundVideoQuota(supabase, user.id, quotaResult.deductionBreakdown);

            throw taskError;
        }

    } catch (error: unknown) {
        console.error("Video generation failed:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}