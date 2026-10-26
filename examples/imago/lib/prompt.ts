import { Choices } from "@lib/schema";
import {
  MOBILE_FRONT_FOOTWEAR_OVERRIDES,
  MOBILE_FRONT_MOOD_OVERRIDES,
  MOOD_MAP,
  POSE_MAP,
  POSE_MAP_MALE,
  BODY_PART_FOCUS_MAP,
  BODY_PART_FOCUS_MAP_MALE,
  STYLE_MODE_MAP,
  STYLE_MODE_MAP_MALE,
  TOP_STYLE_INTEGRATED_BOTTOM,
  SCENE_DESCRIPTION_MAP,
  MOBILE_FRONT_SCENE_DESCRIPTION_MAP
} from "@lib/prompt/constants";
import {
  buildSubjectDescription,
  describeAttireHighlight,
  describeTop,
  describeBottom,
  describeFootwear,
  describeHair,
  describeHosiery,
  describeLighting,
  describeMakeup,
  describeAccessories,
  describePhoneHold
} from "@lib/prompt/describers";
import { buildForbiddenElements, buildForbiddenStyle } from "@lib/prompt/negative";
import { buildMaterialFidelity, buildAestheticControls } from "@lib/prompt/aesthetic";

const ASPECT_RATIO_MAP: Record<Choices["aspect_ratio"], string> = {
  "1:1": "Keep a balanced square crop",
  "4:3": "Use 4:3 framing to leave breathing room around the figure",
  "3:4": "3:4 portrait framing suited for head-to-toe views",
  "16:9": "16:9 wide framing emphasizing the surroundings",
  "9:16": "9:16 portrait framing suited for full-body coverage"
};


function filterLegReferences(text: string): string {
  const legPatterns = [
    /\blegs?\b/gi,  // match "leg" or "legs" (whole word)
    /\bleg\s+lines?\b/gi,
    /\bleg\s+length\b/gi,
    /\bleg\s+focus\b/gi,
    /\bfull-height\s+leg\s+lines?\b/gi,
    /\bleaving\s+space\s+for\s+legs\b/gi,
    /\bhighlighting\s+leg\s+lines?\b/gi,
    /\bwith\s+legs\b/gi,
    /\blegs?\s+reaching\b/gi,
    /\blegs?\s+as\s+the\s+focal\s+line\b/gi,
    /\bstretching\s+the\s+leg\s+line\b/gi,
    /\bexaggerating\s+calf\s+length\b/gi,
    /\bhighlighting\s+layered\s+leg\s+lines\s+and\s+proportions\b/gi,
    /\bparallel\s+to\s+the\s+legs\b/gi,
    /\bhighlighting\s+knee\s+lines\b/gi,
    /\bleg\s+tension\b/gi,
    /\bcalf\s+texture\b/gi,
    /\bshowcasing\s+hosiery\s+and\s+leg\s+lines\b/gi,
    /\bleg-focused\b/gi,
    /\bleg-focused\s+close-up\b/gi,
    /\bthe\s+legs?\b/gi,
    /\bfront\s+leg\b/gi,
    /\bsupporting\s+leg\b/gi,
    /\braised\s+leg\b/gi,
    /\bboth\s+legs\b/gi,
    /\bextend\s+both\s+legs\b/gi,
    /\bforward\s+leg\b/gi
  ];

  let filtered = text;
  legPatterns.forEach(pattern => {
    filtered = filtered.replace(pattern, '');
  });

  filtered = filtered.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').replace(/\.\s*\./g, '.').replace(/,\s*\./g, '.').trim();

  return filtered;
}

