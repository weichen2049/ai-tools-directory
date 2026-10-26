import { describe, expect, it } from "vitest";
import { buildTurboPrompt } from "./turboPrompt";
import type { PromptJson } from "./promptTypes";

describe("buildTurboPrompt", () => {
  it("男性会带帅哥向描述", () => {
    const prompt: PromptJson = {
      gender: "male"
    };

    const result = buildTurboPrompt(prompt);
    expect(result).toContain("man");
  });
});