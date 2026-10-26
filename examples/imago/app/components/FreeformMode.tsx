"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isHttpsUrl } from "@lib/utils/urlValidation";
import { SectionCard } from "./SectionCard";
import { UploadCard } from "./UploadCard";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { FreeResultPanel } from "./FreeResultPanel";
import { PreviewModal } from "./PreviewModal";
import { downloadImage } from "@lib/utils/download";
import { FREE_TEMPLATES, type FreeTemplate } from "../config/freeTemplates";
import { useGenerationProgress } from "../hooks/useGenerationProgress";
import { useLanguage } from "../providers/LanguageProvider";
import { useSupabase } from "../providers/SupabaseProvider";
import { UI_TEXT } from "@lib/i18n";
import { useModelPreference } from "../hooks/useModelPreference";
import { ModelSelector } from "./ModelSelector";
import { ProImageSizeSelector } from "./ProImageSizeSelector";
import { DEFAULT_MODEL_ID, isProModel, type ProImageSize } from "@lib/models";
import { emitHistoryUpdate } from "@lib/historyEvents";
import { resolveGenerationError } from "@lib/errorMessages";
import { formatErrorMessage } from "@lib/utils/errorHandling";
import { emitUsageUpdate } from "@lib/usageEvents";
import { ensureVisitorId } from "@lib/visitorId";
import { fetchWithRetry } from "@lib/utils/request";
import { captureClientError } from "@lib/utils/telemetry";

function parseApiErrorText(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed && typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {
  }
  return raw;
}

function resolveFreeformError(message: string, lang: "zh" | "en") {
  const t = UI_TEXT[lang];
  const normalized = message.trim();
  const lower = normalized.toLowerCase();

  if (normalized === "Bad Request") return t.freeform_error_bad_request;
  if (lower.includes("invalid json")) return t.freeform_error_invalid_json;
  if (normalized === "Invalid image data") return t.freeform_error_invalid_image_data;
  if (normalized === "Invalid HTTPS URL format") return t.freeform_error_invalid_https_url;
  if (normalized === "Invalid data URL format") return t.freeform_error_invalid_data_url;
  if (normalized.startsWith("Unsupported image format")) return t.freeform_error_unsupported_image_format;
  if (normalized.startsWith("R2 storage not configured")) return t.freeform_error_r2_not_configured;
  if (lower.includes("invalid url")) return t.freeform_error_invalid_image_url;

  return null;
}

function getLocalizedTemplate(template: FreeTemplate, lang: "zh" | "en") {
  return {
    ...template,
    name: lang === "zh" ? template.name : template.name_en || template.name,
    hint: lang === "zh" ? template.hint : template.hint_en || template.hint
  };
}

const TemplateCard = memo(function TemplateCard({
  tpl,
  isActive,
  localizedTemplate,
  onSelect
}: {
  tpl: FreeTemplate;
  isActive: boolean;
  localizedTemplate: ReturnType<typeof getLocalizedTemplate>;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`template-card group relative w-48 flex-shrink-0 text-left transition duration-300 ${isActive ? "brightness-110" : "brightness-95 hover:brightness-110"
        }`}
    >
      <div
        className={`px-3 pt-3 pb-4 flex flex-col gap-3 h-full bg-transparent border border-transparent ${isActive ? "bg-lux-surface-2/40 border-lux-accent/60" : "bg-transparent border-white/5"
          }`}
      >
        <div className="aspect-square w-full overflow-hidden bg-black/30 border border-white/5">
          <img
            src={tpl.image}
            alt={localizedTemplate.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <p className="text-sm font-semibold text-lux-text uppercase tracking-[0.08em] line-clamp-2">
          {localizedTemplate.name}
        </p>
        {localizedTemplate.hint && (
          <p className="text-[11px] text-lux-muted/80 leading-relaxed line-clamp-3">
            {localizedTemplate.hint}
          </p>
        )}
      </div>
      {!isActive && (
        <div className="pointer-events-none absolute inset-0 border border-white/10 opacity-40 group-hover:opacity-70 transition" />
      )}
    </button>
  );
});

type FreeformModeProps = {
  initialImage?: string | null;
  onConsumeInitialImage?: () => void;
  onSwitchToFlow?: (imageUrl: string) => void;
};

