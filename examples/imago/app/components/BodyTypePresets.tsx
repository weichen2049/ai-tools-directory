"use client";

import { type Choices } from "@lib/schema";
import { OPTIONS } from "@lib/options";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT, getLocalizedOptions } from "@lib/i18n";

type Props = {
  gender: Choices["gender"];
  currentValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export function BodyTypePresets({ gender, currentValue, onSelect, disabled }: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  let optionsList: any = [];
  const currentGender = gender || "female";

  if (currentGender === "male") {
    optionsList = getLocalizedOptions("male_body_type", lang);
  } else if (currentGender === "agender") {
    const maleOpts = getLocalizedOptions("male_body_type", lang);
    const femaleOpts = getLocalizedOptions("female_body_type", lang);
    optionsList = [...femaleOpts, ...maleOpts];
  } else {
    optionsList = getLocalizedOptions("female_body_type", lang);
  }

  return (
    <div className="space-y-2">
      <label className="text-lux-muted tracking-[0.08em] uppercase text-[11px]">{t.body_type_presets}</label>
      <div className="flex flex-wrap gap-4">
        {optionsList.map((type: { label: string; value: string }) => {
          const isActive = type.value === currentValue;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onSelect(type.value)}
              disabled={disabled}
              className={`
                text-sm font-light transition-all duration-200
                focus:outline-none focus-visible:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? "text-white font-semibold" : "text-lux-muted hover:text-white"}
              `}
            >
              {type.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}