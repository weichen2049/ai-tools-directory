import { z } from "zod";
import {
  STYLE_MODE,
  LIGHTING,
  MOOD,
  HAIR_STYLE,
  HAIR_COLOR,
  TOP_STYLE,
  BOTTOM_STYLE,
  HOSIERY_TYPE,
  HOSIERY_COLOR,
  HOSIERY_MATERIAL,
  FOOTWEAR_STYLE,
  HAIR_CLIP,
  EARRINGS,
  GLASSES_STYLE,
  MAKEUP_STYLE,
  MAKEUP_INTENSITY,
  POSE,
  SCENE_LOCATION,
  ASPECT_RATIO,
  GENDER,
  ETHNICITY,
  TOP_STYLE_HAS_BOTTOM,
  FEMALE_BODY_TYPE,
  MALE_BODY_TYPE,
  NECK_BODY_ACCESSORIES
} from "@lib/options";

const baseChoicesSchema = z.object({
  style_mode: z.enum(STYLE_MODE),
  lighting: z.enum(LIGHTING),
  mood: z.enum(MOOD),
  hair_style: z.enum(HAIR_STYLE),
  hair_color: z.enum(HAIR_COLOR).optional(),
  top_style: z.enum(TOP_STYLE),
  bottom_style: z.enum(BOTTOM_STYLE),
  hosiery_type: z.enum(HOSIERY_TYPE),
  hosiery_color: z.enum(HOSIERY_COLOR),
  hosiery_material: z.enum(HOSIERY_MATERIAL),
  hosiery_denier: z.number().min(0).max(200),
  footwear_style: z.enum(FOOTWEAR_STYLE),
  hair_clip: z.enum(HAIR_CLIP),
  earrings: z.enum(EARRINGS),
  neck_body_accessories: z.enum(NECK_BODY_ACCESSORIES),
  glasses_style: z.enum(GLASSES_STYLE),
  makeup_style: z.enum(MAKEUP_STYLE),
  makeup_intensity: z.enum(MAKEUP_INTENSITY),
  pose: z.enum(POSE),
  scene_location: z.enum(SCENE_LOCATION),
  bare_leg: z.boolean(),
  aspect_ratio: z.enum(ASPECT_RATIO),
  bare_makeup: z.boolean(),
  gender: z.enum(GENDER).optional(),
  ethnicity: z.enum(ETHNICITY).optional(),
  body_type: z.enum([...FEMALE_BODY_TYPE, ...MALE_BODY_TYPE])
});

const SCHEMA_MESSAGES = {
  zh: {
    bathTowelMaleOnly: "仅男性角色可以选择浴巾下装",
    onePieceBottomLocked: "一体式或浴巾上衣会自带下装，bottom_style 必须设为 none",
    bodyTypeMismatch: "当前身材选项不适用于选择的性别"
  },
  en: {
    bathTowelMaleOnly: "Only male characters can select the bath towel bottom.",
    onePieceBottomLocked: "One-piece or bath-towel tops already include bottoms; bottom_style must be set to none.",
    bodyTypeMismatch: "Current body type option is not applicable for the selected gender."
  }
} as const;

type SupportedLang = keyof typeof SCHEMA_MESSAGES;

export function createChoicesSchema(lang: SupportedLang = "zh") {
  const messages = SCHEMA_MESSAGES[lang] ?? SCHEMA_MESSAGES.zh;
  return baseChoicesSchema.superRefine((data, ctx) => {
    const gender = data.gender ?? "female";
    const topIncludesBottom = Boolean(TOP_STYLE_HAS_BOTTOM[data.top_style]);
    const isTopBathTowel = data.top_style === "bath_towel";
    const isBottomBathTowel = data.bottom_style === "bath_towel";

    if (isBottomBathTowel && gender !== "male") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bottom_style"],
        message: messages.bathTowelMaleOnly
      });
    }

    if ((topIncludesBottom || isTopBathTowel) && data.bottom_style !== "none") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bottom_style"],
        message: messages.onePieceBottomLocked
      });
    }

    const isFemaleType = FEMALE_BODY_TYPE.includes(data.body_type as any);
    const isMaleType = MALE_BODY_TYPE.includes(data.body_type as any);

    if (gender === "male" && !isMaleType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body_type"],
        message: messages.bodyTypeMismatch
      });
    }

    if (gender === "female" && !isFemaleType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body_type"],
        message: messages.bodyTypeMismatch
      });
    }

  });
}

export const choicesSchema = createChoicesSchema();
export type Choices = z.infer<typeof baseChoicesSchema>;