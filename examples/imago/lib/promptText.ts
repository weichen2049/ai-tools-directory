import type { PromptJson } from "./promptTypes";
import { getStrategy } from "./strategies";
import { PromptTextOptions } from "./strategies/types";

export type { PromptTextOptions };

export function toTextPrompt(prompt: PromptJson, options?: PromptTextOptions): string {
  const strategy = getStrategy(prompt.style_mode);
  return strategy.build(prompt, options);
}