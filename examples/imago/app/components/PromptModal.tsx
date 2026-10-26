"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Props = {
  promptText: string;
  open: boolean;
  onClose: () => void;
};

export function PromptModal({ promptText, open, onClose }: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  const [isVisible, setIsVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const copyTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setCopied(false);
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
        copyTimeout.current = null;
      }
    }
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => {
        setCopied(false);
        copyTimeout.current = null;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={t.prompt_preview}
    >
      <div
        className={`relative max-h-[80vh] w-full max-w-3xl rounded-[28px] border border-white/15 bg-[#0b0b0e]/95 text-white shadow-2xl transition-transform duration-200 ${isVisible ? "scale-100" : "scale-95"
          }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
          <p className="text-[11px] tracking-[0.3em] uppercase text-lux-muted">{t.final_prompt}</p>
          <div className="flex gap-2 text-[10px] tracking-[0.2em] uppercase">
            <button
              type="button"
              onClick={handleCopy}
              className={`rounded-full border border-white/20 px-4 py-1.5 transition-colors ${copied ? "bg-white text-black" : "text-white hover:bg-white/10"
                }`}
            >
              {copied ? t.copy_success : t.copy}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-4 py-1.5 text-white transition-colors hover:bg-white/10"
              aria-label={t.close}
            >
              {t.close}
            </button>
          </div>
        </div>
        <div className="max-h-[calc(80vh-120px)] overflow-y-auto p-6 text-sm leading-relaxed">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <pre className="whitespace-pre-wrap break-words font-mono text-[13px] text-white/90">{promptText}</pre>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}