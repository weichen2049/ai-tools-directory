import { PromptBuilderStrategy } from "./types";
import { StudioStrategy } from "./StudioStrategy";
import { MirrorSelfieStrategy } from "./MirrorSelfieStrategy";
import { MobileSnapshotStrategy } from "./MobileSnapshotStrategy";
import { PovStrategy } from "./PovStrategy";
import { DefaultStrategy } from "./DefaultStrategy";

const strategies: Record<string, PromptBuilderStrategy> = {
    studio_photoreal_high_fidelity: new StudioStrategy(),
    dormitory_mirror_selfie: new MirrorSelfieStrategy(),
    mobile_front_camera_accidental_snapshot: new MobileSnapshotStrategy(),
    pov_interaction_first_person: new PovStrategy(),
    default: new DefaultStrategy()
};

export function getStrategy(styleMode?: string): PromptBuilderStrategy {
    return strategies[styleMode || "default"] || strategies.default;
}