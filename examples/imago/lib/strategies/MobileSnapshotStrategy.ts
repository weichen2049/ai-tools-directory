import { PromptJson } from "../promptTypes";
import { PromptTextOptions } from "./types";
import { BaseStrategy } from "./BaseStrategy";
import { STYLE_FALLBACKS } from "../promptConfig";

export class MobileSnapshotStrategy extends BaseStrategy {
    build(prompt: PromptJson, options?: PromptTextOptions): string {
        const styleMode = "mobile_front_camera_accidental_snapshot";
        const mobileFallback = STYLE_FALLBACKS[styleMode];
        const camera = prompt.camera ?? {};
        const environment = prompt.scene?.environment ?? {};
        const subject = prompt.scene?.subject ?? {};
        const expression = subject.expression ?? {};
        const customDetails = Array.isArray(prompt.custom_detail_segments) ? prompt.custom_detail_segments : [];
        const makeup = subject.makeup ?? {};
        const negative = prompt.negative_prompt ?? {};
        const attire = subject.attire ?? {};

        const lines: string[] = [];

        this.pushLine(lines, `(Intention) ${prompt.custom_base_prompt ?? mobileFallback.attireNote}`);

        lines.push("");
        lines.push("Key Reminders:");
        this.pushLine(lines, `Angle: ${camera.vantage ?? mobileFallback.vantage}`);
        this.pushLine(lines, `Framing: ${camera.framing ?? mobileFallback.framing}`);
        if (camera.aspect_ratio_note) {
            this.pushLine(lines, `Aspect Ratio: ${camera.aspect_ratio_note}`);
        }
        this.pushLine(
            lines,
            "Treat the image as captured from a front-facing camera: the subject's own arm can appear while holding the phone slightly outside the frame, but the phone device itself must never be visible."
        );
        this.pushLine(
            lines,
            "Background: Fully sharp, zero depth-of-field blur, no bokeh, no portrait-mode blur, no focus falloff. Everything in frame equally sharp."
        );
        this.pushLine(
            lines,
            `Expression: ${this.formatList([expression.mood, expression.action], "; ") || mobileFallback.subjectAction}`
        );
        this.pushLine(
            lines,
            "Expression: No portrait-mode enhancement, entire frame equally important, no subject isolation."
        );

        if (subject.description && !options?.preserveReference) {
            this.pushLine(lines, `Subject: ${subject.description}`);
        }

        this.pushLine(
            lines,
            `Lighting: ${environment.lighting
                ? environment.lighting
                : "Uneven household lighting, mixed colour temperature, no intentional setup"
            }`
        );
        if (environment.setting) {
            this.pushLine(lines, `Setting: ${environment.setting}`);
        }
        this.pushLine(lines, "Keep skin texture raw with pores, small blemishes, and uneven tone.");
        this.pushLine(lines, "Allow stray hairs, mild double chin, awkward crop, and any mundane flaws.");
        this.pushLine(
            lines,
            "Background: Fully sharp, zero depth-of-field blur, no portrait-mode blur, no bokeh."
        );

        const makeupSentence = this.formatList([makeup.style, makeup.complexion, makeup.cheeks, makeup.lips], "; ");
        if (makeupSentence) {
            this.pushLine(lines, `Makeup: ${makeupSentence}`);
        }

        lines.push("");
        lines.push("Incidental Context:");
        if (customDetails.length > 0) {
            customDetails.forEach((detail) => this.pushLine(lines, `${detail}`));
        } else {
            this.pushLine(lines, `${mobileFallback.attireNote}`);
            this.pushLine(lines, `Upper clothing glimpsed: ${attire.top ?? "indistinct fabric folds"}`);
            this.pushLine(lines, `Lower clothing: ${attire.bottom ?? "out of frame"}`);
        }
        this.pushLine(
            lines,
            "Wardrobe: Background knowledge only, do not sharpen, glamorize, or spotlight clothes."
        );
        this.pushLine(
            lines,
            "Background: Messy bedding or random clutter, ordinary, never softened or blurred."
        );

        this.pushLine(lines, "- Embrace soft focus, motion blur, digital noise, compression artifacts, lens flare, and blown highlights.");
        this.pushLine(lines, "- Colours may shift, white balance may drift, and contrast should feel inconsistent.");
        this.pushLine(
            lines,
            "- Focus behaviour: Avoid portrait-style depth-map blur—any softness should come from overall motion blur or low-quality focus, not selective background isolation."
        );

        lines.push("");
        lines.push("Negative Prompt:");
        const MAX_FORBIDDEN = 14;
        const forbiddenElements = this.normalizeForbiddenList(
            Array.isArray(negative.forbidden_elements)
                ? negative.forbidden_elements
                : mobileFallback.forbiddenElements.split(","),
            MAX_FORBIDDEN
        );
        const forbiddenStyles = this.normalizeForbiddenList(
            Array.isArray(negative.forbidden_style)
                ? negative.forbidden_style
                : mobileFallback.forbiddenStyles.split(","),
            MAX_FORBIDDEN
        );

        const mobileElementParagraphs = this.buildForbiddenParagraphs(forbiddenElements);
        mobileElementParagraphs.forEach((text) => this.pushLine(lines, text));
        if (forbiddenStyles.length > 0) {
            this.pushLine(lines, `Avoid styles such as ${forbiddenStyles.join(", ")}.`);
        }

        return this.appendReferenceNote(lines.join("\n"), prompt, options);
    }
}