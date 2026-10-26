type ModelOption = {
  id: string;
  label: string;
  badge?: {
    text: string;
    variant?: "gold" | "nsfw";
  };
};

export const MODEL_TEXT_TO_IMAGE = "text-to-image";
export const MODEL_IMAGE_TO_IMAGE = "image-to-image";
export const MODEL_TEXT_TO_VIDEO = "text-to-video";
export const MODEL_IMAGE_TO_VIDEO = "image-to-video";

const MODEL_LABEL_T2I = process.env.NEXT_PUBLIC_LABEL_TEXT_TO_IMAGE || "Text to Image";
const MODEL_LABEL_I2I = process.env.NEXT_PUBLIC_LABEL_IMAGE_TO_IMAGE || "Image to Image";
const MODEL_LABEL_T2V = process.env.NEXT_PUBLIC_LABEL_TEXT_TO_VIDEO || "Text to Video";
const MODEL_LABEL_I2V = process.env.NEXT_PUBLIC_LABEL_IMAGE_TO_VIDEO || "Image to Video";

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: MODEL_TEXT_TO_IMAGE,
    label: MODEL_LABEL_T2I,
    badge: { text: "FAST", variant: "gold" }
  },
  {
    id: MODEL_IMAGE_TO_IMAGE,
    label: MODEL_LABEL_I2I,
    badge: { text: "PRO", variant: "gold" }
  },
  {
    id: MODEL_TEXT_TO_VIDEO,
    label: MODEL_LABEL_T2V,
    badge: { text: "VIDEO", variant: "nsfw" }
  },
  {
    id: MODEL_IMAGE_TO_VIDEO,
    label: MODEL_LABEL_I2V,
    badge: { text: "VIDEO", variant: "nsfw" }
  }
];

export const MODEL_IDS = MODEL_OPTIONS.map((option) => option.id);
export const DEFAULT_MODEL_ID = MODEL_TEXT_TO_IMAGE;

export function normalizeModelId(modelId?: string | null): string | undefined {
  if (!modelId) return undefined;
  return MODEL_OPTIONS.find((option) => option.id === modelId)?.id;
}

export function isProModel(modelId?: string | null): boolean {
  return true; // All functional models are treated as premium/valid
}

export const PRO_IMAGE_SIZES = ["1K", "2K", "4K"] as const;
export type ProImageSize = (typeof PRO_IMAGE_SIZES)[number];
export const DEFAULT_PRO_IMAGE_SIZE: ProImageSize = "1K";

export function normalizeProImageSize(size?: string | null): ProImageSize | undefined {
  if (!size) return undefined;
  const upper = size.toUpperCase();
  return PRO_IMAGE_SIZES.includes(upper as ProImageSize) ? (upper as ProImageSize) : undefined;
}