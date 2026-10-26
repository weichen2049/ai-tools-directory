import { ComponentPropsWithoutRef } from "react";

type Option = Readonly<{
  label: string;
  value: string;
}>;

type Props = {
  label: string;
  items: ReadonlyArray<Option>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  columns?: number;
  variant?: "pill" | "text";
};

export function ButtonSelect({
  label,
  items,
  value,
  onChange,
  disabled = false,
  className = "",
  columns,
  variant = "pill"
}: Props) {
  const gridCols = columns || items.length;
  const isTextVariant = variant === "text";
  const gridClassMap: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9"
  };
  const gridClass = gridClassMap[gridCols] || "grid-cols-3";

  return (
    <div className={`block text-sm ${className}`}>
      <span className="text-lux-muted tracking-[0.08em] uppercase text-[11px] mb-1.5 block">{label}</span>
      <div className={isTextVariant ? "flex flex-wrap gap-x-6 gap-y-3" : `grid gap-2 ${gridClass}`}>
        {items.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={
                isTextVariant
                  ? `
                    relative text-sm font-light transition-all duration-200
                    focus:outline-none focus-visible:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSelected ? "text-white font-semibold" : "text-lux-muted hover:text-white"}
                  `
                  : `
                    px-3 py-2 rounded-lux text-sm font-medium transition-colors duration-200
                    focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus:ring-0
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isSelected
                    ? "bg-lux-text text-lux-bg"
                    : "bg-lux-surface border border-lux-line text-lux-muted hover:border-lux-text/30 hover:text-lux-text"
                  }
                  `
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}