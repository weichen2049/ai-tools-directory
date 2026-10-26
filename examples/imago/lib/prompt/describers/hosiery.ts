import { Choices } from "@lib/schema";
import {
    BOTTOM_STYLE_MAP,
    HOSIERY_COLOR_MAP,
    HOSIERY_MATERIAL_MAP,
    HOSIERY_PEEK_REFERENCES,
    HOSIERY_TYPE_MAP,
    isHosieryConcealingBottom
} from "@lib/prompt/constants";
import { wrapForReference } from "./utils";

function describeDenierByMaterial(c: Choices): string {
    const material = c.hosiery_material;
    const d = c.hosiery_denier;

    if (material === "woolen") {
        return "Opaque wool pantyhose with a very matte, light-absorbing finish; soft brushed texture shows subtle ribbing or knit pattern, providing full coverage from waist to toes with no bare skin, gentle compression at knees and ankles, and a cozy yet sleek silhouette.";
    }

    if (material === "fishnet_large") {
        return "Open-weave fishnet with large diamond pattern—coverage is defined by the net spacing rather than denier.";
    }

    if (material === "fishnet_small") {
        return "Fine fishnet with small diamond pattern, offering a tighter mesh look without conventional denier.";
    }

    if (material === "cotton") {
        return "Soft cotton fabric with a matte, everyday finish and natural breathability.";
    }

    if (material === "knit") {
        return "Chunky knit texture with visible weave pattern, providing cozy warmth and character.";
    }

    const tier = (() => {
        if (d === 0) return "ultra0";
        if (d <= 10) return "ultra10";
        if (d <= 20) return "sheer20";
        if (d <= 40) return "semi40";
        if (d <= 80) return "medium80";
        return "opaque120";
    })();

    const table: Record<
        Exclude<Choices["hosiery_material"], "woolen" | "fishnet_large" | "fishnet_small" | "cotton" | "knit">,
        Record<string, (d: number) => string>
    > = {
        velvet: {
            ultra0: (d) =>
                `${d}D ultra-sheer velvet, a barely-there matte veil, creating a soft-focus effect on the skin while skin undertones remain clearly visible, delicate nylon texture, no shine`,
            ultra10: (d) =>
                `${d}D ultra-sheer velvet matte, a gentle cosmetic haze that diffuses light, softening skin texture but keeping natural skin color fully discernible through the fabric`,
            sheer20: (d) =>
                `${d}D sheer velvet finish, pure matte nylon layer, gently diffusing highlights, semi-transparent fog effect where skin undertones naturally peek through`,
            semi40: (d) =>
                `${d}D semi-sheer velvet, noticeably mattifying the legs, soft powdery nylon grain, muted look with reduced transparency but skin presence still felt underneath`,
            medium80: (d) =>
                `${d}D medium-opacity velvet, satin-matte opaque nylon, smoothing out leg curves into a sculptural form, fabric texture visible (not plastic), consistent soft light absorption`,
            opaque120: (d) =>
                `${d}D opaque velvet, high-density matte nylon knit, completely blocking skin tone, deep light-absorbing finish, creating a solid and uniform velvety textile silhouette`
        },
        core_spun: {
            ultra0: (d) =>
                `${d}D ultra-sheer core-spun, barely perceptible nylon film, microscopic shimmer enhancing natural skin reality, skin undertones remain 100% visible like a filter`,
            ultra10: (d) =>
                `${d}D ultra-sheer core-spun, gentle satin sheen that evens out skin tone, high transparency allowing natural skin color to radiate through a whisper-thin layer`,
            sheer20: (d) =>
                `${d}D sheer core-spun, classic pantyhose texture with a breathable look, skin undertones remain visible beneath a healthy satin glow, fine knit details discernible`,
            semi40: (d) =>
                `${d}D semi-sheer core-spun, smooth airbrushed effect, true skin undertone gently visible through the weave, subtle light reflection along the calf bone, refined nylon texture`,
            medium80: (d) =>
                `${d}D medium-opacity core-spun, tightly woven nylon structure, creamy consistent surface, muted skin tones, soft satin luster (not rubbery), graceful shaping effect`,
            opaque120: (d) =>
                `${d}D opaque core-spun, dense high-quality nylon fabric, controlled soft sheen, solid elastic silhouette that reflects light gently, distinct textile feel rather than synthetic block`
        },
        glossy: {
            ultra0: (d) =>
                `${d}D ultra-sheer high-gloss, invisible fabric with intense watery highlights, oily sheen chasing leg curves, skin undertones remain fully visible beneath the shimmer`,
            ultra10: (d) =>
                `${d}D ultra-sheer glassy finish, catching sharp specular highlights, liquid film effect, highly reflective yet maintaining full transparency of the natural skin color`,
            sheer20: (d) =>
                `${d}D sheer glossy oil-shine, flawlessly smooth wet-look surface, skin undertones clearly showing through vibrant reflections, polished luminous nylon texture`,
            semi40: (d) =>
                `${d}D semi-sheer high-shine gloss, varnished smoothness, bone structure readable but overlaid with intense highlights, skin grain fading under a slick elongating sheen`,
            medium80: (d) =>
                `${d}D glossy medium-opacity, varnished nylon-like gloss, mirror-like streaks boldly tracking across curves, distinct woven fabric sheen (avoiding latex look), sculpted form`,
            opaque120: (d) =>
                `${d}D opaque high-gloss nylon, rich varnished finish, solid intense color with dynamic liquid highlights, sleek brilliance of polished textile, absolutely no rubber/latex texture`
        }
    };

    return table[material][tier](d);
}

