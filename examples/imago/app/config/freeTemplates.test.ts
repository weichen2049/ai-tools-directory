import { describe, it, expect } from "vitest";
import { FREE_TEMPLATES } from "./freeTemplates";

describe("FREE_TEMPLATES 配置校验", () => {
  it("模板 id 应唯一且非空", () => {
    const ids = FREE_TEMPLATES.map((t) => t.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
    ids.forEach((id) => expect(id).toBeTruthy());
  });

  it("每个模板都应包含名称、提示图与 prompts 变体", () => {
    FREE_TEMPLATES.forEach((tpl) => {
      expect(tpl.name).toBeTruthy();
      expect(tpl.image).toMatch(/^\/templates\//);
      expect(tpl.prompts.none).toBeTruthy();
      expect(tpl.prompts.one).toBeTruthy();
      expect(tpl.prompts.two).toBeTruthy();
    });
  });

  it("requiredImages 不应超过 limitImages", () => {
    FREE_TEMPLATES.forEach((tpl) => {
      if (tpl.requiredImages !== undefined && tpl.limitImages !== undefined) {
        expect(tpl.requiredImages).toBeLessThanOrEqual(tpl.limitImages);
      }
    });
  });
});