"use client";

import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Props = {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
};

const DEFAULT_OPTIONS = ["16:9", "9:16", "4:3", "3:4", "1:1"];

export function AspectRatioSelector({ value, onChange, options = DEFAULT_OPTIONS }: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  return (
    <div className="text-sm">
      <span className="text-lux-muted tracking-[0.08em] uppercase text-[11px] mb-2 block">{t.aspect_ratio_label}</span>
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => {
          const isActive = option === value;
          return (
            <button
              type="button"
              key={option}
              onClick={() => onChange(option)}
              aria-pressed={isActive}
              className={`text-sm font-light transition-all duration-200 focus:outline-none focus-visible:outline-none ${
                isActive ? "text-white font-semibold" : "text-lux-muted hover:text-white"
              }`}
            >
              <span>{option === "auto" ? t.aspect_ratio_auto : option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}