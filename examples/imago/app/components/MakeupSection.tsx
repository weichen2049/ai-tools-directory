"use client";

import { Choices } from "@lib/schema";
import { Select } from "./Select";
import { ButtonSelect } from "./ButtonSelect";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Option = Readonly<{ label: string; value: string }>;

type Props = {
  isBareFace: boolean;
  makeupStyle: Choices["makeup_style"];
  makeupIntensity: Choices["makeup_intensity"];
  hairClip: Choices["hair_clip"];
  earrings: Choices["earrings"];
  neckBodyAccessories: Choices["neck_body_accessories"];
  glassesStyle: Choices["glasses_style"];
  onMakeupStyleChange: (value: Choices["makeup_style"]) => void;
  onMakeupIntensityChange: (value: Choices["makeup_intensity"]) => void;
  onHairClipChange: (value: Choices["hair_clip"]) => void;
  onEarringChange: (value: Choices["earrings"]) => void;
  onNeckBodyAccessoriesChange: (value: Choices["neck_body_accessories"]) => void;
  onGlassesStyleChange: (value: Choices["glasses_style"]) => void;
  makeupStyleOptions: ReadonlyArray<Option>;
  makeupIntensityOptions: ReadonlyArray<Option>;
  hairClipOptions: ReadonlyArray<Option>;
  earringOptions: ReadonlyArray<Option>;
  neckBodyAccessoriesOptions: ReadonlyArray<Option>;
  glassesOptions: ReadonlyArray<Option>;
  disableMakeup?: boolean;
  disableAccessories?: boolean;
  bodyPartNotes?: string[];
};

export function MakeupSection({
  isBareFace,
  makeupStyle,
  makeupIntensity,
  hairClip,
  earrings,
  neckBodyAccessories,
  glassesStyle,
  onMakeupStyleChange,
  onMakeupIntensityChange,
  onHairClipChange,
  onEarringChange,
  onNeckBodyAccessoriesChange,
  onGlassesStyleChange,
  makeupStyleOptions,
  makeupIntensityOptions,
  hairClipOptions,
  earringOptions,
  neckBodyAccessoriesOptions,
  glassesOptions,
  disableMakeup = false,
  disableAccessories = false,
  bodyPartNotes = []
}: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];
  const makeupControlsDisabled = disableMakeup || isBareFace;

  return (
    <>
      <div className="space-y-3">
        <ButtonSelect
          label={t.makeup_style_label}
          value={makeupStyle}
          onChange={(value) => onMakeupStyleChange(value as Choices["makeup_style"])}
          items={makeupStyleOptions}
          disabled={makeupControlsDisabled}
          columns={4}
          variant="text"
        />
        <ButtonSelect
          label={t.makeup_intensity_label}
          value={makeupIntensity}
          onChange={(value) => onMakeupIntensityChange(value as Choices["makeup_intensity"])}
          items={makeupIntensityOptions}
          disabled={makeupControlsDisabled}
          columns={3}
          variant="text"
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={t.hair_accessory_label}
            value={hairClip}
            onChange={(value) => onHairClipChange(value as Choices["hair_clip"])}
            items={hairClipOptions}
            disabled={disableAccessories}
          />
          <Select
            label={t.earring_label}
            value={earrings}
            onChange={(value) => onEarringChange(value as Choices["earrings"])}
            items={earringOptions}
            disabled={disableAccessories}
          />
          <Select
            label={t.neck_body_accessory_label}
            value={neckBodyAccessories}
            onChange={(value) => onNeckBodyAccessoriesChange(value as Choices["neck_body_accessories"])}
            items={neckBodyAccessoriesOptions}
            disabled={disableAccessories}
          />
          <Select
            label={t.glasses_label}
            value={glassesStyle}
            onChange={(value) => onGlassesStyleChange(value as Choices["glasses_style"])}
            items={glassesOptions}
            disabled={disableAccessories}
          />
        </div>
      </div>
      {bodyPartNotes.length > 0 && (
        <p className="text-xs text-lux-muted -mt-1">
          {bodyPartNotes.join(" ")}
        </p>
      )}
      {!disableMakeup && isBareFace && (
        <p className="text-xs text-lux-muted -mt-1">{t.bare_face_note}</p>
      )}
    </>
  );
}