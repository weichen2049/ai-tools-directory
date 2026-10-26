import { useCallback, useEffect, useRef, useState } from "react";
import { type Choices } from "@lib/schema";
import {
  STYLE_MODE,
  POSE_LOWER_BODY_VISIBILITY,
  STYLE_PRESETS,
  TOP_STYLE_HAS_BOTTOM,
  HAIR_COLOR,
  HOSIERY_TYPE,
  HOSIERY_COLOR,
  HOSIERY_MATERIAL,
  HOSIERY_DENIERS,
  GLASSES_STYLE,
  ASPECT_RATIO,
  GENDER,
  ETHNICITY,
  FEMALE_BODY_TYPE,
  MALE_BODY_TYPE,
  BEACH_SCENE_FORBIDDEN_POSES,
  type StyleMode
} from "@lib/options";

const PRESET_LIGHTING: Record<StyleMode, Choices["lighting"]> = {
  studio_elegant: "glam_high_key",
  mirror_selfie: "soft_beauty",
  mobile_front: "soft_beauty",
  pov_interaction: "soft_beauty",
  body_part_closeup: "soft_beauty",
  rough_street_snap: "soft_beauty"
};

const SIDE_LIE_SCENE_RESTRICTIONS: ReadonlyArray<Choices["scene_location"]> = [
  "bathroom",
  "changing_room",
  "elevator_reflection",
  "gym"
];
const BED_ONLY_POSE_SCENES: ReadonlyArray<Choices["scene_location"]> = ["dorm_room", "hotel_suite"];
const BEACH_FORBIDDEN_POSE_SET = new Set<Choices["pose"]>(BEACH_SCENE_FORBIDDEN_POSES);

const randomFrom = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const DEFAULT_CHOICES: Choices = {
  style_mode: "mirror_selfie",
  lighting: PRESET_LIGHTING.mirror_selfie,
  mood: "confident_smile",
  scene_location: STYLE_PRESETS.mirror_selfie.scene_location[0],
  hair_style: "straight_long_hair",
  hair_color: "random",
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
  bare_leg: false,
  aspect_ratio: "9:16",
  bare_makeup: true,
  body_type: "pear",
  gender: "female",
  ethnicity: "east_asian"
};

function buildRandomChoices(): Choices {
  const styleMode = randomFrom(STYLE_MODE);
  const preset = STYLE_PRESETS[styleMode];
  const gender = randomFrom(GENDER);
  const lighting = PRESET_LIGHTING[styleMode];
  let scene = randomFrom(preset.scene_location);
  const mood = randomFrom(preset.mood);
  const hairStyle = randomFrom(preset.hair_style);
  const topStyle = randomFrom(preset.top_style);
  const bottomCandidates = preset.bottom_style.filter((option) => !(option === "bath_towel" && gender !== "male"));
  let bottomStyle =
    TOP_STYLE_HAS_BOTTOM[topStyle] || topStyle === "bath_towel"
      ? "none"
      : bottomCandidates.length > 0
        ? randomFrom(bottomCandidates)
        : "none";
  if (bottomStyle === "bath_towel" && gender !== "male") {
    bottomStyle = "none";
  }

  let pose = randomFrom(preset.pose);
  if (pose === "mobile_side_lie" && SIDE_LIE_SCENE_RESTRICTIONS.includes(scene)) {
    pose = preset.pose.find((item) => item !== "mobile_side_lie") ?? "dorm_mirror_forward";
  }
  if (pose === "mobile_bed_prone" && !BED_ONLY_POSE_SCENES.includes(scene)) {
    scene = randomFrom(BED_ONLY_POSE_SCENES);
  }
  if (scene === "beach_sunset" && BEACH_FORBIDDEN_POSE_SET.has(pose)) {
    pose = preset.pose.find((item) => !BEACH_FORBIDDEN_POSE_SET.has(item)) ?? pose;
  }

  const hosieryType = randomFrom(HOSIERY_TYPE);
  const fishnetMaterials = ["fishnet_large", "fishnet_small"] as const;
  const hosieryMaterialPool =
    hosieryType === "fishnet"
      ? fishnetMaterials
      : (HOSIERY_MATERIAL.filter((item) => !fishnetMaterials.includes(item as (typeof fishnetMaterials)[number])) as Choices["hosiery_material"][]);
  let hosieryMaterial = randomFrom(hosieryMaterialPool);
  let hosieryDenier = hosieryType === "fishnet" ? 0 : randomFrom(HOSIERY_DENIERS.filter((d) => d > 0));
  if (hosieryMaterial === "woolen") {
    hosieryDenier = hosieryDenier < 80 ? 80 : hosieryDenier;
  }

  return {
    style_mode: styleMode,
    lighting,
    mood,
    scene_location: scene,
    hair_style: hairStyle,
    hair_color: randomFrom(HAIR_COLOR),
    top_style: topStyle,
    bottom_style: bottomStyle,
    hosiery_type: hosieryType,
    hosiery_color: randomFrom(HOSIERY_COLOR),
    hosiery_material: hosieryMaterial,
    hosiery_denier: hosieryDenier,
    footwear_style: randomFrom(preset.footwear_style),
    hair_clip: randomFrom(preset.hair_clip),
    earrings: randomFrom(preset.earrings),
    neck_body_accessories: randomFrom(preset.neck_body_accessories),
    glasses_style: randomFrom(GLASSES_STYLE),
    makeup_style: randomFrom(preset.makeup_style),
    makeup_intensity: randomFrom(preset.makeup_intensity),
    pose,
    bare_leg: gender === "male" ? true : (POSE_LOWER_BODY_VISIBILITY[pose] ? Math.random() < 0.3 : false),
    aspect_ratio: randomFrom(ASPECT_RATIO),
    bare_makeup: Math.random() < 0.5,
    gender,
    ethnicity: randomFrom(ETHNICITY),
    body_type: gender === "male"
      ? randomFrom(MALE_BODY_TYPE)
      : randomFrom(FEMALE_BODY_TYPE)
  };
}

