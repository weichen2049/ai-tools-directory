import { Choices } from "@lib/schema";
import type { StyleMode } from "@lib/options";

const FEMALE_DESCRIPTIONS: Record<NonNullable<Choices["body_type"]>, string> = {
  pear: "heavily bottom-heavy triangle figure, very narrow petite upper body, sharply widening into broad hips and thick heavy thighs, pronounced pear shape with visual weight concentrated entirely in the lower body",
  petite: "very short stature, tiny compact frame, slender and delicate build, narrow shoulders, thin limbs, overall very small and cute appearance",
  full: "voluptuous thick figure, large heavy bust, wide hips and thick soft thighs, distinct waist definition (not chubby), fleshy and heavy curves with a feminine silhouette, thick-fit aesthetic",
  voluptuous: "very soft fleshy curves with emphasized thickness, plush skin texture, heavy thighs and glutes, 'thicc' build with maximum softness",
  model: "tall and very lean build, long limbs, sharp collarbones, minimal body fat, clothes hanger physique with vertical elongation",
  hourglass: "classically balanced figure with bust and hips of similar width, significantly narrower defined waist, creating a distinct X-shape silhouette",
  lean: "", toned: "", muscle_bulky: "", beefy: "", chubby: ""
};

const MALE_DESCRIPTIONS: Record<NonNullable<Choices["body_type"]>, string> = {
  lean: "Slender and elegant K-pop idol figure, broad shoulders but very lean waist, refined facial features, clean jawline, ethereal atmosphere, expensive styling, graceful limbs",
  toned: "Athletic swimmer's build with very thin skin revealing every muscle fiber and vein, prominent visible vascularity on forearms and biceps, clearly defined six-pack abs, V-taper torso with broad muscular shoulders tapering to narrow waist, lean shredded muscles with low body fat, visible muscle striations on chest and deltoids, youthful athletic energy",
  muscle_bulky: "heavy muscular build with massive pectorals and thick neck, powerful daddy vibe, dense muscle mass, broad and imposing structure",
  beefy: "heavy rugged build, thick layer of fat over dense muscle, massive powerlifter physique, protruding strong belly, thick waist, bulk with softness, bear mode, massive frame",
  chubby: "round physique with soft edges, visible belly and love handles, non-muscular heavy build, overall softness",
  pear: "", petite: "", full: "", voluptuous: "", model: "", hourglass: ""
};

const ETHNICITY_BEAUTY_DESCRIPTIONS: Record<NonNullable<Choices["ethnicity"]>, string> = {
  east_asian: "symmetrical face with clear skin, delicate facial features, k-pop idol aesthetic styling, extremely photogenic",
  south_asian: "defined facial features, expressive eyes, straight nose, radiant complexion, elegant appearance",
  southeast_asian: "warm and glowing skin tone, bright eyes, soft facial features, natural charm",
  white_caucasian: "harmonious facial structure, classic proportions, defined cheekbones, naturally photogenic",
  black_african: "symmetrical facial structure, smooth glowing skin, balanced features, high cheekbones",
  hispanic_latino: "strong facial definition, warm healthy complexion, expressive features",
  middle_eastern: "captivating eyes, defined brows, elegant facial harmony, distinct features",
  mixed: "unique and balanced facial features, striking natural look",
  random: "symmetrical face, aesthetic harmony"
};

const ETHNICITY_MALE_BEAUTY_DESCRIPTIONS: Record<NonNullable<Choices["ethnicity"]>, string> = {
  east_asian: "Sophisticated East Asian features, clear and smooth skin, soft facial contours, refined and elegant appearance, K-pop style grooming, gentle expression, naturally photogenic, modern clean aesthetic",
  south_asian: "strong facial features, expressive eyes, defined nose, confident bearing",
  southeast_asian: "warm complexion, bright eyes, defined features",
  white_caucasian: "strong facial structure, classic proportions, defined jawline, naturally photogenic",
  black_african: "defined facial structure, smooth skin, balanced features, strong profile",
  hispanic_latino: "charismatic features, warm confident expression, defined jawline",
  middle_eastern: "captivating eyes, defined brows, strong facial harmony",
  mixed: "unique and balanced facial features, distinct look",
  random: "symmetrical face, balanced masculine features"
};

