export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { choicesSchema, type Choices } from "@lib/schema";
import { buildPrompt } from "@lib/prompt";
import { callProvider } from "@lib/provider";
import { normalizeModelId, DEFAULT_MODEL_ID, normalizeProImageSize } from "@lib/models";
import { toTextPrompt } from "@lib/promptText";
import { createClient } from "../../../utils/supabase/server";
import { OPTIONS } from "@lib/options";
import { consumeGenerationQuota, applyGuestCookie, refundGenerationQuota } from "../../../utils/credits/quota";
import { enforceHistoryRetention } from "@lib/history";


function extractReferenceImageUrl(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "reference_image_url" in body) {
    const url = (body as { reference_image_url?: unknown }).reference_image_url;
    if (typeof url === "string" && url.trim().length > 0) {
      return url.trim();
    }
  }
  return undefined;
}


function isProviderError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.startsWith("Provider error");
  }
  return false;
}

const LOCALIZED_MAP: Partial<Record<keyof typeof OPTIONS, Record<string, string>>> = {};

function formatToken(value?: string | null, category?: keyof typeof OPTIONS) {
  if (!value) return "";

  if (category) {
    if (!LOCALIZED_MAP[category]) {
      LOCALIZED_MAP[category] = OPTIONS[category].reduce<Record<string, string>>((acc, opt) => {
        acc[opt.value] = opt.label;
        return acc;
      }, {});
    }
    return LOCALIZED_MAP[category]?.[value] || "";
  }

  return value
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function createSummary(choices: Choices) {
  const parts = [
    formatToken(choices.style_mode, "style_mode"),
    formatToken(choices.pose, "pose"),
    formatToken(choices.scene_location, "scene_location")
  ].filter(Boolean);
  return parts.join(" · ");
}


async function handleGenerationRequest(
  parsed: Choices,
  referenceImageUrl: string | undefined,
  finalModelId: string,
  imageSize?: string
) {
  const hasReference = Boolean(referenceImageUrl);
  const summary = createSummary(parsed);
  const promptJson = buildPrompt(parsed, hasReference);
  const promptText = toTextPrompt(promptJson, { preserveReference: hasReference });
  const result = await callProvider({ promptJson, referenceImageUrl, modelId: finalModelId, imageSize });

  const mediaUrl = "image_url" in result ? result.image_url : ("video_url" in result ? result.video_url : undefined);

  if (!mediaUrl) {
    throw new Error("Provider returned no media URL");
  }

  return {
    image_url: mediaUrl,
    prompt_text: promptText,
    summary,
    model_id: finalModelId,
    metadata: {
      choices: parsed,
      referenceImageUrl,
      aspect_ratio: parsed.aspect_ratio,
      image_size: imageSize
    }
  };
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
    const rawModelId =
      typeof body === "object" && body !== null && "model_id" in body
        ? (body as { model_id?: unknown }).model_id
        : undefined;
    const requestedModel = typeof rawModelId === "string" ? normalizeModelId(rawModelId) : undefined;
    const parsed = choicesSchema.parse(body);
    const referenceImageUrl = extractReferenceImageUrl(body);
    const rawImageSize =
      typeof body === "object" && body !== null && "image_size" in body
        ? (body as { image_size?: unknown }).image_size
        : undefined;
    const imageSize = typeof rawImageSize === "string" ? normalizeProImageSize(rawImageSize) : undefined;
    targetModel = requestedModel ?? DEFAULT_MODEL_ID;
    quota = await consumeGenerationQuota({
      request: req,
      supabase,
      userId: user?.id ?? null,
      modelId: targetModel,
      imageSize
    });
    if (!quota.ok) {
      return NextResponse.json({ error: quota.code }, { status: quota.status });
    }

    const result = await handleGenerationRequest(parsed, referenceImageUrl, targetModel, imageSize);

    if (user?.id && supabase) {
      const record = {
        user_id: user.id,
        model_id: result.model_id,
        image_url: result.image_url,
        summary: result.summary,
        prompt_raw: result.prompt_text,
        metadata: result.metadata,
        credits_spent: quota.creditsSpent,
        status: "completed"
      };
      const { error } = await supabase.from("generations").insert(record);
      if (error) {
        console.error("Failed to record generation:", error);
      }
      const retentionOk = await enforceHistoryRetention({ supabase, userId: user.id });
      if (!retentionOk) {
        console.error("Failed to enforce history retention after generation");
      }
    }

    const response = NextResponse.json({ image_url: result.image_url, prompt_text: result.prompt_text });
    if (quota.responseCookie) {
      applyGuestCookie(response, quota.responseCookie);
    }
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bad Request";
    const status = isProviderError(error) ? 502 : 400;
    console.error("Generation request failed:", error);

    if (quota?.ok && targetModel) {
      const visitorId = user?.id ? null : req.headers.get("x-visitor-id")?.trim() || null;
      await refundGenerationQuota(supabase, user?.id ?? null, quota, targetModel, visitorId);
    }

    return new NextResponse(message, { status });
  }
}