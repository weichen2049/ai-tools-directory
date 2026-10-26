"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT, ENGLISH_ONLY_TEXT } from "@lib/i18n";
import { emitOpenRechargeModal } from "@lib/rechargeEvents";

type ResultPanelProps = {
  img: string | null;
  loading: boolean;
  progress: number;
  progressMessage: string | null;
  downloading: boolean;
  downloadError: string | null;
  onPreviewOpen: () => void;
  onDownload: () => void;
  canContinueEdit: boolean;
  onContinueEdit: () => void;
  isContinuingEdit: boolean;
  uploadingReference: boolean;
  referenceUploadError: string | null;
  referenceImageForDisplay: string | null;
  onReferencePreviewOpen: () => void;
  className?: string;
  canvasHeightClass?: string;
  standbyBackgroundImage?: string | null;
  standbyContent?: ReactNode;
  errorMessage?: string | null;
  aspectRatioHint?: string | null;
  showRechargeCTA?: boolean;
  onAnimate?: (imageUrl: string) => void;
};

export function ResultPanel({
  img,
  loading,
  progress,
  progressMessage,
  downloading,
  downloadError,
  onPreviewOpen,
  onDownload,
  canContinueEdit,
  onContinueEdit,
  isContinuingEdit,
  uploadingReference,
  referenceUploadError,
  referenceImageForDisplay,
  onReferencePreviewOpen,
  className = "",
  canvasHeightClass = "h-[85vh]",
  standbyBackgroundImage,
  standbyContent,
  errorMessage = null,
  aspectRatioHint = null,
  showRechargeCTA = false,
  onAnimate
}: ResultPanelProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const resolvedStandbyBg =
    standbyBackgroundImage === undefined
      ? null
      : standbyBackgroundImage;
  const resolvedStandbyContent =
    standbyContent ||
    (
      <div className="opacity-30 hover:opacity-50 transition-opacity select-none pointer-events-none">
        <p className="font-serif italic text-2xl text-white">&ldquo;{ENGLISH_ONLY_TEXT.standby_quote}&rdquo;</p>
        <div className="w-8 h-[1px] bg-white mx-auto mt-2"></div>
      </div>
    );

  useEffect(() => {
    if (!img) {
      setImageLoaded(false);
    }
  }, [img]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);


  const { lang } = useLanguage();
  const t = UI_TEXT[lang];
  const shouldShowRechargeCTA = Boolean(showRechargeCTA && errorMessage);

  const handleRechargeClick = () => {
    emitOpenRechargeModal();
  };

  return (
    <main className={`relative z-10 flex items-center justify-center bg-[#080808] w-full rounded-lg overflow-hidden ${className}`}>
      
      <div
        className={`relative ${canvasHeightClass} w-full bg-transparent shadow-none flex flex-col items-center justify-center overflow-hidden group/canvas`}
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >

        
        {!img && !loading && (
          <>
            
            {errorMessage ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 text-center">
                <div className="max-w-md w-full px-6 py-4 border border-[#E83F5B]/30 bg-[#130203]/70 text-[#F6D8DC] tracking-wide text-xs uppercase leading-relaxed shadow-[0px_10px_40px_rgba(0,0,0,0.45)]">
                  <div className="font-serif text-sm text-[#F9B3C1] mb-2 tracking-[0.4em]">
                    {ENGLISH_ONLY_TEXT.alert_label}
                  </div>
                  <div className="text-[11px] font-light normal-case text-[#FCE4E8] space-y-3">
                    <p>{errorMessage}</p>
                    {shouldShowRechargeCTA && (
                      <button
                        type="button"
                        onClick={handleRechargeClick}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 text-[11px] uppercase tracking-[0.3em] text-white/80 hover:text-white hover:border-white/60 transition-colors focus:outline-none"
                      >
                        {t.usage_panel_recharge_button}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                
                {!referenceImageForDisplay && resolvedStandbyBg && (
                  <div className="absolute inset-0 transition-transform duration-1000 ease-out">
                    <img
                      src={resolvedStandbyBg}
                      loading="lazy"
                      decoding="async"
                      className={`w-full h-full object-cover transition-all duration-1000 ease-out ${isImageHovered
                        ? "scale-105 opacity-80 saturate-100 brightness-110"
                        : "scale-100 opacity-[0.5] saturate-[80%] brightness-90"
                        }`}
                      alt=""
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 transition-opacity duration-1000 ${isImageHovered ? "opacity-40" : "opacity-80"
                      }`} />
                  </div>
                )}

                <div className="relative z-10 text-center space-y-2 transition-opacity duration-500">
                  {referenceImageForDisplay ? (
                    <div
                      className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group/ref"
                      onClick={onReferencePreviewOpen}
                    >
                      <img
                        src={referenceImageForDisplay}
                        loading="lazy"
                        decoding="async"
                        alt={ENGLISH_ONLY_TEXT.reference_label}
                        className="max-h-[60vh] max-w-[80%] object-contain opacity-100 transition-all duration-500"
                      />
                      <p className="mt-4 font-serif italic text-xl text-white/40 group-hover/ref:text-white/60 transition-colors">
                        &ldquo;{ENGLISH_ONLY_TEXT.reference_label}&rdquo;
                      </p>
                    </div>
                  ) : (
                    resolvedStandbyContent
                  )}
                </div>
              </>
            )}
          </>
        )}

        
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="w-72 max-w-full space-y-4 px-2">
              <div className="h-[1px] w-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono tracking-widest text-white/60">
                <span>{ENGLISH_ONLY_TEXT.progress_title}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <p className="text-center text-[10px] text-white/40 tracking-wide animate-pulse">
                {progressMessage || ENGLISH_ONLY_TEXT.progress_waiting}
              </p>
            </div>
          </div>
        )}
        
        {img && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={img}
              className={`max-w-full max-h-full object-contain cursor-pointer transition-all duration-700 ease-out ${imageLoaded ? "opacity-100" : "opacity-0"} ${isImageHovered ? "scale-[1.01] brightness-110" : ""}`}
              alt={ENGLISH_ONLY_TEXT.generated_result_alt}
              onLoad={() => {
                setImageLoaded(true);
              }}
              onClick={onPreviewOpen}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none" />

            
            <div
              className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-8 transition-all duration-500 z-20 ${isImageHovered ? "opacity-100 translate-y-0" : "opacity-35 translate-y-2"}`}
              style={{ textShadow: "0 1px 8px rgba(0, 0, 0, 0.6)" }}
            >
              <button
                onClick={onDownload}
                disabled={downloading}
                className="text-xs text-white/60 hover:text-white uppercase tracking-[0.2em] border-b border-transparent hover:border-white pb-1 px-2 py-1 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {downloading ? t.action_saving : t.action_save}
              </button>
              {canContinueEdit && (
                <button
                  onClick={onContinueEdit}
                  className="text-xs text-white/60 hover:text-white uppercase tracking-[0.2em] border-b border-transparent hover:border-white pb-1 px-2 py-1 transition-all"
                >
                  {t.action_edit}
                </button>
              )}
              {onAnimate && (
                <button
                  onClick={() => onAnimate(img)}
                  className="text-xs text-white/60 hover:text-white uppercase tracking-[0.2em] border-b border-transparent hover:border-white pb-1 px-2 py-1 transition-all"
                >
                  {t.action_animate}
                </button>
              )}
            </div>
          </div>
        )}
      </div>


      
      {(downloadError || referenceUploadError || errorMessage) && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 px-5 py-3 border border-[#E83F5B]/25 bg-[#1B0204]/80 backdrop-blur-md text-[#F9B3C1] text-[11px] tracking-[0.3em] uppercase shadow-lg flex flex-col gap-2 text-center">
          <span>{errorMessage || downloadError || referenceUploadError}</span>
          {shouldShowRechargeCTA && (
            <button
              type="button"
              onClick={handleRechargeClick}
              className="self-center inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 text-[11px] uppercase tracking-[0.3em] text-white/80 hover:text-white hover:border-white/60 transition-colors focus:outline-none"
            >
              {t.usage_panel_recharge_button}
            </button>
          )}
        </div>
      )}


    </main>
  );
}