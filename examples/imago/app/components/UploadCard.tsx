"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Props = {
  onImagesSelected: (dataUrls: string[]) => void;
  currentImages?: string[];
  disabled?: boolean;
  registerOpenPicker?: (fn: () => void) => void;
  maxImages?: number;
};

export function UploadCard({
  onImagesSelected,
  currentImages = [],
  disabled,
  registerOpenPicker,
  maxImages = 2
}: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  const inputRef = useRef<HTMLInputElement>(null);
  const modalImgRef = useRef<HTMLImageElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (registerOpenPicker) {
      registerOpenPicker(() => {
        if (!disabled) {
          inputRef.current?.click();
        }
      });
    }
  }, [registerOpenPicker, disabled]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = Array.from(files);
    const readers = selected.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((results) => {
      const nextImages = results.filter(Boolean);
      if (maxImages === 1) {
        onImagesSelected(nextImages.slice(0, 1));
        return;
      }
      const merged = [...currentImages, ...nextImages].slice(0, maxImages);
      onImagesSelected(merged);
    });
  }, [currentImages, maxImages, onImagesSelected]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    if (disabled) return;
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) {
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        handleFiles(dt.files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, handleFiles]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handlePreview = (src: string) => {
    setPreviewSrc(src);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        multiple
        onChange={handleChange}
        disabled={disabled}
      />

      {currentImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {currentImages.map((src, idx) => (
            <div
              key={idx}
              className="group relative w-24 h-24 rounded-lux overflow-hidden border border-lux-line bg-lux-surface shadow-lux-soft transition-transform duration-200 hover:-translate-y-1 hover:shadow-lux cursor-pointer"
              onClick={() => handlePreview(src)}
            >
              <img src={src} alt={`${t.uploaded} ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = currentImages.filter((_, i) => i !== idx);
                  onImagesSelected(next);
                }}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label={t.delete_image}
                title={t.delete}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative group rounded-sm border transition-all duration-500 p-10 text-center flex flex-col items-center justify-center min-h-[240px] ${disabled
          ? "border-lux-line bg-lux-surface opacity-40 cursor-not-allowed"
          : "border-lux-line bg-lux-bg hover:bg-lux-surface hover:border-lux-text/30 cursor-pointer"
          }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
      >
        <div className="flex flex-col items-center gap-6 transition-transform duration-500 group-hover:-translate-y-1">
          <div className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-500 ${disabled ? "border-lux-line text-lux-muted" : "border-lux-line text-lux-text group-hover:border-lux-text group-hover:bg-lux-text group-hover:text-lux-bg group-hover:scale-110"
            }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform duration-500 group-hover:rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="square" strokeLinejoin="miter" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-lux-text tracking-[0.2em]">
              {currentImages.length >= maxImages ? t.limit_reached : currentImages.length ? t.add_more : t.upload_image}
            </p>
            <p className="text-[10px] text-lux-muted tracking-wider opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {currentImages.length >= maxImages ? t.max_images.replace("{0}", maxImages.toString()) : t.drag_drop_paste}
            </p>
          </div>
        </div>

        
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lux-text/0 group-hover:border-lux-text/20 transition-colors duration-500" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-lux-text/0 group-hover:border-lux-text/20 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-lux-text/0 group-hover:border-lux-text/20 transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lux-text/0 group-hover:border-lux-text/20 transition-colors duration-500" />
      </div>

      {previewOpen && previewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="relative max-w-3xl w-full bg-lux-surface rounded-lux overflow-hidden shadow-lux">
            <button
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/70 text-white text-lg flex items-center justify-center hover:bg-black/80 transition"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewOpen(false);
              }}
              aria-label={t.close_preview}
            >
              ✕
            </button>
            <div className="bg-black">
              <img
                ref={modalImgRef}
                src={previewSrc}
                alt={t.preview}
                className="w-full h-auto max-h-[80vh] object-contain bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}