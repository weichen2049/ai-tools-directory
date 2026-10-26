import { Choices } from "@lib/schema";
import { POSE_MAP } from "@lib/prompt/constants";

export function buildMaterialFidelity(
  c: Choices
): string[] {
  const poseDef = POSE_MAP[c.pose];

  if (c.style_mode === "mobile_front") {
    return [
      "Soft natural details typical of a phone front camera",
      "Natural skin texture without artificial smoothing or beautification",
      "Uneven lighting on skin and clothing, with small hotspots and dull regions",
      "Skin texture and facial features stay recognizable"
    ];
  }

  if (c.style_mode === "mirror_selfie") {
    return [
      "Phone camera texture with subtle noise and natural softness",
      "Skin shows visible pores but with phone-camera level clarity, not DSLR sharpness",
      "Slight bloom or haze from room lighting typical of casual mirror shots",
      "Hair and fabric look natural, not overly defined or studio-lit"
    ];
  }

  if (c.style_mode === "pov_interaction") {
    return [
      "Handheld phone quality with subtle motion blur at edges",
      "Natural skin texture with visible pores, not retouched or smoothed",
      "Warm natural lighting, not studio-controlled",
      "Slight imperfections in focus and framing, authentic handheld feel"
    ];
  }

  if (c.style_mode === "rough_street_snap") {
    return [
      "Natural texture visible throughout the image, documentary feel",
      "Flat focus with foreground and background equally sharp, no portrait blur",
      "Street lighting with mixed color temperatures, not color-corrected",
      "Candid imperfections: slight motion blur, awkward framing, real moment"
    ];
  }

  if (c.style_mode === "body_part_closeup") {
    return [
      "Macro-level skin detail with visible pores, imperfections, and natural texture",
      "No smoothing or retouching, zero beautification",
      "Fabric weave and material texture clearly visible",
      "Natural lighting with realistic shadows"
    ];
  }

  let materialFidelity = [
    "Skin texture stays detailed with visible pores and controlled highlights, never plastic-smooth",
    "Hair strands show layered specular highlights and individual flyaways",
    "Fabric weave is crisp and recognizable without over-sharpening",
    "Accessory metals reflect light accurately with natural micro-scratches and dulling"
  ];

  if (!poseDef.excludeLegsInIntent) {
    materialFidelity.push("Leg contours stay sharp with hosiery texture and perceived thickness clearly visible from hip to toe, without depth-of-field blur");
  }

  return materialFidelity;
}

export function buildAestheticControls(
  c: Choices,
  renderIntent: string,
  materialFidelity: string[]
) {
  let colorGrade: { overall: string; contrast: string };

  if (c.style_mode === "mobile_front") {
    colorGrade = {
      overall: "Natural, uncalibrated phone camera color profile with possible slight white-balance shifts, no stylized filters or cinematic grading.",
      contrast: "Variable contrast, with some areas slightly overexposed and others flat."
    };
  } else if (c.style_mode === "mirror_selfie") {
    colorGrade = {
      overall: "Casual phone camera colors, warm indoor tint, no professional color correction.",
      contrast: "Medium contrast typical of phone sensors, not cinematic or graded."
    };
  } else if (c.style_mode === "pov_interaction") {
    colorGrade = {
      overall: "Warm natural tones, intimate lighting feel, not professionally lit.",
      contrast: "Soft natural contrast, avoid dramatic shadows or highlights."
    };
  } else if (c.style_mode === "rough_street_snap") {
    colorGrade = {
      overall: "Mixed street lighting colors, uncorrected white balance, documentary authenticity.",
      contrast: "Flat phone camera contrast, not cinematic, embrace the raw look."
    };
  } else {
    colorGrade = {
      overall: "Neutral-to-warm skin tone with clean clarity",
      contrast: "Brisk highlights and full-bodied midtones avoiding any haze"
    };
  }

  return {
    render_intent: renderIntent,
    material_fidelity: materialFidelity,
    color_grade: colorGrade
  };
}