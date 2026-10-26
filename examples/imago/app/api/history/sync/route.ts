export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { queryVideoTaskStatus } from "@providers/video";
import { refundVideoQuota } from "../../../../utils/credits/videoQuota";
import { enforceHistoryRetention } from "@lib/history";

export async function POST() {
    const supabase = await createClient();
    if (!supabase) {
        return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
    }
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: tasks, error: tasksError } = await supabase
            .from("video_tasks")
            .select("*")
            .eq("user_id", user.id)
            .eq("refunded", false)
            .eq("synced", false)
            .gte("created_at", sevenDaysAgo);

        if (tasksError) {
            console.error("Failed to fetch video tasks:", tasksError);
            return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ recoveredCount: 0, message: "No pending tasks found" });
        }


        let recoveredCount = 0;
        let refundCount = 0;
        const concurrency = 4;
        const queue = [...tasks];

        const processTask = async (task: any) => {
            try {
                const status = await queryVideoTaskStatus(task.task_id);

                if (status.state === "success" && status.videoUrl) {
                    const { data: existing } = await supabase
                        .from("generations")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("video_url", status.videoUrl)
                        .maybeSingle();

                    if (!existing) {
                        const metadata = task.metadata as { duration?: string; resolution?: string; multi_shots?: boolean; image_urls?: string[] } | null;
                        const flowMetadata = metadata ? { flow: metadata } : null;
                        const imageUrl = metadata?.image_urls?.[0] ?? null;

                        const { error: insertError } = await supabase.from("generations").insert({
                            user_id: user.id,
                            type: "video",
                            model_id: "wan-2.6",
                            image_url: imageUrl,
                            video_url: status.videoUrl,
                            summary: null,
                            prompt_raw: task.prompt,
                            metadata: flowMetadata,
                            credits_spent: (task.bonus_used ?? 0) + (task.paid_used ?? 0),
                            status: "completed"
                        });

                        if (!insertError) {
                            recoveredCount++;
                            console.log(`[Sync] Recovered video task ${task.task_id}`);
                            await supabase
                                .from("video_tasks")
                                .update({ synced: true, video_url: status.videoUrl })
                                .eq("task_id", task.task_id);
                        } else {
                            console.error(`[Sync] Failed to insert task ${task.task_id}:`, insertError);
                        }
                    } else {
                        await supabase
                            .from("video_tasks")
                            .update({ synced: true, video_url: status.videoUrl })
                            .eq("task_id", task.task_id);
                    }
                } else if (status.state === "fail") {
                    console.log(`[Sync] Found failed orphan task ${task.task_id}, refunding...`);
                    await refundVideoQuota(supabase, user.id, {
                        bonus: task.bonus_used,
                        paid: task.paid_used
                    });

                    await supabase
                        .from("video_tasks")
                        .update({ refunded: true })
                        .eq("task_id", task.task_id);

                    refundCount++;
                }
            } catch (err) {
                console.error(`[Sync] Error checking task ${task.task_id}:`, err);
            }
        };

        const workerCount = Math.min(concurrency, queue.length);
        const workers = Array.from({ length: workerCount }, async () => {
            while (queue.length > 0) {
                const next = queue.shift();
                if (!next) return;
                await processTask(next);
            }
        });

        await Promise.all(workers);

        if (recoveredCount > 0) {
            await enforceHistoryRetention({ supabase, userId: user.id });
        }

        return NextResponse.json({
            recoveredCount,
            refundCount,
            message: `Sync complete. Recovered ${recoveredCount}, Refunded ${refundCount}`
        });

    } catch (error) {
        console.error("History sync error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}