const MALE_GAZE_AESTHETIC = "clean-cut, gentle eyes, soft yet defined features";

const MALE_MOOD_AESTHETIC: Partial<Record<StyleMode, string>> = {
  studio_elegant: "sharp jawline, cold expression, minimalist cool, elite aura, tailored aesthetic, high-class aesthetic",
  mirror_selfie: "relaxed confidence, slightly messy hair, casual warm aesthetic, casual charm",
  mobile_front: "candid natural look, warm smile, POV eye contact, warm eye contact",
  pov_interaction: "deep gaze, focused gaze, intense eye contact, intimate atmosphere, intimate proximity",
  body_part_closeup: "detailed masculine skin texture, defined anatomical lines, vascularity where appropriate",
  rough_street_snap: "cool street attitude, laid-back vibe, natural confidence, slightly rugged"
};


export function buildSubjectDescription(
  c: Choices,
  styleMode: StyleMode,
  hasReference: boolean
): string | undefined {
  const gender = c.gender || "female";
  const ethnicity = c.ethnicity || "east_asian";
  const bodyType = c.body_type;
  let bodyFatDescription: string;

  if (gender === "male") {
    bodyFatDescription = MALE_DESCRIPTIONS[bodyType] || MALE_DESCRIPTIONS.lean;
  } else {
    bodyFatDescription = FEMALE_DESCRIPTIONS[bodyType] || FEMALE_DESCRIPTIONS.pear;
  }

  if (hasReference) {
    return undefined;
  }

  let genderText: string;
  let genderDescription: string | undefined;

  if (gender === "agender") {
    genderText = "person";
    genderDescription = "androgynous appearance, gender-neutral face, no secondary sexual traits";
  } else {
    genderText = gender === "male" ? "man" : (c.body_type === "petite" ? "girl" : "woman");
  }

  const ethnicityText = {
    east_asian: "East Asian",
    south_asian: "South Asian",
    southeast_asian: "Southeast Asian",
    white_caucasian: "White Caucasian",
    black_african: "Black African",
    hispanic_latino: "Hispanic Latino",
    middle_eastern: "Middle Eastern",
    mixed: "Mixed ethnicity",
    random: "diverse ethnicity"
  }[ethnicity];

  const maleAesthetic = MALE_MOOD_AESTHETIC[styleMode] || MALE_GAZE_AESTHETIC;

  const beautyDescription =
    gender === "male"
      ? `${ETHNICITY_MALE_BEAUTY_DESCRIPTIONS[ethnicity]}, ${maleAesthetic}`
      : ETHNICITY_BEAUTY_DESCRIPTIONS[ethnicity];

  const contextText = {
    studio_elegant: "styled for a polished portrait session",
    mirror_selfie: "in relaxed mirror-selfie attire",
    mobile_front:
      "caught mid-selfie, gaze often drifting slightly off screen or casually referencing the lens with zero modeling effort, expression coming from a casual mood rather than a pose seen in an unposed front-camera snapshot",
    pov_interaction: "engaging the viewer from intimate first-person distance",
    body_part_closeup:
      "framed at macro distance on a single body area, eliminating face visibility while emphasizing texture and material detail",
    rough_street_snap:
      "captured as a candid, gritty street snapshot where the subject blends into the urban scene with no glamour or staging"
  }[styleMode];

  let description = `Young ${ethnicityText} ${genderText}, ${beautyDescription}`;
  if (contextText) {
    description += ` ${contextText}`;
  }

  if (genderDescription) {
    description += `, ${genderDescription}`;
  }

  description += `, ${bodyFatDescription}`;

  if (styleMode === "body_part_closeup") {
    description += ", face never enters the crop—only the selected body region is framed";
  }

  return description;
}