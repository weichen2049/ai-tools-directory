import { Choices } from "@lib/schema";
import type { StyleMode } from "@lib/options";
import {
    BOTTOM_STYLE_MAP,
    EARRING_MAP,
    GLASSES_STYLE_MAP,
    FOOTWEAR_STYLE_MAP,
    HAIR_CLIP_MAP,
    HAIR_COLOR_MAP,
    HAIR_STYLE_MAP,
    HOSIERY_PEEK_REFERENCES,
    LIGHTING_DESCRIPTIONS,
    MAKEUP_STYLE_INTENSITY_MAP,
    MOBILE_FRONT_HAIR_OVERRIDES,
    NECK_BODY_ACCESSORIES_MAP,
    STYLE_MODE_MAP,
    TOP_STYLE_INTEGRATED_BOTTOM,
    TOP_STYLE_MAP,
    isHosieryConcealingBottom
} from "@lib/prompt/constants";
import { buildColorPrefix, buildHosieryTextForAttire } from "./hosiery";
import { wrapForReference } from "./utils";

export function describeFootwear(c: Choices, hasReference = false): string {
    if (c.footwear_style !== "barefoot") {
        const footwearDescription = FOOTWEAR_STYLE_MAP[c.footwear_style];
        return hasReference ? wrapForReference(footwearDescription, "footwear") : footwearDescription;
    }
    const bareFootDescription = c.bare_leg
        ? "Bare feet with neat grooming"
        : "No shoes so the hosiery alone defines the foot shape";
    return hasReference ? wrapForReference(bareFootDescription, "footwear") : bareFootDescription;
}

export function describeTop(c: Choices, hasReference = false): { top: string; details: string } {
    const topStyleMap = TOP_STYLE_MAP[c.top_style];
    const gender = c.gender || "female";

    let top: { top: string; details: string };
    if (c.top_style === "none") {
        if (gender === "male") {
            top = {
                top: "No upper garment, bare chest and torso",
                details: "Completely topless, no shirt or any upper clothing"
            };
        } else {
            top = {
                top: "No upper garment, wearing only undergarments",
                details: "No outer top layer, only undergarments visible on the upper body"
            };
        }
    } else if (c.top_style === "bath_towel") {
        if (gender === "male") {
            top = {
                top: "Bath towel casually wrapped around the waist after a shower",
                details: "Thick cotton towel tied securely around the waist, covering from the hip to just above the knees. Upper body is bare, skin still slightly damp, towel edges folded naturally with visible texture. Post-shower realism emphasized—no clothing, jewelry, or accessories."
            };
        } else if (gender === "agender") {
            top = {
                top: "Large bath towel wrapped around the torso after a shower",
                details: "Thick, soft cotton towel draped and secured around the upper body, covering from just below the shoulders to mid-thigh. The towel appears slightly damp with a natural fold and weight, creating a relaxed post-shower impression. No visible clothing, accessories, or styling—focus on the texture of the fabric and the clean, fresh atmosphere."
            };
        } else {
            top = {
                top: "Soft bath towel loosely wrapped around the body after a shower",
                details: "Thick cotton towel wrapped across the chest and under the arms, covering from the upper chest down to mid-thigh. The towel is slightly textured and damp, clinging lightly to the body contours but maintaining full coverage. Shoulders and collarbones are exposed, conveying a natural post-shower look without accessories or undergarments."
            };
        }
    } else {
        top = topStyleMap;
    }

    if (hasReference) {
        return {
            top: wrapForReference(top.top, "upper garment"),
            details: top.details
        };
    }

    return top;
}

export function describeBottom(c: Choices, hasReference = false): string {
    const integrated = TOP_STYLE_INTEGRATED_BOTTOM[c.top_style];
    if (integrated) {
        const bottomDescription = integrated.bottom;
        return hasReference ? wrapForReference(bottomDescription, "bottom garment") : bottomDescription;
    }
    if (c.top_style === "one_piece_swimsuit" && c.bottom_style === "none") {
        const swimsuitBottom = "One-piece swimsuit extending from the torso down to cover the hips and upper thighs, forming a single continuous garment with no separate bottom layer";
        return hasReference ? wrapForReference(swimsuitBottom, "bottom garment") : swimsuitBottom;
    }
    if (c.bottom_style === "none") {
        const noneDescription = c.bare_leg
            ? "No outer bottom garment, only coordinated lingerie with minimal coverage"
            : "No additional bottom layer, showcasing the hosiery alone";
        return hasReference ? wrapForReference(noneDescription, "bottom garment") : noneDescription;
    }
    if (c.bottom_style === "bath_towel") {
        const bottomDescription = "Bath towel casually wrapped around the waist after a shower. Thick cotton towel tied securely around the waist, covering from the hip to just above the knees. Upper body is bare, skin still slightly damp, towel edges folded naturally with visible texture. Post-shower realism emphasized—no clothing, jewelry, or accessories.";
        return hasReference ? wrapForReference(bottomDescription, "bottom garment") : bottomDescription;
    }
    if (isHosieryConcealingBottom(c.bottom_style)) {
        let text = BOTTOM_STYLE_MAP[c.bottom_style];
        if (c.bottom_style === "yoga_leggings") {
            text += " Pick a tonal shade other than pure black so the leggings feel distinct from the hosiery.";
        }
        if (!c.bare_leg) {
            const hemReference = HOSIERY_PEEK_REFERENCES[c.bottom_style];
            text += `. The legs stay fully covered; allow only a slim hint of hosiery to appear below ${hemReference} naturally.`;
        }
        return hasReference ? wrapForReference(text, "bottom garment") : text;
    }
    const bottomDescription = BOTTOM_STYLE_MAP[c.bottom_style];
    return hasReference ? wrapForReference(bottomDescription, "bottom garment") : bottomDescription;
}

