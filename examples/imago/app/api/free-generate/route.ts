export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ASPECT_RATIO } from "@lib/options";
import { callImageProvider } from "@providers/image";
import { FREE_TEMPLATES, getTemplateMeta } from "../../config/freeTemplates";
import { DEFAULT_MODEL_ID, MODEL_IDS, normalizeModelId, PRO_IMAGE_SIZES, normalizeProImageSize } from "@lib/models";
import { createClient } from "../../../utils/supabase/server";
import { consumeGenerationQuota, applyGuestCookie, refundGenerationQuota } from "../../../utils/credits/quota";
import { enforceHistoryRetention } from "@lib/history";

const TEMPLATE_IDS = FREE_TEMPLATES.map((t) => t.id) as [string, ...string[]];
const MODEL_ID_VALUES = (MODEL_IDS.length > 0 ? MODEL_IDS : ["imago-fast"]) as [string, ...string[]];

const freeSchema = z
  .object({
    images: z.array(z.string().url()).max(2).optional().default([]),
    aspect_ratio: z.enum([...ASPECT_RATIO, "auto"] as [string, ...string[]]),
    prompt: z.string().min(1),
    template_id: z.enum(TEMPLATE_IDS).optional(),
    model_id: z.enum(MODEL_ID_VALUES).optional(),
    image_size: z.enum(PRO_IMAGE_SIZES).optional()
  })
  .superRefine((data, ctx) => {
    if (!data.template_id) return;
    const meta = FREE_TEMPLATES.find((t) => t.id === data.template_id);
    if (meta?.requiredImages !== undefined && data.images.length !== meta.requiredImages) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["images"],
        message: `该模板必须上传 ${meta.requiredImages} 张参考图`
      });
    }
    if (meta?.limitImages !== undefined && data.images.length > meta.limitImages) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["images"],
        message: `该模板最多允许上传 ${meta.limitImages} 张参考图`
      });
    }
  });

function isProviderError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.startsWith("Provider error") || error.message === "output_moderation";
  }
  return false;
}

function describeTemplate(templateId?: string | null) {
  if (!templateId) return "自由模式 · 自由创作";
  const meta = getTemplateMeta(templateId);
  if (!meta) return `自由模式 · ${templateId}`;
  return `自由模式 · ${meta.name}`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const user = supabase
    ? (await supabase.auth.getUser()).data.user
    : null;

  let quota: Awaited<ReturnType<typeof consumeGenerationQuota>> | undefined;
  let targetModel: string | undefined;

  try {
    const body = await req.json();
    const maybeModelId =
      typeof body === "object" && body !== null && "model_id" in body
        ? (body as { model_id?: unknown }).model_id
        : undefined;
    const normalized = typeof maybeModelId === "string" ? normalizeModelId(maybeModelId) : undefined;
    const parsed = freeSchema.parse(body);
    targetModel = normalized ?? DEFAULT_MODEL_ID;
    const normalizedImageSize = normalizeProImageSize(parsed.image_size);
    quota = await consumeGenerationQuota({
      request: req,
      supabase,
      userId: user?.id ?? null,
      modelId: targetModel,
      imageSize: normalizedImageSize
    });
    if (!quota.ok) {
      return NextResponse.json({ error: quota.code }, { status: quota.status });
    }

    const { image_url } = await callImageProvider({
      promptJson: { custom_base_prompt: parsed.prompt }, // Use custom_base_prompt for raw input
      aspectRatio: parsed.aspect_ratio === "auto" ? "3:4" : parsed.aspect_ratio, // Handle 'auto'
      referenceImageUrl: parsed.images?.[0] || null, // Handle array to single/null
    });
    const summary = describeTemplate(parsed.template_id);
    const finalModel = parsed.model_id ?? DEFAULT_MODEL_ID;

    if (user?.id && supabase) {
      const record = {
        user_id: user.id,
        model_id: finalModel,
        image_url,
        summary,
        prompt_raw: parsed.prompt,
        metadata: {
          template_id: parsed.template_id,
          aspect_ratio: parsed.aspect_ratio,
          image_count: parsed.images.length,
          image_size: parsed.image_size
        },
        credits_spent: quota.creditsSpent,
        status: "completed"
      };
      const { error } = await supabase.from("generations").insert(record);
      if (error) {
        console.error("Failed to record free generation:", error);
      }
      const retentionOk = await enforceHistoryRetention({ supabase, userId: user.id });
      if (!retentionOk) {
        console.error("Failed to enforce history retention after free generation");
      }
    }

    const response = NextResponse.json({ image_url });
    if (quota.responseCookie) {
      applyGuestCookie(response, quota.responseCookie);
    }
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    const status = isProviderError(error) ? 502 : 400;
    console.error("Free generation failed:", error);

    if (quota?.ok && targetModel) {
      const visitorId = user?.id ? null : req.headers.get("x-visitor-id")?.trim() || null;
      await refundGenerationQuota(supabase, user?.id ?? null, quota, targetModel, visitorId);
    }

    return new NextResponse(message, { status });
  }
}