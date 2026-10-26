const parseIntWithFallback = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

import { MODEL_TEXT_TO_IMAGE, MODEL_IMAGE_TO_IMAGE, MODEL_TEXT_TO_VIDEO, MODEL_IMAGE_TO_VIDEO } from "./models";

export const CREDIT_RULES = {
  guestNanoLimit: 5,
  nanoDailyLimit: 10,
  nanoCreditCost: 10,
  proDailyLimit: 5,
  proCreditCost: 20,

  signupBonusCredits: parseIntWithFallback(process.env.NEXT_PUBLIC_SIGNUP_BONUS_CREDITS, 500),
  signupBonusExpiryDays: parseIntWithFallback(process.env.NEXT_PUBLIC_SIGNUP_BONUS_EXPIRY_DAYS, 7),

  guestImageLimit: parseIntWithFallback(process.env.NEXT_PUBLIC_GUEST_IMAGE_LIMIT, 5),
  imageDailyLimit: parseIntWithFallback(process.env.NEXT_PUBLIC_IMAGE_DAILY_LIMIT, 10),
  imageCreditCost: parseIntWithFallback(process.env.NEXT_PUBLIC_IMAGE_CREDIT_COST, 10),


  guestVideoLimit: parseIntWithFallback(process.env.NEXT_PUBLIC_GUEST_VIDEO_LIMIT, 3),
  videoDailyLimit: parseIntWithFallback(process.env.NEXT_PUBLIC_VIDEO_DAILY_LIMIT, 2),
  videoCreditCost: parseIntWithFallback(process.env.NEXT_PUBLIC_VIDEO_CREDIT_COST, 40)
} as const;

export const VIDEO_CREDIT_COSTS: Record<string, Record<string, number>> = {
  "720p": { "5": 250, "10": 500, "15": 750 },
  "1080p": { "5": 350, "10": 700, "15": 1050 }
};

export function getVideoCreditCost(resolution: string, duration: string): number {
  return VIDEO_CREDIT_COSTS[resolution]?.[duration] ?? VIDEO_CREDIT_COSTS["1080p"]["5"];
}

export type ModelTier = "image" | "video";

export function resolveModelTier(modelId?: string | null): ModelTier {
  if (!modelId) return "image";
  if (modelId === MODEL_TEXT_TO_VIDEO || modelId === MODEL_IMAGE_TO_VIDEO) return "video";
  return "image"; // Default to image tier for T2I/I2I
}

export const MODEL_DISPLAY_NAMES = {
  image: "Image Gen",
  video: "Video Gen"
} as const;