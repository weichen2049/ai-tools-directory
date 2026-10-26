import { PromptJson } from "../promptTypes";
import { PromptTextOptions } from "./types";
import { BaseStrategy } from "./BaseStrategy";
import { INTENTION_BY_STYLE, STYLE_FALLBACKS } from "../promptConfig";

export class MirrorSelfieStrategy extends BaseStrategy {
    build(prompt: PromptJson, options?: PromptTextOptions): string {
        const styleMode = "dormitory_mirror_selfie";
        const styleFallback = STYLE_FALLBACKS[styleMode];
        const camera = prompt.camera ?? {};
        const environment = prompt.scene?.environment ?? {};
        const subject = prompt.scene?.subject ?? {};
        const expression = subject.expression ?? {};
        const attire = subject.attire ?? {};
        const accessories = subject.accessories ?? {};
        const makeup = subject.makeup ?? {};
        const aesthetic = prompt.aesthetic_controls ?? {};
        const negative = prompt.negative_prompt ?? {};

        const lines: string[] = [];

        const intention = prompt.custom_base_prompt ?? INTENTION_BY_STYLE[styleMode];
        this.pushLine(lines, `(Intention) ${intention}`);

        lines.push("");
        lines.push("Composition and Pose:");
        this.pushLine(lines, this.formatBold("Vantage", camera.vantage ?? styleFallback.vantage));
        const framingText = camera.framing ?? styleFallback.framing;
        this.pushLine(lines, this.formatBold("Framing", framingText));

        const aspectNote = camera.aspect_ratio_note?.trim();
        if (aspectNote) {
            const normalizedFraming = framingText.trim();
            if (aspectNote !== normalizedFraming) {
                this.pushLine(lines, this.formatBold("Aspect Ratio", aspectNote));
            }
        }
        if (camera.phone_hold) {
            this.pushLine(lines, this.formatBold("Phone Hold", camera.phone_hold));
        }
        this.pushLine(lines, this.formatBold("Pose", subject.pose ?? styleFallback.pose));

        const expressionText = this.formatList([expression.mood, expression.action], "; ") || styleFallback.subjectAction;
        this.pushLine(lines, this.formatBold("Expression", expressionText));
        this.pushLine(
            lines,
            "Portrait Mode: No portrait-mode enhancement, entire reflection equally important, no subject isolation."
        );

        if (subject.description && !options?.preserveReference) {
            this.pushLine(lines, this.formatBold("Subject Profile", subject.description));
        }

        const settingList = [
            environment.setting,
            environment.lighting ? `Lighting: ${environment.lighting}` : "Lighting: Natural scene lighting."
        ];
        const settingSentence = this.formatList(settingList, ". ") || styleFallback.setting;
        this.pushLine(lines, this.formatBold("Setting", settingSentence));
        this.pushLine(
            lines,
            "Background: Fully sharp, zero depth-of-field blur, no bokeh. The entire mirror reflection must be in focus."
        );

        lines.push("");
        lines.push("Subject Details:");
        this.pushLine(lines, this.formatBold("Hair", subject.hair ?? styleFallback.hair));

        const makeupSentence = this.formatList([makeup.style, makeup.complexion, makeup.cheeks, makeup.lips], "; ");
        if (options?.preserveReference && makeup.style && (makeup.style.startsWith("Replace") || makeup.style.startsWith("Change"))) {
            this.pushLine(lines, this.formatBold("Makeup", makeup.style));
        } else if (makeupSentence) {
            this.pushLine(lines, this.formatBold("Makeup", makeupSentence));
        }

        lines.push("Attire:");
        this.pushLine(lines, this.formatSubBullet("Upper", attire.top));
        this.pushLine(lines, this.formatSubBullet("Lower", attire.bottom));
        this.pushLine(lines, this.formatSubBullet("Hosiery", attire.hosiery));
        this.pushLine(lines, this.formatSubBullet("Footwear", attire.footwear));

        const accessoriesSentence = this.buildAccessoriesSentence(accessories, Boolean(options?.preserveReference));
        if (accessoriesSentence) {
            this.pushLine(lines, this.formatBold("Accessories", accessoriesSentence));
        }

        lines.push("");
        lines.push("Image Quality & Technical Specifications:");

        const focusSentence = "Focus & Fidelity: High fidelity details across the entire frame — skin texture, hair strands, fabric weave, and leg contours.";
        this.pushLine(lines, focusSentence);

        const colorSentence = aesthetic.color_grade?.overall || aesthetic.color_grade?.contrast
            ? `Lighting & Color: ${this.formatList([aesthetic.color_grade?.overall, aesthetic.color_grade?.contrast], "; ")}`
            : styleFallback.lighting;
        this.pushLine(lines, colorSentence);

        lines.push("");
        lines.push("Negative Prompt:");
        const MAX_FORBIDDEN = 14;
        const forbiddenElements = this.normalizeForbiddenList(
            Array.isArray(negative.forbidden_elements)
                ? negative.forbidden_elements
                : styleFallback.forbiddenElements.split(","),
            MAX_FORBIDDEN
        );
        const forbiddenStyles = this.normalizeForbiddenList(
            Array.isArray(negative.forbidden_style)
                ? negative.forbidden_style
                : styleFallback.forbiddenStyles.split(","),
            MAX_FORBIDDEN
        );

        const elementParagraphs = this.buildForbiddenParagraphs(forbiddenElements);
        if (elementParagraphs.length > 0) {
            lines.push("Forbidden Elements:");
            elementParagraphs.forEach((text) => this.pushLine(lines, text));
        }
        if (forbiddenStyles.length > 0) {
            lines.push("Forbidden Styles:");
            this.pushLine(lines, `Avoid aesthetics such as ${forbiddenStyles.join(", ")}.`);
        }

        return this.appendReferenceNote(lines.join("\n"), prompt, options);
    }
}