function buildHosieryModifiers(c: Choices): string {
    const modifiers: string[] = [];

    if (c.hosiery_type === "ankle_sock" || c.hosiery_type === "knee_high" || c.hosiery_type === "calf_sock") {
        if (c.hosiery_material === "velvet") {
            modifiers.push("Matte velvet finish with no shine, typical hosiery texture.");
        } else if (c.hosiery_material === "core_spun") {
            modifiers.push("Core-spun hosiery yarn with subtle sheen and stretch.");
        } else if (c.hosiery_material === "glossy") {
            modifiers.push("Glossy hosiery finish with subtle shine; gloss on hosiery only, skin remains matte.");
        } else if (c.hosiery_material === "woolen") {
            modifiers.push("Wool-blend hosiery knit with visible softness.");
        }
    } else {
        if (c.hosiery_material === "glossy") {
            modifiers.push("Surface shows crisp highlights and mirror-like sheen with every small movement; gloss on hosiery only, skin remains matte.");
        }
        if (c.hosiery_material === "woolen") {
            modifiers.push("Plush wool fibers add visible softness and warmth.");
        }
        if (c.hosiery_material === "velvet") {
            if (c.hosiery_denier <= 10) {
                modifiers.push("Ultra-sheer velvet remains luminous and translucent, catching light softly rather than absorbing it.");
            } else if (c.hosiery_denier >= 20) {
                modifiers.push("Finish stays velvety-matte, absorbing light with a faint brushed texture.");
            }
        }
    }

    if (c.hosiery_type === "fishnet") {
        if (c.hosiery_material === "fishnet_large") {
            modifiers.push("Large-diamond netting creates bold, graphic negative space.");
        } else if (c.hosiery_material === "fishnet_small") {
            modifiers.push("Fine fishnet mesh adds subtle texture with smaller openings.");
        } else {
            modifiers.push("Net pattern stays consistent across the legs.");
        }
    }
    if (c.hosiery_type === "pantyhose") {
        modifiers.push("Seamless coverage from waist to toes; continuous fabric with no visible bands or edges on thighs.");
    }
    if (c.hosiery_type === "garter") {
        modifiers.push("Stockings held by visible garter belt and straps on upper thighs; clear gap of bare skin above stockings.");
        const garterColor = HOSIERY_COLOR_MAP[c.hosiery_color];
        const colorDescriptor =
            garterColor === "random color"
                ? "matching hue"
                : `same ${garterColor} tone`;
        modifiers.push(`Garter belt and straps match the ${colorDescriptor}.`);
    }
    if (c.hosiery_type === "thigh_high") {
        modifiers.push("Stockings end at mid-thigh with elastic top edge; no garter straps visible.");
    }
    if (c.hosiery_type === "ankle_sock") {
        modifiers.push("Low cut socks ending just above ankle bone.");
    }
    if (c.hosiery_type === "calf_sock") {
        modifiers.push("Mid-calf length socks.");
    }
    if (c.hosiery_type === "knee_high") {
        modifiers.push("Sock extends to just below the knee, ending at mid-calf to upper calf level.");
    }

    return modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";
}

function appendConcealingBottomNote(base: string, c: Choices): string {
    if (!isHosieryConcealingBottom(c.bottom_style)) {
        return base;
    }

    const hemReference = HOSIERY_PEEK_REFERENCES[c.bottom_style];
    const narrowGloss = c.hosiery_material === "glossy"
        ? " Even the narrow strip that appears below the hem catches a tiny gleam; gloss on hosiery only, skin remains matte."
        : "";
    return `${base}; only the portion below ${hemReference} peeks out naturally.${narrowGloss}`.trim();
}


export function buildColorPrefix(color: string, hasReference: boolean, repeatCount: number = 2): string {
    if (hasReference && color !== "random color") {
        return `(${color}:1.5) ${Array(repeatCount).fill(color).join(" ")}`;
    }
    return color;
}

