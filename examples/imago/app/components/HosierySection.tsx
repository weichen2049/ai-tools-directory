"use client";

import { Choices } from "@lib/schema";
import { Select } from "./Select";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Option = Readonly<{ label: string; value: string }>;
type OptionGroup = Readonly<{ groupLabel: string; options: ReadonlyArray<Option> }>;

type Props = {
  isBareLeg: boolean;
  hosieryType: Choices["hosiery_type"];
  hosieryColor: Choices["hosiery_color"];
  hosieryMaterial: Choices["hosiery_material"];
  hosieryDenier: Choices["hosiery_denier"];
  onTypeChange: (value: Choices["hosiery_type"]) => void;
  onColorChange: (value: Choices["hosiery_color"]) => void;
  onMaterialChange: (value: Choices["hosiery_material"]) => void;
  onDenierChange: (value: Choices["hosiery_denier"]) => void;
  hosieryTypeOptions: ReadonlyArray<OptionGroup>;
  hosieryColorOptions: ReadonlyArray<Option>;
  hosieryMaterialOptions: ReadonlyArray<Option>;
  hosieryDenierOptions: ReadonlyArray<Option>;
  lowerBodyLocked: boolean;
  isWoolHosiery: boolean;
  isFishnetMaterial: boolean;
  isSilkType: boolean;
  disabledByBodyPart?: boolean;
  bodyPartNote?: string;
};

export function HosierySection({
  isBareLeg,
  hosieryType,
  hosieryColor,
  hosieryMaterial,
  hosieryDenier,
  onTypeChange,
  onColorChange,
  onMaterialChange,
  onDenierChange,
  hosieryTypeOptions,
  hosieryColorOptions,
  hosieryMaterialOptions,
  hosieryDenierOptions,
  lowerBodyLocked,
  isWoolHosiery,
  isFishnetMaterial,
  isSilkType,
  disabledByBodyPart = false,
  bodyPartNote
}: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];
  const disabled = disabledByBodyPart || isBareLeg || lowerBodyLocked;

  const showDenier = isSilkType;

  return (
    <>
      <div className="grid gap-3 grid-cols-2">
        <Select
          label={t.hosiery_type_label}
          value={hosieryType}
          onChange={(value) => onTypeChange(value as Choices["hosiery_type"])}
          items={hosieryTypeOptions}
          disabled={disabled}
        />
        <Select
          label={t.hosiery_color_label}
          value={hosieryColor}
          onChange={(value) => onColorChange(value as Choices["hosiery_color"])}
          items={hosieryColorOptions}
          disabled={disabled}
        />
        <Select
          label={t.hosiery_material_label}
          value={hosieryMaterial}
          onChange={(value) => onMaterialChange(value as Choices["hosiery_material"])}
          items={hosieryMaterialOptions}
          disabled={disabled}
        />
        {showDenier && (
          <Select
            label={t.hosiery_denier_label}
            value={String(hosieryDenier)}
            onChange={(value) => onDenierChange(Number(value) as Choices["hosiery_denier"])}
            items={hosieryDenierOptions}
            disabled={disabled || isWoolHosiery || isFishnetMaterial}
          />
        )}
      </div>
      {disabledByBodyPart && (
        <p className="text-xs text-neutral-500 -mt-1">
          {bodyPartNote || t.hosiery_locked_note}
        </p>
      )}
      {isBareLeg && !lowerBodyLocked && !disabledByBodyPart && (
        <p className="text-xs text-neutral-500 -mt-1">{t.hosiery_bare_leg_note}</p>
      )}
      {lowerBodyLocked && (
        <p className="text-xs text-neutral-500 -mt-1">{t.hosiery_pose_note}</p>
      )}
      {isWoolHosiery && showDenier && (
        <p className="text-xs text-neutral-500 -mt-1">{t.hosiery_wool_note}</p>
      )}
      {isFishnetMaterial && showDenier && (
        <p className="text-xs text-neutral-500 -mt-1">{t.hosiery_fishnet_note}</p>
      )}
    </>
  );
}