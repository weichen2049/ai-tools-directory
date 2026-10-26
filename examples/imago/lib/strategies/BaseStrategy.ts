import { PromptJson } from "../promptTypes";
import { PromptBuilderStrategy, PromptTextOptions } from "./types";
import { HOSIERY_COLOR_TERMS, GENERIC_FORBIDDEN } from "../promptConfig";

export abstract class BaseStrategy implements PromptBuilderStrategy {
    abstract build(prompt: PromptJson, options?: PromptTextOptions): string;

    protected formatBold(label: string, value: string): string {
        return `${label}: ${value}`;
    }

    protected formatSubBullet(label: string, value?: string | null): string | null {
        if (!value) return null;
        return `${label}: ${value}`;
    }

    protected formatList(items: Array<string | null | undefined>, separator: string): string | null {
        const cleaned = items
            .map((item) => (typeof item === "string" ? item.replace(/\s+/g, " ").trim() : ""))
            .filter((item) => item.length > 0);
        if (cleaned.length === 0) return null;
        return cleaned.join(separator);
    }

    protected pushLine(lines: string[], sentence?: string | null) {
        if (!sentence) return;
        const trimmed = sentence.replace(/\s+/g, " ").trim();
        if (!trimmed) return;
        lines.push(trimmed.endsWith(".") ? trimmed : `${trimmed}.`);
    }

    protected buildAccessoriesSentence(
        accessories: { hair_clip?: string; earrings?: string; glasses?: string; neck_body_accessories?: string } | undefined,
        preserveReference: boolean
    ): string | null {
        if (!accessories) return null;
        const directive = accessories.hair_clip ?? "";
        if (preserveReference && directive && (directive.startsWith("Change") || directive.startsWith("Remove"))) {
            return directive;
        }

        const parts = [accessories.hair_clip, accessories.earrings, accessories.glasses, accessories.neck_body_accessories]
            .map((item) => (typeof item === "string" ? item.replace(/\s+/g, " ").trim() : ""))
            .filter((item) => item.length > 0 && item !== "none");

        if (parts.length === 0) return null;
        return parts.join("; ");
    }

    protected normalizeForbiddenList(list: string[], max: number): string[] {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const raw of list) {
            const item = raw.replace(/\s+/g, " ").trim();
            if (!item) continue;
            const lower = item.toLowerCase();
            if (GENERIC_FORBIDDEN.has(lower)) continue;
            if (seen.has(lower)) continue;
            seen.add(lower);
            result.push(item);
            if (result.length >= max) break;
        }
        return result;
    }

    protected groupForbiddenElements(items: string[]): Array<[string, string[]]> {
        const buckets: Record<string, string[]> = {
            "Pose & Hands": [],
            "Background & Lighting": [],
            "Makeup & Face": [],
            General: []
        };
        items.forEach((item) => {
            const lower = item.toLowerCase();
            if (/(leg|pose|hand|arm|phone)/.test(lower)) {
                buckets["Pose & Hands"].push(item);
            } else if (/(background|blur|lighting|bokeh)/.test(lower)) {
                buckets["Background & Lighting"].push(item);
            } else if (/(makeup|lip|lash|eyeshadow|eyeliner|blush|skin|face)/.test(lower)) {
                buckets["Makeup & Face"].push(item);
            } else {
                buckets.General.push(item);
            }
        });
        return Object.entries(buckets);
    }

    protected buildForbiddenParagraphs(items: string[]): string[] {
        const groups = this.groupForbiddenElements(items);
        return groups
            .map(([label, entries]) => {
                if (entries.length === 0) return null;
                if (label === "Background & Lighting") {
                    return "Background & Lighting: forbid any form of background blur including depth-of-field, shallow DOF, soft background, gaussian blur, lens blur, portrait-mode blur, fake bokeh effects, or any depth map blur / AI-generated depth separation.";
                }
                return `${label}: avoid ${entries.join(", ")}.`;
            })
            .filter((text): text is string => Boolean(text));
    }

    protected appendReferenceNote(base: string, prompt: PromptJson, options?: PromptTextOptions): string {
        if (!options?.preserveReference) return base;

        const subject = prompt.scene?.subject ?? {};

        const colorWeightMatch = base.match(/\(([a-zA-Z0-9_#-]+(?:\s[a-zA-Z0-9_#-]+)*):1\.5\)/);
        const normalizedColor = colorWeightMatch?.[1]?.toLowerCase();
        const hasColorWeight = normalizedColor ? HOSIERY_COLOR_TERMS.includes(normalizedColor) : false;

        const referenceLines = [
            "",
            "Preserve the EXACT same subject identity, facial features, perceived gender, ethnicity, and skin tone as the reference photo. The reference image only defines face-level appearance."
        ];

        referenceLines.push("");
        referenceLines.push("Only transfer the reference subject's face, gender, ethnicity, and overall likeness. Do not reuse the reference hairstyle, body shape, wardrobe, accessories, or pose—those must follow the new prompt instructions.");

        referenceLines.push("");
        referenceLines.push("CRITICAL - Hair Replacement: The hair specified in the prompt MUST completely replace the reference image's hair. Do NOT blend, mix, or preserve any aspect of the reference image's hair style, color, length, or texture. The reference image's hair is completely ignored.");
        referenceLines.push("");
        referenceLines.push("Important: Elements explicitly marked with 'Replace' or 'Change' in the prompt (such as hair, clothing, makeup, and accessories) MUST be modified according to the prompt specifications. The reference image's versions of these elements should be completely replaced or changed, not blended or mixed.");
        referenceLines.push("");
        referenceLines.push("Pose Override: Follow the new pose instructions exactly; ignore the pose captured in the reference image.");
        referenceLines.push("");

        if (hasColorWeight && colorWeightMatch) {
            const color = colorWeightMatch[1];
            referenceLines.push("");
            referenceLines.push(`Note: Hosiery has been explicitly replaced with ${color} color as specified in the prompt. Reference applies ONLY to character appearance (face, body), NOT to replaced elements.`);
        }

        return `${base}\n${referenceLines.join("\n")}`;
    }
}