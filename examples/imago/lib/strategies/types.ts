import { PromptJson } from "../promptTypes";

export type PromptTextOptions = {
    preserveReference?: boolean;
};

export interface PromptBuilderStrategy {
    build(prompt: PromptJson, options?: PromptTextOptions): string;
}