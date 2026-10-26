import { useMemo } from "react";
import { type Choices } from "@lib/schema";
import { STYLE_PRESETS } from "@lib/options";
import { getLocalizedOptions } from "@lib/i18n";

type Option = Readonly<{ label: string; value: string }>;


export function useFilteredOptions(
  styleMode: Choices["style_mode"],
  gender: Choices["gender"] = "female",
  lang: "zh" | "en" = "zh"
) {
  return useMemo(() => {
    const preset = STYLE_PRESETS[styleMode];

    const poseOptions = getLocalizedOptions("pose", lang);
    const sceneOptions = getLocalizedOptions("scene_location", lang);
    const moodOptions = getLocalizedOptions("mood", lang);
    const hairOptions = getLocalizedOptions("hair_style", lang);
    const topOptions = getLocalizedOptions("top_style", lang);
    const bottomOptions = getLocalizedOptions("bottom_style", lang);
    const footwearOptions = getLocalizedOptions("footwear_style", lang);
    const hairClipOptions = getLocalizedOptions("hair_clip", lang);
    const earringOptions = getLocalizedOptions("earrings", lang);
    const makeupStyleOptions = getLocalizedOptions("makeup_style", lang);
    const makeupIntensityOptions = getLocalizedOptions("makeup_intensity", lang);
    const neckBodyAccessoryOptions = getLocalizedOptions("neck_body_accessories", lang);


    const filteredPoses = poseOptions.filter((option: Option) => {
      if (!preset.pose.includes(option.value as Choices["pose"])) return false;
      return true;
    });

    const filteredTops = topOptions.filter((option: Option) => {
      if (!preset.top_style.includes(option.value as Choices["top_style"])) return false;
      return true;
    });

    const filteredBottoms = bottomOptions.filter((option: Option) => {
      if (!preset.bottom_style.includes(option.value as Choices["bottom_style"])) return false;
      return true;
    });

    return {
      pose: filteredPoses,
      scene: sceneOptions.filter((option: Option) =>
        preset.scene_location.includes(option.value as Choices["scene_location"])
      ),
      mood: moodOptions.filter((option: Option) => preset.mood.includes(option.value as Choices["mood"])),
      hair: hairOptions.filter((option: Option) => preset.hair_style.includes(option.value as Choices["hair_style"])),
      top: filteredTops,
      bottom: filteredBottoms,
      footwear: footwearOptions.filter((option: Option) =>
        preset.footwear_style.includes(option.value as Choices["footwear_style"])
      ),
      hairClip: hairClipOptions.filter((option: Option) =>
        preset.hair_clip.includes(option.value as Choices["hair_clip"])
      ),
      earring: earringOptions.filter((option: Option) => preset.earrings.includes(option.value as Choices["earrings"])),
      makeupStyle: makeupStyleOptions.filter((option: Option) =>
        preset.makeup_style.includes(option.value as Choices["makeup_style"])
      ),
      makeupIntensity: makeupIntensityOptions.filter((option: Option) =>
        preset.makeup_intensity.includes(option.value as Choices["makeup_intensity"])
      ),
      neckBodyAccessories: neckBodyAccessoryOptions.filter((option: Option) =>
        preset.neck_body_accessories.includes(option.value as Choices["neck_body_accessories"])
      )
    };
  }, [styleMode, gender, lang]);
}