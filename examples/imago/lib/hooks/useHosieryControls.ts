import { useCallback, useMemo } from "react";
import { Choices } from "@lib/schema";
import { getLocalizedOptions, UI_TEXT } from "@lib/i18n";
import { HOSIERY_SILK_TYPES, HOSIERY_SOCK_TYPES, isSilkHosiery } from "@lib/options";

type UpdateFn = <K extends keyof Choices>(key: K, value: Choices[K]) => void;

const SILK_MATERIALS = ["velvet", "core_spun", "glossy", "woolen", "fishnet_large", "fishnet_small"] as const;
const SOCK_MATERIALS = ["cotton", "knit"] as const;

export function useHosieryControls(choices: Choices, update: UpdateFn, lang: "zh" | "en" = "zh") {
  const isFishnetMaterial =
    choices.hosiery_material === "fishnet_large" || choices.hosiery_material === "fishnet_small";
  const isWoolHosiery = choices.hosiery_material === "woolen";
  const isSilkType = isSilkHosiery(choices.hosiery_type);

  const hosieryTypeGroupedOptions = useMemo(() => {
    const allTypes = getLocalizedOptions("hosiery_type", lang);
    const t = UI_TEXT[lang];

    const silkOptions = allTypes.filter((opt: { value: string }) =>
      HOSIERY_SILK_TYPES.includes(opt.value as typeof HOSIERY_SILK_TYPES[number])
    );
    const sockOptions = allTypes.filter((opt: { value: string }) =>
      HOSIERY_SOCK_TYPES.includes(opt.value as typeof HOSIERY_SOCK_TYPES[number])
    );

    return [
      { groupLabel: t.hosiery_group_silk, options: silkOptions },
      { groupLabel: t.hosiery_group_socks, options: sockOptions }
    ];
  }, [lang]);

  const hosieryMaterialOptions = useMemo(() => {
    const materials = getLocalizedOptions("hosiery_material", lang);

    if (!isSilkType) {
      return materials.filter((opt: { value: string }) =>
        (SOCK_MATERIALS as readonly string[]).includes(opt.value)
      );
    }

    if (choices.hosiery_type === "fishnet") {
      return materials.filter(
        (option: { value: string }) => option.value === "fishnet_large" || option.value === "fishnet_small"
      );
    }
    return materials.filter((opt: { value: string }) =>
      (SILK_MATERIALS as readonly string[]).includes(opt.value) &&
      opt.value !== "fishnet_large" && opt.value !== "fishnet_small"
    );
  }, [choices.hosiery_type, isSilkType, lang]);

  const handleMaterialChange = useCallback(
    (value: Choices["hosiery_material"]) => {
      update("hosiery_material", value);
      if (value === "woolen") {
        update("hosiery_denier", 80 as Choices["hosiery_denier"]);
      } else if (value === "fishnet_large" || value === "fishnet_small") {
        update("hosiery_type", "fishnet");
        update("hosiery_denier", 0 as Choices["hosiery_denier"]);
      } else if (choices.hosiery_type === "fishnet") {
        update("hosiery_type", "pantyhose");
        if (choices.hosiery_denier === 0) {
          update("hosiery_denier", 40 as Choices["hosiery_denier"]);
        }
      }
    },
    [choices.hosiery_denier, choices.hosiery_type, update]
  );

  const handleTypeChange = useCallback(
    (value: Choices["hosiery_type"]) => {
      update("hosiery_type", value);
      const newIsSilk = isSilkHosiery(value);

      if (value === "fishnet") {
        if (!isFishnetMaterial) {
          update("hosiery_material", "fishnet_small");
        }
        update("hosiery_denier", 0 as Choices["hosiery_denier"]);
      } else if (isFishnetMaterial) {
        update("hosiery_material", newIsSilk ? "velvet" : "cotton");
        if (newIsSilk) {
          update("hosiery_denier", 40 as Choices["hosiery_denier"]);
        }
      } else if (!newIsSilk && isSilkType) {
        update("hosiery_material", "cotton");
      } else if (newIsSilk && !isSilkType) {
        update("hosiery_material", "velvet");
        update("hosiery_denier", 40 as Choices["hosiery_denier"]);
      }
    },
    [isFishnetMaterial, isSilkType, update]
  );

  return {
    hosieryTypeOptions: hosieryTypeGroupedOptions,
    hosieryMaterialOptions,
    isWoolHosiery,
    isFishnetMaterial,
    isSilkType,
    handleMaterialChange,
    handleTypeChange
  };
}
