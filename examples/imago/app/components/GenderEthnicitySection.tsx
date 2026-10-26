"use client";

import { Choices } from "@lib/schema";
import { Select } from "./Select";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Option = Readonly<{ label: string; value: string }>;

type Props = {
  gender: Choices["gender"];
  ethnicity: Choices["ethnicity"];
  onGenderChange: (value: Choices["gender"]) => void;
  onEthnicityChange: (value: Choices["ethnicity"]) => void;
  genderOptions: ReadonlyArray<Option>;
  ethnicityOptions: ReadonlyArray<Option>;
  isReferenceMode: boolean;
};

export function GenderEthnicitySection({
  gender,
  ethnicity,
  onGenderChange,
  onEthnicityChange,
  genderOptions,
  ethnicityOptions,
  isReferenceMode
}: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Select
            label={t.gender_label}
            value={gender || "female"}
            onChange={(value) => onGenderChange(value as Choices["gender"])}
            items={genderOptions}
            disabled={isReferenceMode}
          />
        </div>
        <div>
          <Select
            label={t.ethnicity_label}
            value={ethnicity || "east_asian"}
            onChange={(value) => onEthnicityChange(value as Choices["ethnicity"])}
            items={ethnicityOptions}
            disabled={isReferenceMode}
          />
        </div>
      </div>
      {isReferenceMode && (
        <p className="text-xs text-neutral-500">
          {t.reference_locked_note}
        </p>
      )}
    </>
  );
}