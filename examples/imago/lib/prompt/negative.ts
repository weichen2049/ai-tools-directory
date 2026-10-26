import { Choices } from "@lib/schema";
import { POSE_MAP, isHosieryConcealingBottom } from "@lib/prompt/constants";

export function buildForbiddenElements(
  c: Choices,
  hasReference: boolean
): string[] {
  const poseDef = POSE_MAP[c.pose];
  const critical: string[] = [
    "text",
    "watermark",
    "logo"
  ];
  const contextual: string[] = [];
  const cosmetic: string[] = [];

  if (!poseDef.excludeLegsInIntent) {
    critical.push("legs cropped out of frame", "legs obscured");
  }

  if (hasReference && !c.bare_leg && c.hosiery_color !== "random") {
    const selectedColor = c.hosiery_color;
    const forbiddenColors = ["black", "gray", "white", "brown"].filter(color => color !== selectedColor);
    forbiddenColors.forEach(color => {
      contextual.push(`${color} hosiery`, `${color} pantyhose`);
    });
  }

  if (!c.bare_leg && (c.hosiery_type === "ankle_sock" || c.hosiery_type === "knee_high" || c.hosiery_type === "calf_sock")) {
    critical.push(
      "pantyhose",
      "thigh-high stockings",
      "garter stockings",
      "garter belt",
      "full-length hosiery",
      "cotton socks"
    );
    if (c.hosiery_type === "ankle_sock") {
      critical.push("knee-high socks", "calf socks");
    }
    if (c.hosiery_type === "calf_sock") {
      critical.push("knee-high socks");
    }
  }

  if (!c.bare_leg && (c.hosiery_type === "pantyhose" || c.hosiery_type === "thigh_high" || c.hosiery_type === "garter")) {
    critical.push("ankle socks", "calf socks", "bare calves", "bare thighs");
  }

  if (poseDef.excludeLegsInIntent) {
    critical.push(
      "legs visible",
      "feet visible",
      "shoes visible",
      "full body framing"
    );
  }

  const gender = c.gender || "female";
  if (c.bare_leg) {
    critical.push(
      "pantyhose",
      "stockings",
      "fishnet",
      "hosiery",
      "tights",
      "nylons",
      "thigh-highs",
      "knee-highs",
      "garter belt"
    );
  }

  if (c.style_mode === "mobile_front") {
    contextual.push(
      "clear focus on face",
      "intentional composition",
      "flattering angle",
      "well-lit face",
      "smooth skin",
      "professional quality",
      "perfect lighting",
      "sharp image",
      "visible selfie phone",
      "phone visible"
    );
  }

  if (c.mood === "ahegao") {
    contextual.push("eyes looking straight ahead", "pupils centered", "gaze aligned with camera");
  }

  if (c.style_mode === "studio_elegant") {
    contextual.push(
      "visible blemishes",
      "acne marks",
      "pronounced wrinkles",
      "harsh shadows",
      "flat lighting",
      "chapped lips",
      "outdoor backgrounds",
      "distorted proportions",
      "motion blur",
      "digital noise"
    );
  }

  if (c.style_mode === "mirror_selfie") {
    critical.push("extra hands in reflection", "phone held by someone else");
  }
  if (c.style_mode === "mirror_selfie" || c.style_mode === "mobile_front" || c.style_mode === "rough_street_snap") {
    contextual.push("background blur", "portrait-mode blur", "artificial bokeh", "shallow depth of field", "blurred background", "out of focus background");
  }
  if (c.style_mode === "pov_interaction") {
    critical.push(
      "tripod-stable framing",
      "wide establishing shot",
      "visible selfie phone",
      "studio backdrop",
      "beauty-filter smoothing",
      "floating disembodied camera angle"
    );
  }

  if (c.top_style === "jk_uniform") {
    contextual.push("all-white JK uniform", "pure white school uniform");
  }

  if (c.pose === "dorm_mirror_forward") {
    contextual.push("seated pose", "kneeling pose", "crouching position", "sitting on floor");
  }
  if (c.pose === "pov_kneel_lookup") {
    critical.push("eye-level perspective", "camera at subject height", "viewer standing at equal height");
  }
  if (c.pose === "peace_sign" && c.style_mode === "mobile_front") {
    contextual.push("phone visible");
  }

  if (isHosieryConcealingBottom(c.bottom_style) && !poseDef.excludeLegsInIntent) {
    contextual.push("cropped trousers", "rolled-up pants", "short shorts");
  }
  if (c.bottom_style === "yoga_leggings" && !poseDef.excludeLegsInIntent) {
    contextual.push("knee-length leggings", "bike shorts");
  }
  if (c.hosiery_type === "pantyhose") {
    contextual.push(
      "thigh-high stockings",
      "thigh-high bands",
      "upper thigh bare skin where hosiery ends",
      "stocking tops with garter clips",
      "any visual cue of thigh-high hosiery",
      "visible hosiery termination line on the upper thigh",
      "hosiery edge implying a separate stocking rather than a continuous pantyhose",
      "bare thigh gap between hosiery and garment hem"
    );
  }

  if (c.bare_makeup) {
    cosmetic.push(
      "heavy eyeshadow",
      "exaggerated eyeliner",
      "false eyelashes",
      "bold lipstick colors",
      "obvious blush",
      "glittery highlighter"
    );
  }

  if (c.glasses_style !== "none") {
    if (c.glasses_style === "metal_rimless") {
      cosmetic.push(
        "full-frame glasses",
        "semi-rimless glasses",
        "half-frame glasses",
        "rimmed glasses",
        "framed eyeglasses",
        "acetate frame glasses",
        "plastic frame glasses"
      );
    } else if (c.glasses_style === "semi_rimless") {
      cosmetic.push(
        "full-frame glasses",
        "rimless glasses",
        "completely frameless glasses"
      );
    } else if (c.glasses_style === "gold_wire_frame") {
      cosmetic.push(
        "rimless glasses",
        "semi-rimless glasses",
        "half-frame glasses"
      );
    } else if (c.glasses_style === "full_frame") {
      cosmetic.push(
        "rimless glasses",
        "semi-rimless glasses",
        "half-frame glasses",
        "completely frameless glasses"
      );
    } else if (c.glasses_style === "aviator_sunglasses") {
      cosmetic.push(
        "rimless glasses",
        "semi-rimless glasses",
        "full-frame glasses",
        "gold wire-frame glasses",
        "cat-eye sunglasses",
        "regular eyeglasses"
      );
    } else if (c.glasses_style === "cat_eye_sunglasses") {
      cosmetic.push(
        "rimless glasses",
        "semi-rimless glasses",
        "full-frame glasses",
        "gold wire-frame glasses",
        "aviator sunglasses",
        "regular eyeglasses"
      );
    }
  }

  return [...critical, ...contextual, ...cosmetic];
}

export function buildForbiddenStyle(c: Choices): string[] {
  const forbiddenStyle = [
    "anime",
    "illustration",
    "painting",
    "3d render",
    "lowres",
    "bad anatomy",
    "plastic skin"
  ];

  if (c.style_mode !== "studio_elegant") {
    forbiddenStyle.push(
      "polished",
      "studio lighting",
      "high contrast",
      "retouched"
    );
  }

  if (c.style_mode === "mobile_front") {
    forbiddenStyle.push(
      "professional quality",
      "perfect lighting",
      "studio lighting setup",
      "beauty-filter smoothing",
      "airbrushed skin"
    );
  }

  return forbiddenStyle;
}