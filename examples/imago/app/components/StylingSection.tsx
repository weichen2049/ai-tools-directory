"use client";

import { Choices } from "@lib/schema";
import { Select } from "./Select";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Option = Readonly<{ label: string; value: string }>;

type Props = {
  hairStyle: Choices["hair_style"];
  hairColor?: Choices["hair_color"];
  topStyle: Choices["top_style"];
  bottomStyle: Choices["bottom_style"];
  footwearStyle: Choices["footwear_style"];
  onHairStyleChange: (value: Choices["hair_style"]) => void;
  onHairColorChange?: (value: Choices["hair_color"]) => void;
  onTopStyleChange: (value: Choices["top_style"]) => void;
  onBottomStyleChange: (value: Choices["bottom_style"]) => void;
  onFootwearStyleChange: (value: Choices["footwear_style"]) => void;
  hairStyleOptions: ReadonlyArray<Option>;
  hairColorOptions?: ReadonlyArray<Option>;
  topStyleOptions: ReadonlyArray<Option>;
  bottomStyleOptions: ReadonlyArray<Option>;
  footwearOptions: ReadonlyArray<Option>;
  lowerBodyLocked: boolean;
  topIncludesBottom: boolean;
  bottomIncludesTop?: boolean;
  styleMode?: Choices["style_mode"];
  disableHair?: boolean;
  disableHairColor?: boolean;
  disableTopStyle?: boolean;
  disableBottomStyle?: boolean;
  disableFootwearStyle?: boolean;
  bodyPartNotes?: string[];
};

export function StylingSection({
  hairStyle,
  hairColor,
  topStyle,
  bottomStyle,
  footwearStyle,
  onHairStyleChange,
  onHairColorChange,
  onTopStyleChange,
  onBottomStyleChange,
  onFootwearStyleChange,
  hairStyleOptions,
  hairColorOptions,
  topStyleOptions,
  bottomStyleOptions,
  footwearOptions,
  lowerBodyLocked,
  topIncludesBottom,
  bottomIncludesTop = false,
  styleMode,
  disableHair = false,
  disableHairColor = false,
  disableTopStyle = false,
  disableBottomStyle = false,
  disableFootwearStyle = false,
  bodyPartNotes = []
}: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  return (
    <>
      <div className="grid gap-3 grid-cols-2">
        <Select
          label={t.hair_style_label}
          value={hairStyle}
          onChange={(value) => onHairStyleChange(value as Choices["hair_style"])}
          items={hairStyleOptions}
          disabled={disableHair}
        />
        {hairColorOptions && onHairColorChange && (
          <Select
            label={t.hair_color_label}
            value={hairColor || "random"}
            onChange={(value) => onHairColorChange(value as Choices["hair_color"])}
            items={hairColorOptions}
            disabled={disableHairColor || disableHair}
          />
        )}
        <Select
          label={t.top_label}
          value={topStyle}
          onChange={(value) => onTopStyleChange(value as Choices["top_style"])}
          items={topStyleOptions}
          disabled={bottomIncludesTop || disableTopStyle}
        />
        <Select
          label={t.bottom_label}
          value={bottomStyle}
          onChange={(value) => onBottomStyleChange(value as Choices["bottom_style"])}
          items={bottomStyleOptions}
          disabled={lowerBodyLocked || topIncludesBottom || disableBottomStyle}
        />
        <Select
          label={t.footwear_label}
          value={footwearStyle}
          onChange={(value) => onFootwearStyleChange(value as Choices["footwear_style"])}
          items={footwearOptions}
          disabled={lowerBodyLocked || disableFootwearStyle}
        />
      </div>
      {bodyPartNotes.length > 0 && (
        <p className="text-xs text-lux-muted -mt-1">
          {bodyPartNotes.join(" ")}
        </p>
      )}
      {lowerBodyLocked && (
        <p className="text-xs text-lux-muted -mt-1">
          {t.styling_lower_body_locked}
        </p>
      )}
      {topIncludesBottom && (
        <p className="text-xs text-lux-muted -mt-1">
          {t.styling_top_includes_bottom}
        </p>
      )}
      {bottomIncludesTop && (
        <p className="text-xs text-lux-muted -mt-1">
          {t.styling_bottom_includes_top}
        </p>
      )}
      {styleMode === "mobile_front" && !lowerBodyLocked && (
        <p className="text-xs text-lux-muted -mt-1">
          {t.styling_mobile_focus}
        </p>
      )}
    </>
  );
}