export function useChoices() {
  const [choices, setChoices] = useState<Choices>(DEFAULT_CHOICES);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setChoices(buildRandomChoices());
  }, []);

  const reroll = useCallback(() => {
    setChoices((prev) => {
      const base = buildRandomChoices();
      const fixedGender = prev.gender ?? "female";
      return {
        ...base,
        gender: fixedGender,
        body_type: fixedGender === "male"
          ? randomFrom(MALE_BODY_TYPE)
          : randomFrom(FEMALE_BODY_TYPE),
        bare_leg: fixedGender === "male" ? true : base.bare_leg
      };
    });
  }, []);

  const update = useCallback(
    <K extends keyof Choices,>(key: K, value: Choices[K]) => {
      setChoices((prev) => {
        if (
          prev.style_mode === "body_part_closeup" &&
          (key === "scene_location" || key === "mood")
        ) {
          return prev;
        }
        const next = { ...prev, [key]: value };
        const gender = (key === "gender" ? value : prev.gender) || "female";

        if (key === "gender") {
          const newGender = value as Choices["gender"];
          if (newGender === "male") {
            next.bare_leg = true;
            if (!MALE_BODY_TYPE.includes(next.body_type as any)) {
              next.body_type = "lean";
            }
          } else {
            if (!FEMALE_BODY_TYPE.includes(next.body_type as any)) {
              next.body_type = "pear";
            }
            if (prev.bottom_style === "bath_towel") {
              next.bottom_style = "none";
            }
          }
        }

        if (key === "top_style") {
          const newTopStyle = value as Choices["top_style"];
          if (TOP_STYLE_HAS_BOTTOM[newTopStyle] || newTopStyle === "bath_towel") {
            next.bottom_style = "none";
          }
        }

        if (key === "pose") {
          const newPose = value as string;
          const BED_SCENES = ["dorm_room", "bedroom", "hotel_suite"];

          if (newPose === "mobile_bed_prone") {
            if (!BED_SCENES.includes(next.scene_location as string)) {
              next.scene_location = "dorm_room";
            }
          }
        }

        if (key === "scene_location") {
          const newScene = value as Choices["scene_location"];

          if (
            SIDE_LIE_SCENE_RESTRICTIONS.includes(newScene) &&
            prev.pose === "mobile_side_lie"
          ) {
            next.pose = STYLE_PRESETS[prev.style_mode].pose.find((p) => p !== "mobile_side_lie") ?? prev.pose;
          }

          const BED_SCENES = ["dorm_room", "bedroom", "hotel_suite", "luxury_apartment"];
          const BED_POSES = ["mobile_bed_prone", "dorm_bed_relax", "pov_bed_twist"];
          if (!BED_SCENES.includes(newScene) && BED_POSES.includes(prev.pose)) {
            next.pose = STYLE_PRESETS[prev.style_mode].pose.find(p => !BED_POSES.includes(p)) ?? prev.pose;
          }

          if (
            newScene === "beach_sunset" &&
            BEACH_FORBIDDEN_POSE_SET.has(next.pose)
          ) {
            next.pose = STYLE_PRESETS[prev.style_mode].pose.find((p) => !BEACH_FORBIDDEN_POSE_SET.has(p)) ?? next.pose;
          }

          const nightScenes: Choices["scene_location"][] = ["convenience_store", "night_market"];
          const outdoorNaturalScenes: Choices["scene_location"][] = ["beach_sunset", "street_corner", "city_street"];
          const urbanColorfulScenes: Choices["scene_location"][] = ["cafe", "restaurant_booth"];

          if (nightScenes.includes(newScene)) {
            next.lighting = "color_wash";
          } else if (outdoorNaturalScenes.includes(newScene)) {
            next.lighting = "soft_beauty";
          } else if (prev.style_mode === "studio_elegant" && !urbanColorfulScenes.includes(newScene)) {
            next.lighting = "glam_high_key";
          } else {
            next.lighting = "soft_beauty";
          }
        }

        if (key === "bottom_style") {
          const newBottomStyle = value as Choices["bottom_style"];
          if (newBottomStyle === "bath_towel" && prev.top_style === "bath_towel") {
            next.top_style = "none";
          }
        }

        if (key === "top_style" && prev.bottom_style === "bath_towel" && gender === "male") {
          const newTopStyle = value as Choices["top_style"];
          if (newTopStyle === "bath_towel") {
            return prev;
          }
        }

        return next;
      });
    },
    []
  );

  const updateStyle = useCallback((mode: StyleMode) => {
    setChoices((prev) => {
      const preset = STYLE_PRESETS[mode];
      return {
        ...prev,
        style_mode: mode,
        lighting: PRESET_LIGHTING[mode],
        mood: preset.mood.includes(prev.mood) ? prev.mood : preset.mood[0],
        hair_style: preset.hair_style.includes(prev.hair_style) ? prev.hair_style : preset.hair_style[0],
        top_style: preset.top_style.includes(prev.top_style) ? prev.top_style : preset.top_style[0],
        bottom_style: preset.bottom_style.includes(prev.bottom_style) ? prev.bottom_style : preset.bottom_style[0],
        footwear_style: preset.footwear_style.includes(prev.footwear_style)
          ? prev.footwear_style
          : preset.footwear_style[0],
        hair_clip: preset.hair_clip.includes(prev.hair_clip) ? prev.hair_clip : preset.hair_clip[0],
        earrings: preset.earrings.includes(prev.earrings) ? prev.earrings : preset.earrings[0],
        makeup_style: preset.makeup_style.includes(prev.makeup_style) ? prev.makeup_style : preset.makeup_style[0],
        makeup_intensity: preset.makeup_intensity.includes(prev.makeup_intensity) ? prev.makeup_intensity : preset.makeup_intensity[0],
        pose: preset.pose.includes(prev.pose) ? prev.pose : preset.pose[0],
        scene_location: preset.scene_location.includes(prev.scene_location)
          ? prev.scene_location
          : preset.scene_location[0]
      };
    });
  }, []);

  const poseShowsLowerBody = POSE_LOWER_BODY_VISIBILITY[choices.pose];
  const lowerBodyLocked = choices.style_mode === "mobile_front" && !poseShowsLowerBody;
  const gender = choices.gender || "female";
  const topIncludesBottom = TOP_STYLE_HAS_BOTTOM[choices.top_style] ||
    (choices.top_style === "bath_towel");
  const bottomIncludesTop = choices.bottom_style === "bath_towel" && gender === "male";
  const isBareLeg = choices.bare_leg;
  const isBareFace = choices.bare_makeup;

  useEffect(() => {
    if (lowerBodyLocked && choices.bare_leg) {
      setChoices((prev) => {
        if (prev.bare_leg) {
          return { ...prev, bare_leg: false };
        }
        return prev;
      });
    }
  }, [lowerBodyLocked, choices.bare_leg]);

  return {
    choices,
    update,
    reroll,
    updateStyle,
    lowerBodyLocked,
    topIncludesBottom,
    bottomIncludesTop,
    isBareLeg,
    isBareFace
  };
}