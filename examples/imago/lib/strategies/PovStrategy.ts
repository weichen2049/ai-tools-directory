import { PromptJson } from "../promptTypes";
import { PromptTextOptions } from "./types";
import { BaseStrategy } from "./BaseStrategy";
import { INTENTION_BY_STYLE, STYLE_FALLBACKS } from "../promptConfig";

export class PovStrategy extends BaseStrategy {
    build(prompt: PromptJson, options?: PromptTextOptions): string {
        const styleMode = "pov_interaction_first_person";
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
        const poseKey = prompt.pose_key ?? "";
        const kneelSignalSource = `${poseKey} ${subject.pose ?? ""}`.toLowerCase();
        const isPovKneel = /\bkneel(ing)?\b/.test(kneelSignalSource);

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

        if (subject.description && !options?.preserveReference) {
            this.pushLine(lines, this.formatBold("Subject Profile", subject.description));
        }

        const settingList = [
            environment.setting,
            environment.lighting ? `Lighting: ${environment.lighting}` : "Lighting: Natural scene lighting."
        ];
        if (isPovKneel) {
            settingList.push("Viewer stands directly above kneeling subject, floor or rug beneath knees visible.");
        }
        const settingSentence = this.formatList(settingList, ". ") || styleFallback.setting;
        this.pushLine(lines, this.formatBold("Setting", settingSentence));

        if (isPovKneel) {
            this.pushLine(
                lines,
                "Focus: Entire first-person frame evenly sharp, viewer looking downward, face, shoulders, visible floor share same clarity, no artificial depth-of-field tricks."
            );
            this.pushLine(
                lines,
                "Viewpoint: Eyes looking from above, natural breathing sway, no phone body, no selfie rig, no detached camera."
            );
        } else {
            this.pushLine(
                lines,
                "Focus: First-person frame evenly sharp, subject and nearby surfaces share same clarity, no artificial depth-of-field tricks."
            );
            this.pushLine(
                lines,
                "Viewpoint: Viewer's own eyes, natural breathing sway, no phone body, no selfie rig, no detached camera."
            );
        }

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

        const focusSentence = "Focus & Fidelity: Maintain even sharpness across the first-person view so skin, clothing, and nearby surfaces sit on the same focus plane without isolating the subject.";
        this.pushLine(lines, focusSentence);

        const colorSentence = aesthetic.color_grade?.overall || aesthetic.color_grade?.contrast
            ? `Lighting & Color: ${this.formatList([aesthetic.color_grade?.overall, aesthetic.color_grade?.contrast], "; ")}`
            : styleFallback.lighting;
        this.pushLine(lines, colorSentence);

        this.pushLine(
            lines,
            "Handheld Realism: Allow subtle breathing sway, edge motion blur, and natural sensor noise so the shot feels hand-held; avoid tripod-stable footage or glossy CG polish."
        );
        this.pushLine(
            lines,
            "Focus Plane: Keep the full first-person scene on one focus plane—no selective focus or depth isolation between subject and environment cues."
        );

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