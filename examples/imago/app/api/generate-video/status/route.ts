export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { queryVideoTaskStatus } from "@providers/video";
import { createClient } from "../../../../utils/supabase/server";
import { refundVideoQuota } from "../../../../utils/credits/videoQuota";
import { enforceHistoryRetention } from "@lib/history";

const statusQuerySchema = z.object({
    taskId: z.string().min(1, "taskId is required"),
});

export async function GET(req: NextRequest) {
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
        const { searchParams } = new URL(req.url);
        const taskId = searchParams.get("taskId");

        const parsed = statusQuerySchema.parse({ taskId });

        const { data: taskRecord, error: taskFetchError } = await supabase
            .from("video_tasks")
            .select("bonus_used, paid_used, refunded, prompt, metadata, synced, video_url")
            .eq("task_id", parsed.taskId)
            .eq("user_id", user.id)
            .maybeSingle();

        if (taskFetchError) {
            console.error("Failed to fetch video task:", taskFetchError);
            return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
        }

        if (!taskRecord) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        if (taskRecord.refunded) {
            return NextResponse.json({ state: "fail", error: "Generation failed" });
        }

        if (taskRecord.synced && taskRecord.video_url) {
            return NextResponse.json({ state: "success", videoUrl: taskRecord.video_url });
        }

        const status = await queryVideoTaskStatus(parsed.taskId);

        if (status.state === "fail") {
            if (!taskRecord.refunded) {
                await refundVideoQuota(supabase, user.id, {
                    bonus: taskRecord.bonus_used,
                    paid: taskRecord.paid_used
                });

                const { error: updateError } = await supabase
                    .from("video_tasks")
                    .update({ refunded: true })
                    .eq("task_id", parsed.taskId);

                if (updateError) {
                    console.error("Failed to mark video task as refunded:", updateError);
                } else {
                    console.log(`[Video] Refunded ${taskRecord.bonus_used} bonus + ${taskRecord.paid_used} paid credits for task ${parsed.taskId}`);
                }
            }
        }

        if (status.state === "success" && status.videoUrl) {
            if (!taskRecord.synced) {
                let recorded = false;
                const { data: existing } = await supabase
                    .from("generations")
                    .select("id")
                    .eq("user_id", user.id)
                    .eq("video_url", status.videoUrl)
                    .maybeSingle();

                if (existing) {
                    recorded = true;
                } else {
                    const creditsSpent = (taskRecord?.bonus_used ?? 0) + (taskRecord?.paid_used ?? 0);
                    const promptRaw = taskRecord?.prompt ?? null;
                    const taskMetadata = taskRecord?.metadata as { duration?: string; resolution?: string; multi_shots?: boolean; image_urls?: string[] } | null;
                    const flowMetadata = taskMetadata
                        ? { flow: taskMetadata }
                        : null;
                    const imageUrl = taskMetadata?.image_urls?.[0] ?? null;

                    const { error: insertError } = await supabase.from("generations").insert({
                        user_id: user.id,
                        type: "video",
                        model_id: "wan-2.6",
                        image_url: imageUrl,
                        video_url: status.videoUrl,
                        summary: null,
                        prompt_raw: promptRaw,
                        metadata: flowMetadata,
                        credits_spent: creditsSpent,
                        status: "completed"
                    });

                    if (insertError) {
                        console.error("Failed to record video generation:", insertError);
                    } else {
                        recorded = true;
                        console.log(`[Video] Recorded generation for task ${parsed.taskId}`);
                    }
                }

                if (recorded) {
                    const { error: updateSyncedError } = await supabase
                        .from("video_tasks")
                        .update({ synced: true, video_url: status.videoUrl })
                        .eq("task_id", parsed.taskId);

                    if (updateSyncedError) {
                        console.error("Failed to mark video task as synced:", updateSyncedError);
                    }
                }
            }

            const retentionOk = await enforceHistoryRetention({ supabase, userId: user.id });
            if (!retentionOk) {
                console.error("Failed to enforce history retention after video generation");
            }
        }

        return NextResponse.json(status);

    } catch (error: unknown) {
        console.error("Video status query failed:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation Error", details: error.errors }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}