export function describeAttireHighlight(
    c: Choices,
    footwearText: string | undefined,
    lowerBodyOutOfFrame = false,
    integratedInfo?: { bottom: string; highlight: string },
    hasReference = false
): string {
    if (lowerBodyOutOfFrame) {
        const top = TOP_STYLE_MAP[c.top_style]?.top ?? "upper garment";
        return [
            "Attire focus: framing stays on the face and upper torso.",
            `Only a subtle suggestion of the ${top} might enter the shot; hosiery and footwear remain completely out of frame.`
        ].join(" ");
    }

    const hosieryInfo = buildHosieryTextForAttire(c, hasReference);
    const finishNote = hosieryInfo.finish ? `, ${hosieryInfo.finish}` : "";
    const hosieryPhrase = `${hosieryInfo.text}${finishNote}`.trim();
    const footwearPhrase = footwearText?.trim() ?? "";

    if (integratedInfo) {
        const segments: string[] = [
            `Integrated set: ${integratedInfo.highlight.trim()}`
        ];
        if (hosieryPhrase.length > 0) segments.push(`Hosiery: ${hosieryPhrase}`);
        if (footwearPhrase.length > 0) segments.push(`Footwear: ${footwearPhrase}`);
        const summary = segments
            .map((segment) => segment.replace(/\s+/g, " ").trim())
            .filter((segment) => segment.length > 0)
            .map((segment) => (/[.!?]$/.test(segment) ? segment : `${segment}.`))
            .join(" ");
        if (c.style_mode === "mobile_front") {
            return `Attire note: only fragments of the outfit appear in the selfie; ${summary}`;
        }
        return `Attire highlight: ${summary}`;
    }

    const baseDescription =
        footwearPhrase.length > 0
            ? `${hosieryPhrase}, paired with ${footwearPhrase}`
            : hosieryPhrase;

    if (c.style_mode === "mobile_front") {
        return `Attire note: only fragments of the outfit are visible in the front-camera selfie; ${baseDescription}`;
    }
    return `Attire highlight: ${baseDescription}`;
}

export function describePhoneHold(
    style: Choices["style_mode"],
    ratio: Choices["aspect_ratio"]
) {
    if (style !== "mirror_selfie") return undefined;
    if (ratio === "1:1") return "Hold the phone with both hands at chest height to keep a balanced 1:1 frame";
    if (ratio === "3:4" || ratio === "9:16") {
        return `Hold the phone VERTICALLY (portrait orientation) near the mirror so the frame stays ${ratio} portrait. The phone must be held upright, not rotated`;
    }
    return `Hold the phone HORIZONTALLY (landscape orientation) against the mirror to maintain the ${ratio} landscape ratio. The phone must be rotated 90 degrees sideways, with the longer edge horizontal`;
}

const DEFAULT_STYLE_MAKEUP = {
    makeupStyle: "Soft everyday makeup emphasizing believable detail and human warmth",
    complexion: "Skin retains visible pores, micro shine, and subtle imperfections for realism"
};

