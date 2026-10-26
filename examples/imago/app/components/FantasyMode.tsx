"use client";

import { useCallback, useEffect, useState } from "react";
import { type Choices } from "@lib/schema";
import { type StyleMode } from "@lib/options";
import { type PresetId } from "@lib/presets";
import { useGenerationProgress } from "../hooks/useGenerationProgress";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { useChoices } from "../hooks/useChoices";
import { ResultPanel } from "./ResultPanel";
import { PreviewModal } from "./PreviewModal";
import { PromptModal } from "./PromptModal";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";
import { useModelPreference } from "../hooks/useModelPreference";
import { ModelSelector } from "./ModelSelector";
import { ProImageSizeSelector } from "./ProImageSizeSelector";
import { isProModel, type ProImageSize } from "@lib/models";
import { GenderGateway } from "./GenderGateway";
import { FantasyControls } from "./FantasyControls";
import { STORAGE_KEYS } from "@lib/publicEnv";

type FantasyModeProps = {
  initialGender?: "female" | "male" | "agender" | null;
  onSwitchToFreeform: (imageUrl?: string) => void;
  onSwitchToFlow: (imageUrl: string) => void;
  isActive: boolean;
};

export function FantasyMode({ initialGender, onSwitchToFreeform, onSwitchToFlow, isActive }: FantasyModeProps) {
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];
  const GENDER_STORAGE_KEY = STORAGE_KEYS.genderSelected;
  const { modelId, setModelId } = useModelPreference();
  const [proImageSize, setProImageSize] = useState<ProImageSize>("1K");

  const {
    choices,
    update,
    updateStyle,
    lowerBodyLocked,
    topIncludesBottom,
    bottomIncludesTop,
    isBareLeg,
    isBareFace,
    reroll
  } = useChoices();

  const {
    img,
    loading,
    error,
    insufficientCreditsError,
    previewOpen,
    downloading,
    downloadError,
    lastGeneratedConfig,
    promptText,
    referenceImageForDisplay,
    uploadingReference,
    referenceUploadError,
    isReferenceMode,
    onGenerate,
    handlePreviewOpen,
    handlePreviewClose,
    handleDownload,
    handleContinueEdit
  } = useImageGeneration({ onSwitchToFreeform });

  const isContinuingEdit = Boolean(referenceImageForDisplay);
  const canContinueEdit = Boolean(img && lastGeneratedConfig);

  const [hasSelectedGender, setHasSelectedGender] = useState(Boolean(initialGender));
  const [isEntering, setIsEntering] = useState(Boolean(initialGender));

  const { progress, progressMessage, startProgress, completeProgress, failProgress } =
    useGenerationProgress(isReferenceMode ? "reference" : "generate", choices.gender || "female");

  const [promptPreviewOpen, setPromptPreviewOpen] = useState(false);
  const [referencePreviewOpen, setReferencePreviewOpen] = useState(false);

  useEffect(() => {
    if (initialGender) {
      update("gender", initialGender);
    }
  }, [initialGender, update]);

  useEffect(() => {
    if (hasSelectedGender || isContinuingEdit || typeof window === "undefined") return;
    const stored = window.sessionStorage.getItem(GENDER_STORAGE_KEY);
    if (stored === "female" || stored === "male" || stored === "agender") {
      update("gender", stored);
      setHasSelectedGender(true);
      setIsEntering(false);
    }
  }, [hasSelectedGender, isContinuingEdit, update]);

  useEffect(() => {
    if (isContinuingEdit) {
      setHasSelectedGender(true);
    }
  }, [isContinuingEdit]);

  useEffect(() => {
    if (hasSelectedGender && isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [hasSelectedGender, isEntering]);

  const handleGatewaySelect = useCallback((gender: "female" | "male" | "agender") => {
    update("gender", gender);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(GENDER_STORAGE_KEY, gender);
    }
    setIsEntering(true); // Start with entering state for animation
    setHasSelectedGender(true);
  }, [update]);

  const handleGenerate = useCallback(() => {
    onGenerate(choices, startProgress, completeProgress, failProgress, modelId, isProModel(modelId) ? proImageSize : undefined);
  }, [onGenerate, choices, startProgress, completeProgress, failProgress, modelId, proImageSize]);

  const handlePromptPreviewOpen = useCallback(() => {
    if (promptText) {
      setPromptPreviewOpen(true);
    }
  }, [promptText]);
  const handlePromptPreviewClose = useCallback(() => {
    setPromptPreviewOpen(false);
  }, []);

  const handleReferencePreviewOpen = useCallback(() => {
    if (referenceImageForDisplay) {
      setReferencePreviewOpen(true);
    }
  }, [referenceImageForDisplay]);
  const handleReferencePreviewClose = useCallback(() => {
    setReferencePreviewOpen(false);
  }, []);

  if (isActive && !hasSelectedGender && !isContinuingEdit) {
    return <GenderGateway onSelect={handleGatewaySelect} />;
  }



  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

  return (
    <>
      <div
        className={`flex flex-col lg:grid gap-8 lg:grid-cols-[400px_1fr] lg:h-[calc(100vh-8rem)] lg:min-h-[640px] items-stretch transition-all duration-500 ${isEntering ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
      >
        <div className="pr-0 lg:pr-6 lg:h-full lg:min-h-0 lg:border-r border-lux-line">
          <FantasyControls
            lang={lang}
            choices={choices}
            update={update}
            updateStyle={updateStyle}
            reroll={reroll}
            lowerBodyLocked={lowerBodyLocked}
            topIncludesBottom={topIncludesBottom}
            bottomIncludesTop={bottomIncludesTop}
            isContinuingEdit={isContinuingEdit}
          />
        </div>

        <div className="flex flex-col gap-6 lg:h-full lg:min-h-0 lg:pl-4">
          <div className="flex-1 flex flex-col min-h-0 gap-4">
            <ModelSelector label={t.model_label} value={modelId} onChange={setModelId} />
            
            <ProImageSizeSelector value={proImageSize} onChange={setProImageSize} visible={isProModel(modelId)} />
            <ResultPanel
              img={img}
              loading={loading}
              progress={progress}
              progressMessage={progressMessage}
              downloading={downloading}
              downloadError={downloadError}
              onPreviewOpen={handlePreviewOpen}
              onDownload={handleDownload}
              canContinueEdit={canContinueEdit}
              onContinueEdit={handleContinueEdit}
              isContinuingEdit={isContinuingEdit}
              uploadingReference={uploadingReference}
              referenceUploadError={referenceUploadError}
              referenceImageForDisplay={referenceImageForDisplay}
              onReferencePreviewOpen={handleReferencePreviewOpen}
              className="w-full h-full flex-1"
              errorMessage={!loading ? error : null}
              showRechargeCTA={insufficientCreditsError && !loading}
              aspectRatioHint={choices.aspect_ratio}
              onAnimate={onSwitchToFlow}
              canvasHeightClass="min-h-[450px] lg:h-full"
              standbyBackgroundImage={
                choices.gender === "male"
                  ? "/gateway_gender_him.png"
                  : choices.gender === "agender"
                    ? "/gateway_gender_x.png"
                    : "/gateway_gender_her.png"
              }
            />
          </div>

          <div className="hidden lg:flex gap-4 shrink-0 pb-4">
            {isDebugMode && promptText && (
              <button
                onClick={handlePromptPreviewOpen}
                className="px-6 py-3 bg-transparent border border-lux-line text-lux-muted hover:text-lux-text hover:border-lux-text text-xs uppercase tracking-widest transition-all duration-300 focus:outline-none"
              >
                {t.view_prompt}
              </button>
            )}
            <div className="pt-6 w-full flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={loading || uploadingReference}
                className="lux-glow-button group w-full md:w-2/3 lg:w-1/2 py-4 bg-lux-text text-lux-bg font-serif tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? t.dreaming : uploadingReference ? t.uploading : t.dreamify}</span>
                <span className="block w-1 h-1 bg-lux-bg rounded-full group-hover:w-2 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>


      {previewOpen && img && (
        <PreviewModal url={img} open={previewOpen} onClose={handlePreviewClose} />
      )
      }

      {
        referencePreviewOpen && referenceImageForDisplay && (
          <PreviewModal url={referenceImageForDisplay} open={referencePreviewOpen} onClose={handleReferencePreviewClose} />
        )
      }

      {
        promptPreviewOpen && promptText && (
          <PromptModal promptText={promptText} open={promptPreviewOpen} onClose={handlePromptPreviewClose} />
        )
      }
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-lux-bg/80 backdrop-blur-lg border-t border-lux-line z-40 lg:hidden">
        <button
          onClick={handleGenerate}
          disabled={loading || uploadingReference}
          className="lux-glow-button group w-full py-3.5 bg-lux-text text-lux-bg font-serif tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{loading ? t.dreaming : uploadingReference ? t.uploading : t.dreamify}</span>
          <span className="block w-1 h-1 bg-lux-bg rounded-full group-hover:w-2 transition-all" />
        </button>
      </div>
    </>
  );
}