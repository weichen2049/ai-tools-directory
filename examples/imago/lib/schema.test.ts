import { describe, expect, it } from "vitest";
import { choicesSchema, type Choices } from "./schema";

type PartialChoices = Partial<Choices>;

function makeChoices(overrides: PartialChoices = {}): Choices {
  const base: Choices = {
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

  return { ...base, ...overrides };
}

describe("choicesSchema refinements", () => {
  it("男性在上衣不是浴巾时可以选择浴巾下装", () => {
    const result = choicesSchema.safeParse(
      makeChoices({ gender: "male", body_type: "lean", bottom_style: "bath_towel" })
    );

    expect(result.success).toBe(true);
  });

  it("rejects bath towel bottom for non-male genders or unspecified", () => {
    const invalidCases = [
      makeChoices({ bottom_style: "bath_towel" }),
      makeChoices({ gender: "agender", bottom_style: "bath_towel" }),
      makeChoices({ gender: undefined, bottom_style: "bath_towel" })
    ];

    invalidCases.forEach((choice) => {
      const parsed = choicesSchema.safeParse(choice);
      expect(parsed.success).toBe(false);
    });
  });

  it("requires bath towel tops to clear bottom selection", () => {
    const parsed = choicesSchema.safeParse(
      makeChoices({ top_style: "bath_towel", bottom_style: "casual_shorts" })
    );

    expect(parsed.success).toBe(false);
  });

  it("requires integrated tops to set bottom_style to none", () => {
    const parsed = choicesSchema.safeParse(
      makeChoices({ top_style: "one_piece_dress", bottom_style: "casual_shorts" })
    );

    expect(parsed.success).toBe(false);
  });
});