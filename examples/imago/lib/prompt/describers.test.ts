import { describe, expect, it } from "vitest";
import { buildSubjectDescription } from "./describers";
import type { Choices } from "@lib/schema";

type PartialChoices = Partial<Choices>;

const baseChoices: Choices = {
  style_mode: "mirror_selfie",
  lighting: "soft_beauty",
  mood: "confident_smile",
  hair_style: "straight_long_hair",
  hair_color: "black",
  top_style: "casual_tee",
  bottom_style: "casual_shorts",
  hosiery_type: "pantyhose",
  hosiery_color: "black",
  hosiery_material: "velvet",
  hosiery_denier: 40,
  footwear_style: "barefoot",
  hair_clip: "none",
  earrings: "none",
  neck_body_accessories: "none",
  glasses_style: "none",
  makeup_style: "natural",
  makeup_intensity: "medium",
  pose: "dorm_mirror_forward",
  scene_location: "dorm_room",
  bare_leg: false,
  aspect_ratio: "9:16",
  bare_makeup: true,
  gender: "female",
  ethnicity: "east_asian",
  body_type: "pear"
};

function makeChoices(overrides: PartialChoices = {}) {
  return { ...baseChoices, ...overrides } satisfies Choices;
}

describe("buildSubjectDescription", () => {
  it("返回完整描述（含性别与人种）", () => {
    const desc = buildSubjectDescription(
      makeChoices({ gender: "female", ethnicity: "east_asian", body_type: "petite" }),
      "studio_elegant",
      false
    );

    expect(desc).toContain("Young East Asian girl");
    expect(desc).toContain("symmetrical face with clear skin");
    expect(desc).toContain("very short stature");
  });

  it("男性描述包含帅哥向表述", () => {
    const desc = buildSubjectDescription(makeChoices({ gender: "male", body_type: "lean" }), "studio_elegant", false);

    expect(desc).toContain("sharp jawline");
  });

  it("参考图模式下不返回独立描述，由 Reference Continuity 控制", () => {
    const desc = buildSubjectDescription(makeChoices({ gender: "male", body_type: "lean" }), "mirror_selfie", true);
    expect(desc).toBeUndefined();
  });

  it("无性别选项返回中性描述", () => {
    const desc = buildSubjectDescription(makeChoices({ gender: "agender", body_type: "full" }), "mobile_front", false);

    expect(desc).toContain("Young East Asian person");
    expect(desc).toContain("caught mid-selfie");
    expect(desc).toContain("gender-neutral face");
    expect(desc).toContain("voluptuous thick figure");
  });
});