export function FreeformMode({ initialImage, onConsumeInitialImage, onSwitchToFlow }: FreeformModeProps) {
  const { lang } = useLanguage();
  const { user } = useSupabase();
  const t = UI_TEXT[lang];
  const { modelId, setModelId } = useModelPreference();
  const lastNonZImageRef = useRef<string>(modelId === "z-image" ? DEFAULT_MODEL_ID : modelId);

  const [freeImages, setFreeImages] = useState<string[]>([]);
  const [freeResultImage, setFreeResultImage] = useState<string | null>(null);
  const [freePrompt, setFreePrompt] = useState<string>("");
  const [freeAspectRatio, setFreeAspectRatio] = useState<string>("auto");
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeError, setFreeError] = useState<string | null>(null);
  const [freeInsufficientCredits, setFreeInsufficientCredits] = useState(false);
  const [freePreviewOpen, setFreePreviewOpen] = useState(false);
  const [freePromptDirty, setFreePromptDirty] = useState(false);
  const [freeDownloading, setFreeDownloading] = useState(false);
  const [freeDownloadError, setFreeDownloadError] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [proImageSize, setProImageSize] = useState<ProImageSize>("1K");
  const prevUserIdRef = useRef<string | null | undefined>(user?.id);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id;

    if (prevUserId && !currentUserId) {
      setFreeImages([]);
      setFreeResultImage(null);
      setFreePrompt("");
      setFreeError(null);
      setFreeInsufficientCredits(false);
      setSelectedTemplateId(null);
      setFreePromptDirty(false);
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id]);

  const {
    progress: freeProgress,
    progressMessage: freeProgressMessage,
    startProgress: startFreeProgress,
    completeProgress: completeFreeProgress,
    failProgress: failFreeProgress
  } = useGenerationProgress("freeform");

  const freeTemplates = useMemo(() => FREE_TEMPLATES, []);
  const effectiveImages = useMemo(() => (modelId === "z-image" ? [] : freeImages), [modelId, freeImages]);

  useEffect(() => {
    if (modelId !== "z-image") {
      lastNonZImageRef.current = modelId;
    }
  }, [modelId]);

  useEffect(() => {
    if (initialImage) {
      setFreeImages([initialImage]);
      setFreeResultImage(null);
      setFreeDownloadError(null);
      setSelectedTemplateId(null); // Clear template selection to allow freeform

      if (modelId === "z-image") {
        const fallback =
          lastNonZImageRef.current === "z-image" ? DEFAULT_MODEL_ID : lastNonZImageRef.current;
        if (fallback !== modelId) {
          setModelId(fallback);
        }
      }

      if (onConsumeInitialImage) {
        onConsumeInitialImage();
      }
    }
  }, [initialImage, modelId, onConsumeInitialImage, setModelId]);

  const handleTemplateSelect = useCallback((id: string, promptText: string) => {
    setSelectedTemplateId(id);
    setFreeResultImage(null);
    setFreeDownloadError(null);
    setFreePrompt(promptText);
    setFreePromptDirty(false);
  }, []);

  const handleFreeDownload = useCallback(async () => {
    if (!freeResultImage || freeDownloading) return;
    try {
      setFreeDownloading(true);
      setFreeDownloadError(null);
      await downloadImage(freeResultImage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.download_failed;
      setFreeDownloadError(message);
    } finally {
      setFreeDownloading(false);
    }
  }, [freeResultImage, freeDownloading, t]);

  useEffect(() => {
    if (!selectedTemplateId || freePromptDirty) return;
    const tpl = freeTemplates.find((tpl) => tpl.id === selectedTemplateId);
    if (!tpl?.prompts) return;
    const nextPrompt =
      effectiveImages.length >= 2
        ? tpl.prompts.two
        : effectiveImages.length === 1
          ? tpl.prompts.one
          : tpl.prompts.none;
    if (nextPrompt) {
      setFreePrompt(nextPrompt);
    }
  }, [selectedTemplateId, effectiveImages.length, freeTemplates, freePromptDirty]);

  const selectedTemplate = useMemo(
    () =>
      selectedTemplateId ? freeTemplates.find((tpl) => tpl.id === selectedTemplateId) || null : null,
    [selectedTemplateId, freeTemplates]
  );
  const localizedSelectedTemplate = selectedTemplate
    ? getLocalizedTemplate(selectedTemplate, lang)
    : null;
  const maxImages = useMemo(() => selectedTemplate?.limitImages ?? 2, [selectedTemplate]);
  const requiredImages = useMemo(() => selectedTemplate?.requiredImages, [selectedTemplate]);
  const freePlaceholderContent = useMemo(() => {
    return (
      <div className="opacity-30 group-hover:opacity-50 transition-opacity select-none pointer-events-none space-y-2">
        <p className="font-serif italic text-2xl text-white">&ldquo;{t.whispers}&rdquo;</p>
        <div className="w-8 h-[1px] bg-white mx-auto"></div>
      </div>
    );
  }, [t.whispers]);

  const handleContinueEdit = useCallback(() => {
    if (!freeResultImage) return;
    setFreeImages([freeResultImage]);
    setFreeResultImage(null);
    setFreeError(null);
    setFreeInsufficientCredits(false);
    setFreeDownloadError(null);
    setSelectedTemplateId(null);

    if (modelId === "z-image") {
      const fallback =
        lastNonZImageRef.current === "z-image" ? DEFAULT_MODEL_ID : lastNonZImageRef.current;
      if (fallback !== modelId) {
        setModelId(fallback);
      }
    }
  }, [freeResultImage, modelId, setModelId, setFreeImages, setFreeDownloadError, setSelectedTemplateId]);

  const handleFreeGenerate = useCallback(async () => {
    const trimmedPrompt = freePrompt.trim();
    const imagesForRequest = effectiveImages;
    if (!trimmedPrompt) {
      setFreeError(t.enter_description_first);
      setFreeInsufficientCredits(false);
      return;
    }
    if (requiredImages !== undefined && imagesForRequest.length !== requiredImages) {
      setFreeError(t.ref_count_mismatch);
      setFreeInsufficientCredits(false);
      return;
    }
    setFreeError(null);
    setFreeInsufficientCredits(false);
    setFreeDownloadError(null);
    setFreeLoading(true);
    startFreeProgress();
    try {
      const uploadedUrls: string[] = [];
      for (const img of imagesForRequest) {
        if (isHttpsUrl(img)) {
          uploadedUrls.push(img);
          continue;
        }

        const res = await fetchWithRetry("/api/upload-reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: img }),
          timeoutMs: 20000,
          retries: 1
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!data.url) throw new Error(data.error || t.no_upload_url);
        uploadedUrls.push(data.url);
      }

      const visitorId = ensureVisitorId();
      const genRes = await fetchWithRetry("/api/free-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(visitorId ? { "X-Visitor-Id": visitorId } : {})
        },
        body: JSON.stringify({
          images: uploadedUrls,
          aspect_ratio: freeAspectRatio,
          prompt: trimmedPrompt,
          template_id: selectedTemplateId ?? undefined,
          model_id: modelId,
          image_size: isProModel(modelId) ? proImageSize : undefined
        }),
        timeoutMs: 180000,
        retries: 1
      });
      const genData = (await genRes.json()) as { image_url?: string; error?: string };
      if (!genData.image_url) throw new Error(genData.error || t.no_gen_url);
      completeFreeProgress();
      setFreeResultImage(genData.image_url);
      emitHistoryUpdate();
      emitUsageUpdate();
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : t.gen_failed;
      const normalizedMessage = parseApiErrorText(rawMessage) ?? rawMessage;
      const mapped = resolveFreeformError(normalizedMessage, lang);
      const formatted = formatErrorMessage(
        err instanceof Error ? err : new Error(normalizedMessage),
        lang
      );
      captureClientError({
        component: "FreeformMode",
        endpoint: imagesForRequest.length ? "/api/upload-reference" : "/api/free-generate",
        message: rawMessage
      });
      const resolved =
        normalizedMessage === "guest_limit" ||
          normalizedMessage === "login_required" ||
          normalizedMessage === "insufficient_credits"
          ? resolveGenerationError(normalizedMessage, lang)
          : mapped ?? formatted;
      setFreeError(resolved);
      setFreeInsufficientCredits(normalizedMessage === "insufficient_credits");
      failFreeProgress();
    } finally {
      setFreeLoading(false);
    }
  }, [
    effectiveImages,
    freePrompt,
    freeAspectRatio,
    requiredImages,
    selectedTemplateId,
    startFreeProgress,
    completeFreeProgress,
    failFreeProgress,
    t,
    lang,
    modelId,
    proImageSize
  ]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[46%_54%]">
        <SectionCard title={t.upload_image_optional} className="space-y-4">
          {modelId === "z-image" ? (
            <div className="rounded-lux border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {lang === "zh"
                ? "Z-IMAGE 模型不支持参考图上传，请直接输入描述文字"
                : "Z-IMAGE does not support reference images. Please enter a text description."}
            </div>
          ) : (
            <UploadCard
              onImagesSelected={(dataUrls) => {
                setFreeImages(dataUrls);
                setFreeResultImage(null);
                setFreeDownloadError(null);
              }}
              currentImages={freeImages}
              disabled={freeImages.length >= maxImages}
              maxImages={maxImages}
            />
          )}
          <AspectRatioSelector
            value={freeAspectRatio}
            onChange={(val) => setFreeAspectRatio(val)}
            options={["auto", "16:9", "9:16", "4:3", "3:4", "1:1"]}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-lux-text">
              {selectedTemplateId ? localizedSelectedTemplate?.name : t.describe_image}
            </label>
            <textarea
              value={freePrompt}
              onChange={(e) => {
                setFreePrompt(e.target.value);
                setFreePromptDirty(true);
              }}
              className="w-full rounded-lux border border-lux-line bg-lux-surface p-3 text-sm text-lux-text min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-lux-accent/70"
              placeholder={localizedSelectedTemplate?.hint || t.describe_image}
            />
          </div>

          <div className="w-full flex justify-center pt-8">
            <button
              onClick={handleFreeGenerate}
              className="lux-glow-button group w-full md:w-2/3 lg:w-1/2 py-4 bg-white text-black font-serif tracking-widest text-sm hover:bg-[#ddd] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline-none flex items-center justify-center gap-3"
              disabled={
                freeLoading ||
                !freePrompt.trim() ||
                (requiredImages !== undefined && effectiveImages.length !== requiredImages)
              }
            >
              <span className="text-sm">{freeLoading ? t.dreaming : t.dreamify}</span>
              <span className="block w-1 h-1 bg-black rounded-full transition-all group-hover:w-2" />
            </button>
          </div>
        </SectionCard>

        <div className="flex flex-col gap-3 lux-grid-bg rounded-lux p-3">
          <ModelSelector
            label={t.model_label}
            value={modelId}
            onChange={(id) => {
              setModelId(id);
            }}
          />
          
          <ProImageSizeSelector value={proImageSize} onChange={setProImageSize} visible={isProModel(modelId)} />
          <FreeResultPanel
            img={freeResultImage}
            loading={freeLoading}
            progress={freeProgress}
            progressMessage={freeProgressMessage}
            onPreviewOpen={() => {
              if (freeResultImage) setFreePreviewOpen(true);
            }}
            onDownload={handleFreeDownload}
            canContinueEdit={Boolean(freeResultImage) && !freeLoading}
            onContinueEdit={handleContinueEdit}
            downloading={freeDownloading}
            downloadError={freeDownloadError}
            className=""
            canvasHeightClass="h-[55vh] lg:h-[65vh] xl:h-[75vh]"
            placeholderContent={freePlaceholderContent}
            placeholderBackgroundImage="/gateway_freeform_flux.png"
            errorMessage={!freeLoading ? freeError : null}
            showRechargeCTA={freeInsufficientCredits && !freeLoading}
            aspectRatioHint={freeAspectRatio !== "auto" ? freeAspectRatio : null}
            onAnimate={onSwitchToFlow}
          />
        </div>
      </div>

      <section id="freeform-templates">
        <SectionCard
          title={t.templates}
          className="space-y-3 mt-4"
          titleSlot={
            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase text-lux-muted/70">
              {t.swipe}
              <svg className="w-3 h-3 text-lux-text/60 animate-pulse" fill="none" stroke="currentColor" strokeWidth="0.8" viewBox="0 0 24 24">
                <path d="M8 5l8 7-8 7" />
              </svg>
            </span>
          }
        >
          <div className="relative overflow-x-auto">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-lux-bg via-lux-bg/60 to-transparent hidden sm:block" />
            <div className="flex gap-4 min-w-full">
              {freeTemplates.length === 0 && (
                <div className="flex gap-4 w-full">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`tpl-skeleton-${index}`} className="w-48 flex-shrink-0 space-y-3">
                      <div className="aspect-square rounded-2xl bg-white/5 animate-pulse" />
                      <div className="h-3 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 bg-white/5 rounded w-3/4 animate-pulse" />
                    </div>
                  ))}
                </div>
              )}
              {freeTemplates.map((tpl) => {
                const isActive = tpl.id === selectedTemplateId;
                const localizedTemplate = getLocalizedTemplate(tpl, lang);
                return (
                  <TemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    isActive={isActive}
                    localizedTemplate={localizedTemplate}
                    onSelect={() =>
                      handleTemplateSelect(
                        tpl.id,
                        effectiveImages.length >= 2
                          ? tpl.prompts.two
                          : effectiveImages.length === 1
                            ? tpl.prompts.one
                            : tpl.prompts.none
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        </SectionCard>
      </section>

      {freePreviewOpen && freeResultImage && (
        <PreviewModal url={freeResultImage} open={freePreviewOpen} onClose={() => setFreePreviewOpen(false)} />
      )}
    </>
  );
}