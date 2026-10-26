import { useEffect, useRef, useState } from "react";

type Option = Readonly<{
  label: string;
  value: string;
  badge?: {
    text: string;
    variant?: "gold";
  };
}>;

type OptionGroup = Readonly<{
  groupLabel: string;
  options: ReadonlyArray<Option>;
}>;

type Props = {
  label: string;
  items: ReadonlyArray<Option> | ReadonlyArray<OptionGroup>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function isGrouped(items: Props["items"]): items is ReadonlyArray<OptionGroup> {
  return items.length > 0 && "groupLabel" in items[0];
}

export function Select({ label, items, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const flatItems = isGrouped(items)
    ? items.flatMap((g) => g.options)
    : items;
  const currentOption = flatItems.find((o) => o.value === value);
  const current = currentOption?.label ?? "";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const renderOption = (option: Option) => {
    const isActive = option.value === value;
    return (
      <li
        key={option.value}
        className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors ${isActive
          ? "text-lux-text bg-lux-surface"
          : "text-lux-muted hover:text-lux-text hover:bg-lux-surface/50"
          }`}
        onClick={(e) => {
          e.stopPropagation();
          handleSelect(option.value);
        }}
      >
        <span className="truncate tracking-wide flex items-center gap-2">
          <span className="text-lux-text">{option.label}</span>
          {option.badge && (
            <Badge text={option.badge.text} variant={option.badge.variant} />
          )}
        </span>
        {isActive && (
          <span className="w-1 h-1 rounded-full bg-lux-accent" />
        )}
      </li>
    );
  };

  return (
    <div className="block text-sm w-full">
      <span className="text-lux-muted tracking-[0.15em] uppercase text-[10px] mb-2 block font-medium">{label}</span>
      <div ref={wrapperRef} className={`relative group w-full font-sans ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
        <button
          type="button"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-3 border-b border-lux-line hover:border-lux-text/30 transition-colors duration-300 text-left focus:outline-none focus-visible:outline-none rounded-none"
          disabled={disabled}
        >
          <div className="truncate">
            <div className="text-sm font-normal tracking-wide truncate text-lux-text flex items-center gap-2">
              {current}
              {currentOption?.badge && (
                <Badge text={currentOption.badge.text} variant={currentOption.badge.variant} />
              )}
            </div>
          </div>
          <svg
            className={`w-3 h-3 text-lux-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          className={`absolute top-full left-0 w-full mt-1 bg-lux-bg border border-lux-line shadow-lux transition-all duration-200 z-50 overflow-hidden ${open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1 pointer-events-none"
            }`}
        >
          <ul className="max-h-[240px] overflow-y-auto custom-scrollbar py-1">
            {isGrouped(items)
              ? items.map((group) => (
                <li key={group.groupLabel}>
                  <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-lux-muted font-semibold border-b border-lux-line/30 bg-lux-surface/30">
                    {group.groupLabel}
                  </div>
                  <ul>
                    {group.options.map(renderOption)}
                  </ul>
                </li>
              ))
              : items.map(renderOption)
            }
          </ul>
        </div>
      </div>
    </div>
  );
}


function Badge({ text, variant }: { text: string; variant?: "gold" }) {
  if (variant === "gold") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200 border border-amber-300 rounded-full bg-amber-500/20 shadow-[0_0_8px_rgba(251,191,36,0.6)]">
        {text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-lux-text border border-lux-line rounded-full bg-lux-surface/60">
      {text}
    </span>
  );
}