export function buildPrompt(c: Choices, hasReference = false) {

  const gender = c.gender || "female";
  const styleMap = gender === "male"
    ? (STYLE_MODE_MAP_MALE[c.style_mode] || STYLE_MODE_MAP[c.style_mode])
    : STYLE_MODE_MAP[c.style_mode];
  const style = styleMap;

  const basePoseDef = POSE_MAP[c.pose];
  const malePoseOverride = gender === "male" ? POSE_MAP_MALE[c.pose] : undefined;
  const poseDef = malePoseOverride
    ? { ...basePoseDef, ...malePoseOverride }
    : basePoseDef;
  const lowerBodyOutOfFrame = poseDef.excludeLegsInIntent ?? false;
  const isBodyCloseup = c.style_mode === "body_part_closeup";
  const baseBodyPartFocus = isBodyCloseup ? BODY_PART_FOCUS_MAP[c.pose] : undefined;
  const maleBodyPartOverride = (isBodyCloseup && gender === "male") ? BODY_PART_FOCUS_MAP_MALE[c.pose] : undefined;
  const bodyPartFocus = maleBodyPartOverride
    ? { ...baseBodyPartFocus, ...maleBodyPartOverride }
    : baseBodyPartFocus;

  let aspectNote = ASPECT_RATIO_MAP[c.aspect_ratio];
  if (c.style_mode === "mobile_front") {
    if (c.aspect_ratio === "9:16") {
      aspectNote = "9:16 portrait framing, typically showing upper body and face, tight framing typical of front-camera selfies";
    } else if (c.aspect_ratio === "3:4") {
      aspectNote = "3:4 portrait framing, showing upper body and face, typical front-camera selfie framing";
    }
  }

  if (poseDef.camera?.framing) {
    aspectNote = `${poseDef.camera.framing} (maintain ${c.aspect_ratio} ratio). ${aspectNote} `;
  }
  if (lowerBodyOutOfFrame) {
    aspectNote = filterLegReferences(aspectNote);
  }
  if (isBodyCloseup && bodyPartFocus?.cropNote) {
    aspectNote = `${aspectNote} Macro crop excludes the face entirely—${bodyPartFocus.cropNote} `;
  }
  const phoneHold = describePhoneHold(c.style_mode, c.aspect_ratio);
  const cameraVantage = lowerBodyOutOfFrame ? filterLegReferences(poseDef.camera.vantage) : poseDef.camera.vantage;
  const cameraFraming = lowerBodyOutOfFrame ? filterLegReferences(poseDef.camera.framing) : poseDef.camera.framing;

  const topResult = describeTop(c, hasReference);
  const baseTopDescription = topResult.top;
  let topDescription: string | undefined = baseTopDescription;
  let bottomDescription: string | undefined = describeBottom(c, hasReference);
  let hosieryDescription: string | undefined = describeHosiery(c, hasReference);
  let footwearDescription: string | undefined = describeFootwear(c, hasReference);
  let hair: string | undefined = describeHair(c, c.style_mode, hasReference);
  const integratedSet = TOP_STYLE_INTEGRATED_BOTTOM[c.top_style];

  let mood = MOOD_MAP[c.mood];

  if (isBodyCloseup) {
    mood = {
      mood: "No facial expression is visible",
      action: "Frame must stop before the chin; never reveal eyes, mouth, or brows."
    };
  }

  if (c.style_mode === "rough_street_snap") {
    mood = {
      mood: `${mood.mood}.Natural, candid expression—slightly distracted or subtly reactive to the environment`,
      action: `${mood.action}. Avoid overly posed or exaggerated facial expressions; keep it spontaneous`
    };
  }

  if (c.style_mode === "mobile_front") {
    const mobileMood = MOBILE_FRONT_MOOD_OVERRIDES[c.mood];
    if (mobileMood) {
      mood = mobileMood;
    } else {
      mood = {
        mood: "Soft everyday expression with zero posing",
        action: "Keep the expression natural and unposed, as if caught in a casual moment"
      };
    }
    if (c.footwear_style === "barefoot") {
      footwearDescription = c.bare_leg
        ? "Bare feet kept casually tidy without deliberate posing"
        : "No shoes; the hosiery just ends plainly at the toes";
    } else {
      footwearDescription = MOBILE_FRONT_FOOTWEAR_OVERRIDES[c.footwear_style] ?? footwearDescription;
    }
  }


  let poseLine = poseDef.poseLine;
  const phoneContext = c.style_mode === "mirror_selfie" || c.style_mode === "mobile_front";
  if (phoneContext && poseDef.phonePoseLine) {
    poseLine = poseDef.phonePoseLine;
  }

  const COLLARED_TOPS = ["mens_suit", "womens_suit", "button_down_shirt", "jk_uniform"];
  if (c.pose === "tie_adjust") {
    const hasCollaredShirt = COLLARED_TOPS.includes(c.top_style);
    if (!hasCollaredShirt) {
      poseLine = "Touching the neck or throat area with one hand in a casual, thoughtful gesture, slightly flushed expression";
    }
  }
  if (c.pose === "shirt_pull") {
    const hasTop = c.top_style !== "none" && c.top_style !== "bath_towel";
    if (!hasTop) {
      poseLine = "Hooking one thumb casually into the waistband of the lower garment, showcasing the torso line, intense gaze";
    }
  }

  if (lowerBodyOutOfFrame) {
    poseLine = filterLegReferences(poseLine);
  }
  if (hasReference) {
    poseLine = `Change the reference pose to: ${poseLine} `;
  }


  if (lowerBodyOutOfFrame) {
    bottomDescription = undefined;
    hosieryDescription = undefined;
    footwearDescription = undefined;
  } else if (integratedSet) {
    bottomDescription = integratedSet.bottom;
  }
  if (isBodyCloseup) {
    const showTop = bodyPartFocus?.visibleTop ?? false;
    const showBottom = bodyPartFocus?.visibleBottom ?? false;
    const showHosiery = bodyPartFocus?.visibleHosiery ?? false;
    const showFootwear = bodyPartFocus?.visibleFootwear ?? false;
    topDescription = showTop ? baseTopDescription : undefined;
    bottomDescription = showBottom ? bottomDescription : undefined;
    hosieryDescription = showHosiery ? hosieryDescription : undefined;
    footwearDescription = showFootwear ? footwearDescription : undefined;
    hair = undefined;
  }

  const attireNotes = describeAttireHighlight(c, footwearDescription, lowerBodyOutOfFrame, integratedSet, hasReference);
  const legPose = lowerBodyOutOfFrame ? undefined : poseDef.legFocus;

  let makeup = describeMakeup(c, style, hasReference);

  let accessories = describeAccessories(c, hasReference);

  const EARRINGS_VISIBLE_POSES = ["closeup_neck", "closeup_chest"];
  const NECK_BODY_VISIBLE_POSES = ["closeup_neck", "closeup_chest", "closeup_waist", "closeup_abdomen", "closeup_back"];
  const HAIR_CLIP_VISIBLE_POSES = ["closeup_neck", "closeup_back"];

  if (isBodyCloseup) {
    makeup = {
      style: "Facial makeup never appears; only the skin prep on the featured body part matters",
      complexion: "Render macro-level skin texture with pores, fine hairs, and natural tone variation",
      cheeks: undefined,
      lips: undefined
    };
    const hairClipVisible = HAIR_CLIP_VISIBLE_POSES.includes(c.pose);
    const earringsVisible = EARRINGS_VISIBLE_POSES.includes(c.pose);
    const neckBodyVisible = NECK_BODY_VISIBLE_POSES.includes(c.pose);
    accessories = {
      hair_clip: hairClipVisible ? (accessories.hair_clip || "No hair accessory present") : "Hair accessories not visible",
      earrings: earringsVisible ? (accessories.earrings || "Earrings not visible") : "Earrings not visible",
      neck_body_accessories: neckBodyVisible ? (accessories.neck_body_accessories || "Neck/body accessories not visible") : "Neck/body accessories not visible",
      glasses: "No eyewear is present"
    };
  }

  const handNotes: string | undefined = (() => {
    if (c.pose === "peace_sign" && c.style_mode === "mobile_front") {
      return "Mirrorless selfie: keep the phone out of frame—just show the relaxed peace sign near the face.";
    }
    if (c.pose === "peace_sign" && c.style_mode === "mirror_selfie") {
      return "In the mirror reflection, only the subject's own hand shows the peace sign; the phone stays outside the final composition.";
    }
    if (c.style_mode === "mirror_selfie") {
      return "Mirror selfie: the visible hand that appears in reflection must be the subject's own hand holding the phone—no extra hands.";
    }
    return undefined;
  })();

  const forbiddenElements = buildForbiddenElements(c, hasReference);
  const forbiddenStyle = buildForbiddenStyle(c);

  const renderIntent = lowerBodyOutOfFrame
    ? "Tight framing intentionally excludes the lower body, keeping attention on expression, torso, upper garments, and any first-person interaction cues."
    : style.renderIntent;

  let finalAttireNotes = poseDef.excludeLegsInIntent
    ? "Lower-body attire stays out of frame; keep focus on facial expression, torso posture, and visible upper garments."
    : attireNotes;
  if (isBodyCloseup) {
    const focusNotes = [
      bodyPartFocus?.focusArea ? `Focus zone: ${bodyPartFocus.focusArea} ` : "Focus zone: keep only the chosen body part inside the crop",
      bodyPartFocus?.cropNote,
      bodyPartFocus?.textureNote
    ]
      .filter(Boolean)
      .join(" ");
    finalAttireNotes =
      focusNotes.length > 0
        ? `${focusNotes} Macro lighting must reveal tactile detail—face remains excluded.`
        : "Macro framing isolates the selected body part with tactile realism; never reveal the face.";
  }

  const materialFidelity = buildMaterialFidelity(c);
  const aestheticControls = buildAestheticControls(c, renderIntent, materialFidelity);

  let customBasePrompt: string | undefined;
  let customDetailSegments: string[] | undefined;
  if (c.style_mode === "mobile_front") {
    const bottomSegment = lowerBodyOutOfFrame ? "Lower garments not visible in frame" : bottomDescription;
    const hosierySegment = lowerBodyOutOfFrame ? "Hosiery cropped out" : hosieryDescription;
    const footwearSegment = lowerBodyOutOfFrame ? "Footwear not captured" : footwearDescription;
    customBasePrompt =
      "Casual front-camera selfie that feels unplanned and everyday. Framing can be slightly clumsy and lighting imperfect, as if the phone captured a quick moment while being lifted. Keep the mood plain and ordinary without heavy styling, and never apply portrait-mode blur—the background behind the subject must stay sharp and in focus.";
    const topDescription = baseTopDescription;
    let wardrobeHeadline = `Wardrobe headline: ${topDescription}; ${bottomSegment}; ${hosierySegment}; ${footwearSegment} `;
    if (lowerBodyOutOfFrame) {
      wardrobeHeadline = filterLegReferences(wardrobeHeadline);
    }
    customDetailSegments = [
      `Hair: ${hair} `,
      `Expression & mood: ${mood.mood}; ${mood.action} `,
      `Pose reminder: ${poseLine} `,
      `Camera notes: ${cameraVantage}; ${cameraFraming} `,
      wardrobeHeadline,
      `Wardrobe detail: ${attireNotes} `,
      "Background: Keep the surroundings fully in focus—no computational blur, no artificial bokeh.",
      hasReference && makeup.style.startsWith("Replace")
        ? `Makeup: ${makeup.style} `
        : hasReference && makeup.style.startsWith("Change")
          ? `Makeup: ${makeup.style} `
          : `Makeup: ${[makeup.style, makeup.complexion, makeup.cheeks ?? "Natural cheeks", makeup.lips ?? "Natural lips"].filter(Boolean).join("; ")} `,
      hasReference && accessories.hair_clip?.startsWith("Replace")
        ? `Accessories: ${accessories.hair_clip} `
        : hasReference && (accessories.hair_clip?.startsWith("Change") || accessories.hair_clip?.startsWith("Remove"))
          ? `Accessories: ${accessories.hair_clip} `
          : (() => {
            const accessoryParts: string[] = [];
            if (accessories.hair_clip && accessories.hair_clip !== "none") {
              accessoryParts.push(`Hair accessory: ${accessories.hair_clip} `);
            }
            if (accessories.earrings && accessories.earrings !== "none") {
              accessoryParts.push(`Earrings: ${accessories.earrings} `);
            }
            if (accessories.glasses && accessories.glasses !== "none") {
              accessoryParts.push(`Glasses: ${accessories.glasses} `);
            }
            if (accessories.neck_body_accessories && accessories.neck_body_accessories !== "none") {
              accessoryParts.push(`Neck/Body: ${accessories.neck_body_accessories} `);
            }
            return accessoryParts.length > 0 ? `Accessories: ${accessoryParts.join("; ")} ` : "Accessories: none";
          })(),
      ...(handNotes ? [`Hands: ${handNotes} `] : []),
      "Technical realism: handheld realism, slight motion blur at edges, imperfect framing, visible pores, no beauty filter"
    ].filter(Boolean);
  } else if (c.style_mode === "rough_street_snap") {
    const bottomSegment = lowerBodyOutOfFrame ? "Lower garments not visible in frame" : bottomDescription;
    const hosierySegment = lowerBodyOutOfFrame ? "Hosiery cropped out" : hosieryDescription;
    const footwearSegment = lowerBodyOutOfFrame ? "Footwear not captured" : footwearDescription;

    customBasePrompt = "Candid street snapshot taken with a mobile phone from a middle distance. The vibe is spontaneous and raw, like a 'stolen' moment or a quick capture of everyday life. The subject is integrated into the busy street environment, not isolated. The composition is loose and imperfect, possibly slightly off-center or tilted. Realistic phone photography aesthetic with slight color inaccuracy and potential motion blur. The image should feel like a quick, unplanned shot—not a carefully composed photograph. Embrace imperfections: uneven exposure, slightly missed focus, or awkward framing.";

    const topDescription = baseTopDescription;
    let wardrobeHeadline = `Wardrobe headline: ${topDescription}; ${bottomSegment}; ${hosierySegment}; ${footwearSegment} `;
    if (lowerBodyOutOfFrame) {
      wardrobeHeadline = filterLegReferences(wardrobeHeadline);
    }
    customDetailSegments = [
      `Hair: ${hair} `,
      `Expression & mood: ${mood.mood}; ${mood.action} `,
      `Pose reminder: ${poseLine} `,
      `Camera notes: Mid - distance shot, subject in context, slight digital zoom feel`,
      wardrobeHeadline,
      `Wardrobe detail: ${attireNotes} `,
      "Background: Busy street scene with visible depth and detail—passersby, vehicles, signage, and urban clutter remain sharp and recognizable. No professional bokeh or background blur. The subject blends into the environment rather than standing out.",
      hasReference && makeup.style.startsWith("Replace")
        ? `Makeup: ${makeup.style} `
        : hasReference && makeup.style.startsWith("Change")
          ? `Makeup: ${makeup.style} `
          : `Makeup: ${[makeup.style, makeup.complexion, makeup.cheeks ?? "Natural cheeks", makeup.lips ?? "Natural lips"].filter(Boolean).join("; ")} `,
      hasReference && accessories.hair_clip?.startsWith("Replace")
        ? `Accessories: ${accessories.hair_clip} `
        : hasReference && (accessories.hair_clip?.startsWith("Change") || accessories.hair_clip?.startsWith("Remove"))
          ? `Accessories: ${accessories.hair_clip} `
          : (() => {
            const accessoryParts: string[] = [];
            if (accessories.hair_clip && accessories.hair_clip !== "none") {
              accessoryParts.push(`Hair accessory: ${accessories.hair_clip} `);
            }
            if (accessories.earrings && accessories.earrings !== "none") {
              accessoryParts.push(`Earrings: ${accessories.earrings} `);
            }
            if (accessories.glasses && accessories.glasses !== "none") {
              accessoryParts.push(`Glasses: ${accessories.glasses} `);
            }
            if (accessories.neck_body_accessories && accessories.neck_body_accessories !== "none") {
              accessoryParts.push(`Neck/Body: ${accessories.neck_body_accessories} `);
            }
            return accessoryParts.length > 0 ? `Accessories: ${accessoryParts.join("; ")} ` : "Accessories: none";
          })(),
      ...(handNotes ? [`Hands: ${handNotes} `] : []),
      "Technical realism: phone camera quality with slight chromatic aberration, imperfect white balance, candid framing with possible tilt or off-center composition, unposed feel, no professional depth-of-field blur"
    ].filter(Boolean);
  } else if (handNotes) {
    customDetailSegments = [`Hands: ${handNotes} `];
  }

  const environmentSettingParts = [style.environment];
  let sceneDescription = SCENE_DESCRIPTION_MAP[c.scene_location];
  if (c.style_mode === "mobile_front") {
    sceneDescription = MOBILE_FRONT_SCENE_DESCRIPTION_MAP[c.scene_location] ?? sceneDescription;
  }
  if (sceneDescription) {
    if (c.style_mode === "mirror_selfie") {
      const lowered = sceneDescription.charAt(0).toLowerCase() + sceneDescription.slice(1);
      environmentSettingParts.push(`Mirror reflection shows ${lowered} `);
    } else {
      environmentSettingParts.push(sceneDescription);
    }
  }
  if (c.pose === "dorm_floor_kneel") {
    environmentSettingParts.push("Camera stays low near the floor to follow the kneeling pose");
  }
  let environmentSetting = environmentSettingParts.filter(Boolean).join(". ");
  if (lowerBodyOutOfFrame) {
    environmentSetting = filterLegReferences(environmentSetting);
  }
  if (isBodyCloseup) {
    environmentSetting = `${environmentSetting}. Background stays abstracted into soft gradients so the macro body detail dominates.`;
  }

  const customSections: Record<string, unknown> = {};
  if (customBasePrompt) {
    customSections.custom_base_prompt = customBasePrompt;
  }
  if (customDetailSegments) {
    customSections.custom_detail_segments = customDetailSegments;
  }

  const promptCore = {
    pose_key: c.pose,
    style_mode: style.style_mode,
    gender: c.gender || "female",
    ethnicity: c.ethnicity || "random",
    look: style.look,
    camera: {
      vantage: cameraVantage,
      framing: cameraFraming,
      lens_behavior: poseDef.camera.lens_behavior ?? style.cameraLens,
      sensor_quality: style.cameraSensor,
      aspect_ratio: c.aspect_ratio,
      aspect_ratio_note: aspectNote,
      phone_hold: phoneHold
    },
    scene: {
      environment: {
        setting: environmentSetting,
        lighting: describeLighting(c.style_mode, c.lighting),
        scene_location: c.scene_location
      },
      subject: {
        description: buildSubjectDescription(c, c.style_mode, hasReference),
        body_type: c.body_type, // Raw body type mapping
        hair,
        expression: mood,
        makeup,
        attire: {
          ...(topDescription ? { top: topDescription } : {}),
          ...(bottomDescription ? { bottom: bottomDescription } : {}),
          ...(hosieryDescription ? { hosiery: hosieryDescription } : {}),
          ...(footwearDescription ? { footwear: footwearDescription } : {}),
          top_style: c.top_style,
          bottom_style: c.bottom_style,
          hosiery_type: c.hosiery_type,
          hosiery_material: c.hosiery_material,
          footwear_style: c.footwear_style
        },
        pose: poseLine,
        ...(legPose ? { leg_pose: legPose } : {}),
        attire_notes: finalAttireNotes,
        accessories,
        accessories_raw: {
          hair_clip: isBodyCloseup && !HAIR_CLIP_VISIBLE_POSES.includes(c.pose) ? "none" : c.hair_clip,
          earrings: isBodyCloseup && !EARRINGS_VISIBLE_POSES.includes(c.pose) ? "none" : c.earrings,
          glasses: isBodyCloseup ? "none" : c.glasses_style,
          neck_body_accessories:
            isBodyCloseup && !NECK_BODY_VISIBLE_POSES.includes(c.pose) ? "none" : c.neck_body_accessories
        },
        ...(handNotes ? { hand_notes: handNotes } : {})
      }
    },
    aesthetic_controls: aestheticControls,
    negative_prompt: {
      forbidden_elements: forbiddenElements,
      forbidden_style: forbiddenStyle
    }
  };

  return {
    ...promptCore,
    ...customSections
  };
}