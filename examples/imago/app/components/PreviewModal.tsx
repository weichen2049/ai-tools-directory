import React from "react";
import { createPortal } from "react-dom";
import { handleImageLoadError } from "@lib/utils/imageLoadError";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT, ENGLISH_ONLY_TEXT } from "@lib/i18n";

import { VideoPlayer } from "./VideoPlayer";

type Props = {
  url: string;
  type?: "image" | "video";
  open: boolean;
  onClose: () => void;
};

export function PreviewModal({ url, type = "image", open, onClose }: Props) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  const [isVisible, setIsVisible] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState(url);

  React.useEffect(() => {
    if (open) {
      setImageSrc(url);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open, url]);

  React.useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleImageError = () => {
    if (type === "image") {
      handleImageLoadError(imageSrc, url, setImageSrc, () => { });
    }
  };

  if (!open) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"
        }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.image_preview}
    >
      <div
        className={`relative max-h-full max-w-full transition-transform duration-200 ${isVisible ? "scale-100" : "scale-95"
          }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 rounded-full bg-white text-black text-sm px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/80 z-10"
          aria-label={t.close_preview}
        >
          {t.close}
        </button>
        {type === "video" ? (
          <div className="w-[90vw] h-[85vh] flex items-center justify-center">
            <VideoPlayer src={url} poster="/flow_preview_placeholder.png" autoPlay className="w-full h-full" />
          </div>
        ) : (
          <img
            src={imageSrc}
            alt={t.image_preview || "Preview"}
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
            loading="eager"
            onError={handleImageError}
          />
        )}
      </div>
    </div>,
    document.body
  );
}