export function describeMakeup(c: Choices, styleDescriptor?: (typeof STYLE_MODE_MAP)[Choices["style_mode"]], hasReference = false) {
    const style = styleDescriptor ?? STYLE_MODE_MAP[c.style_mode] ?? DEFAULT_STYLE_MAKEUP;
    let makeupObj: {
        style: string;
        complexion: string;
        cheeks: string | undefined;
        lips: string | undefined;
    };

    if (c.bare_makeup) {
        makeupObj = {
            style: "Bare-faced with no color cosmetics",
            complexion: "Skincare-only finish showing natural pores and subtle imperfections",
            cheeks: "Blush-free",
            lips: "Natural lip tone with only moisturizing sheen"
        };
    } else {
        const makeupKey = `${c.makeup_style}_${c.makeup_intensity}` as `${Choices["makeup_style"]}_${Choices["makeup_intensity"]}`;
        const makeupLook = MAKEUP_STYLE_INTENSITY_MAP[makeupKey];
        const fallbackLook = MAKEUP_STYLE_INTENSITY_MAP["natural_medium"];
        const finalLook = makeupLook || fallbackLook;

        let styleDescription = style.makeupStyle ?? DEFAULT_STYLE_MAKEUP.makeupStyle;
        if (styleDescription.toLowerCase().includes("no makeup")) {
            styleDescription = "Applies makeup styling as specified";
        }

        makeupObj = {
            style: styleDescription,
            complexion: style.complexion ?? DEFAULT_STYLE_MAKEUP.complexion,
            cheeks: finalLook.cheeks,
            lips: finalLook.lips
        };
    }

    if (hasReference) {
        const makeupDescription = [
            makeupObj.style,
            makeupObj.complexion,
            makeupObj.cheeks,
            makeupObj.lips
        ]
            .filter(Boolean)
            .join("; ");
        return {
            style: `Change the makeup in the reference image to ${makeupDescription}`,
            complexion: "",
            cheeks: undefined,
            lips: undefined
        };
    }

    return makeupObj;
}

export function describeAccessories(c: Choices, hasReference = false) {
    const hairClip = HAIR_CLIP_MAP[c.hair_clip];
    const earrings = EARRING_MAP[c.earrings];
    const neckBodyKey = c.neck_body_accessories || "none";
    const neckBody = NECK_BODY_ACCESSORIES_MAP[neckBodyKey];
    const glasses = GLASSES_STYLE_MAP[c.glasses_style];

    if (hasReference) {
        const accessoriesList: string[] = [];
        if (c.hair_clip && c.hair_clip !== "none") {
            accessoriesList.push(`hair accessory: ${hairClip}`);
        }
        if (c.earrings && c.earrings !== "none") {
            accessoriesList.push(`earrings: ${earrings}`);
        }
        if (neckBodyKey !== "none") {
            accessoriesList.push(`neck/body accessories: ${neckBody}`);
        }
        if (c.glasses_style && c.glasses_style !== "none") {
            accessoriesList.push(`glasses: ${glasses}`);
        }

        if (accessoriesList.length > 0) {
            return {
                hair_clip: `Change the accessories in the reference image to ${accessoriesList.join("; ")}`,
                earrings: undefined,
                neck_body_accessories: undefined,
                glasses: undefined
            };
        }

        return {
            hair_clip: "Remove all accessories from the reference image",
            earrings: undefined,
            neck_body_accessories: undefined,
            glasses: undefined
        };
    }

    return {
        hair_clip: c.hair_clip !== "none" ? hairClip : undefined,
        earrings: c.earrings !== "none" ? earrings : undefined,
        neck_body_accessories: neckBodyKey !== "none" ? neckBody : undefined,
        glasses: c.glasses_style !== "none" ? glasses : undefined
    };
}


export function describeHair(
    c: Choices,
    styleMode: Choices["style_mode"],
    hasReference = false
): string {
    let hairStyle = HAIR_STYLE_MAP[c.hair_style];
    if (styleMode === "mobile_front") {
        hairStyle = MOBILE_FRONT_HAIR_OVERRIDES[c.hair_style] ?? hairStyle;
    }

    if (c.hair_color && c.hair_color !== "random") {
        const hairColor = HAIR_COLOR_MAP[c.hair_color];
        if (hasReference) {
            const weightedHair = `(${hairColor} ${hairStyle}:2.0)`;
            const repeatedHair = `${hairColor} ${hairStyle} ${hairColor} ${hairStyle} ${hairColor} ${hairStyle}`;
            const hairDescription = `${weightedHair} ${repeatedHair}`;
            return `${wrapForReference(hairDescription, "hair")}. The reference image's hair style and color must be completely ignored and replaced.`;
        }
        return `${hairColor} ${hairStyle}`;
    }

    if (hasReference) {
        const weightedStyle = `(${hairStyle}:2.0)`;
        const repeatedStyle = `${hairStyle} ${hairStyle} ${hairStyle} ${hairStyle}`;
        const hairDescription = `${weightedStyle} ${repeatedStyle}`;
        return `${wrapForReference(hairDescription, "hair")}. The reference image's hair style must be completely ignored and replaced.`;
    }

    return hairStyle;
}

export function describeLighting(style: StyleMode, lighting: Choices["lighting"]) {
    const map = LIGHTING_DESCRIPTIONS[style];
    return map[lighting] ?? map.soft_beauty ?? Object.values(map)[0] ?? "Natural lighting";
}