"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MODEL_OPTIONS } from "@lib/models";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  excludeIds?: string[];
};

export function ModelSelector({ value, onChange, label, excludeIds = [] }: Props) {
  const filteredOptions = useMemo(
    () => MODEL_OPTIONS.filter((opt) => !excludeIds.includes(opt.id)),
    [excludeIds]
  );
  const selected = filteredOptions.find((opt) => opt.id === value) || filteredOptions[0];
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div className="flex items-center gap-4">
      <span className="text-lux-muted tracking-[0.2em] uppercase text-[10px] whitespace-nowrap pt-0.5">{label}</span>
      <div className="relative inline-flex">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="group relative rounded-full border px-5 py-2.5 text-xs tracking-[0.25em] uppercase transition-all duration-300 flex items-center gap-3 bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.35)] whitespace-nowrap min-w-[180px] justify-between"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="flex-1 text-left">{selected?.label || value}</span>
          <div className="flex items-center gap-2">
            {selected?.badge && (
              <Badge text={selected.badge.text} variant={selected.badge.variant} active />
            )}
            <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {open && (
          <div
            ref={menuRef}
            role="listbox"
            className="absolute left-0 top-full mt-2 min-w-[280px] rounded-2xl border border-white/10 bg-black/90 backdrop-blur-md shadow-xl z-40 p-2 space-y-1"
          >
            {filteredOptions.map((option) => {
              const isActive = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={`w-full rounded-xl px-4 py-3 text-xs tracking-[0.25em] uppercase transition-all duration-200 flex items-center justify-between gap-4 whitespace-nowrap ${isActive
                    ? "bg-white text-black bg-opacity-100"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  role="option"
                  aria-selected={isActive}
                >
                  <span className="truncate">{option.label}</span>
                  {option.badge && (
                    <Badge text={option.badge.text} variant={option.badge.variant} active={isActive} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function Badge({
  text,
  variant,
  active
}: {
  text: string;
  variant?: "gold" | "nsfw";
  active: boolean;
}) {
  if (variant === "gold") {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold tracking-[0.4em] ${active ? "text-amber-700" : "text-amber-200"
          }`}
      >
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-80 blur-sm"></span>
          <span className="relative px-2 py-0.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-100/80 via-amber-300/40 to-amber-100/80 text-amber-800 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]">
            {text}
          </span>
        </span>
      </span>
    );
  }
  if (variant === "nsfw") {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-[0.3em] ${active ? "text-rose-800" : "text-rose-300"
          }`}
      >
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 opacity-70 blur-sm"></span>
          <span className="relative px-2 py-0.5 rounded-full border border-rose-400 bg-gradient-to-r from-rose-600/90 via-pink-500/80 to-rose-600/90 text-white drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
            {text}
          </span>
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-current">
      {text}
    </span>
  );
}