export function describeHosiery(c: Choices, hasReference = false): string {
    if (c.bare_leg) {
        return c.bottom_style === "none"
            ? "No hosiery—spotlight natural legs from hip to ankle with visible pores and subtle color shifts"
            : `Keep the legs bare beneath the ${BOTTOM_STYLE_MAP[c.bottom_style] ?? "outfit"}, letting knee and calf lines show naturally`;
    }

    const type = HOSIERY_TYPE_MAP[c.hosiery_type];
    const color = HOSIERY_COLOR_MAP[c.hosiery_color];
    const material = HOSIERY_MATERIAL_MAP[c.hosiery_material];
    const modifiers = buildHosieryModifiers(c);

    if (c.hosiery_type === "ankle_sock" || c.hosiery_type === "knee_high" || c.hosiery_type === "calf_sock") {
        const materialDescription = (() => {
            if (c.hosiery_material === "velvet") {
                return c.hosiery_denier <= 10
                    ? "ultra-sheer velvet hosiery fabric (NOT cotton socks)"
                    : "matte velvet hosiery fabric (NOT cotton socks)";
            }
            if (c.hosiery_material === "core_spun") {
                return "core-spun hosiery yarn (NOT cotton socks)";
            }
            if (c.hosiery_material === "glossy") {
                return "glossy hosiery fabric (NOT cotton)";
            }
            if (c.hosiery_material === "woolen") {
                return "wool-blend hosiery knit (NOT cotton socks)";
            }
            return "true hosiery fabric rather than casual cotton socks";
        })();

        if (hasReference) {
            const hosieryDescription = `${color} ${type} made with ${materialDescription}.${modifiers}`.trim();
            return wrapForReference(hosieryDescription, "hosiery");
        }

        const colorPrefix = buildColorPrefix(color, hasReference, 2);
        const hosieryDescription = `${colorPrefix} ${type} made with ${materialDescription}.${modifiers}`.trim();
        return appendConcealingBottomNote(hosieryDescription, c);
    }

    const denierDescriptor = describeDenierByMaterial(c);

    if (hasReference) {
        const hosieryDescription = `${color} ${type} made with ${material}, ${denierDescriptor}.${modifiers}`.trim();
        return wrapForReference(hosieryDescription, "hosiery");
    }

    const colorPrefix = buildColorPrefix(color, hasReference, 2);
    const hosieryDescription = `${colorPrefix} ${type} made with ${material}, ${denierDescriptor}.${modifiers}`.trim();

    return appendConcealingBottomNote(hosieryDescription, c);
}


export function buildHosieryTextForAttire(
    c: Choices,
    hasReference: boolean
): { text: string; finish: string | null } {
    if (c.bare_leg) {
        const text = c.bottom_style === "none"
            ? "bare legs with minimal lingerie and natural skin texture"
            : "bare legs catching authentic light without hosiery";
        return { text, finish: "skin retains natural texture and a subtle healthy flush" };
    }

    const material = HOSIERY_MATERIAL_MAP[c.hosiery_material];
    const color = HOSIERY_COLOR_MAP[c.hosiery_color];
    const type = HOSIERY_TYPE_MAP[c.hosiery_type];
    const denierDescriptor = describeDenierByMaterial(c);
    let finish: string | null = null;
    if (c.hosiery_material === "velvet") {
        finish =
            c.hosiery_denier <= 10
                ? "with an ultra-sheer luminous veil that hugs every curve"
                : "with a soft matte finish and no mirror shine";
    }
    if (c.hosiery_material === "core_spun") finish = "showing delicate sheen that highlights the weave";
    if (c.hosiery_material === "glossy") finish = "with a bright, silky gloss; gloss on hosiery only, skin remains matte";

    const colorPrefix = buildColorPrefix(color, hasReference, 2);
    let text = `${colorPrefix} ${type} featuring ${material}, ${denierDescriptor}`;

    if (isHosieryConcealingBottom(c.bottom_style)) {
        const hemReference = HOSIERY_PEEK_REFERENCES[c.bottom_style];
        text = `${text}, glimpsed only below ${hemReference} without forced exposure`;
    }
    if (c.bottom_style === "yoga_leggings") {
        text = `${text}, in a soft neutral color rather than defaulting to black`;
    }
    if (c.hosiery_material === "glossy") {
        text = `${text}, the exposed areas catching sharp light streaks for a distinctly glossy look; gloss on hosiery only, skin remains matte`;
    }
    if (c.hosiery_material === "woolen") {
        text = `${text}, dense wool fibers adding plush warmth without shine`;
    }
    if (c.hosiery_material === "velvet") {
        if (c.hosiery_denier <= 10) {
            text = `${text}, surface stays luminous and translucent rather than matte`;
        } else {
            text = `${text}, surface remains matte and light-absorbing—avoid specular shine`;
        }
    }
    if (c.hosiery_material === "fishnet_large") {
        text = `${text}, large net diamonds creating bold skin peek-through`;
    }
    if (c.hosiery_material === "fishnet_small") {
        text = `${text}, fine net pattern giving delicate texture without solid coverage`;
    }

    return { text, finish };
}