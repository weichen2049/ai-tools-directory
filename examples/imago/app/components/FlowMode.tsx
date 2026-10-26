"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { useSupabase } from "../providers/SupabaseProvider";
import { UI_TEXT, ENGLISH_ONLY_TEXT } from "@lib/i18n";
import { SectionCard } from "./SectionCard";
import { ButtonSelect } from "./ButtonSelect";
import { UploadCard } from "./UploadCard";
import { VideoPlayer } from "./VideoPlayer";
import { VideoModelInfo } from "./VideoModelInfo";
import { VIDEO_CREDIT_COSTS } from "@lib/credits";

type FlowGenerationType = "text" | "image";
type GenerationState = "idle" | "uploading" | "creating" | "polling" | "success" | "error";

const DURATION_OPTIONS = [
  { label: "5s", value: "5" },
  { label: "10s", value: "10" },
  { label: "15s", value: "15" }
];

const RESOLUTION_OPTIONS = [
  { label: "720p", value: "720p" },
  { label: "1080p", value: "1080p" }
];

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 200; // ~10 minutes with 3s interval

type FlowModeProps = {
  initialImage?: string | null;
  onConsumeInitialImage?: () => void;
};

export function FlowMode({ initialImage, onConsumeInitialImage }: FlowModeProps) {
  const { lang } = useLanguage();
  const { user } = useSupabase();
  const t = UI_TEXT[lang];

  const [generationType, setGenerationType] = useState<FlowGenerationType>("text");
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  useEffect(() => {
    if (initialImage) {
      setGenerationType("image");
      setReferenceImages([initialImage]);
      onConsumeInitialImage?.();
    }
  }, [initialImage, onConsumeInitialImage]);
  const [duration, setDuration] = useState("5");
  const [resolution, setResolution] = useState("1080p");
  const [multiShots, setMultiShots] = useState(false);

  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [waitingHint, setWaitingHint] = useState("");
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollWarning, setPollWarning] = useState<string | null>(null);

  const pollingRef = useRef<number | null>(null);
  const pollCountRef = useRef(0);
  const pollErrorCountRef = useRef(0);
  const activeTaskIdRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null | undefined>(user?.id);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id;

    if (prevUserId && !currentUserId) {
      setReferenceImages([]);
      setResultVideoUrl(null);
      setPrompt("");
      setErrorMessage(null);
      setGenerationState("idle");
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      activeTaskIdRef.current = null;
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id]);

  const requiresReference = generationType === "image";
  const hasReference = referenceImages.length > 0;
  const trimmedPrompt = prompt.trim();
  const promptLength = trimmedPrompt.length;
  const minPromptLength = generationType === "image" ? 2 : 1;
  const maxPromptLength = 5000;
  const promptTooShort = promptLength > 0 && promptLength < minPromptLength;
  const promptTooLong = promptLength > maxPromptLength;
  const promptError = promptTooShort
    ? (generationType === "image"
      ? t.flow_prompt_min_length_image.replace("{0}", minPromptLength.toString())
      : t.flow_prompt_min_length_text.replace("{0}", minPromptLength.toString()))
    : promptTooLong
      ? t.flow_prompt_max_length.replace("{0}", maxPromptLength.toString())
      : null;
  const canGenerate =
    promptLength >= minPromptLength &&
    promptLength <= maxPromptLength &&
    (!requiresReference || hasReference);
  const isProcessing = generationState !== "idle" && generationState !== "success" && generationState !== "error";
  const actionHint =
    !isProcessing && !canGenerate
      ? (promptError ?? (requiresReference && !hasReference ? t.flow_reference_required : null))
      : null;

  const estimatedCredits = VIDEO_CREDIT_COSTS[resolution]?.[duration] ?? 450;

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, []);

  const resetState = useCallback(() => {
    setGenerationState("idle");
    setStatusMessage("");
    setWaitingHint("");
    setErrorMessage(null);
    setPollWarning(null);
    pollCountRef.current = 0;
    pollErrorCountRef.current = 0;
    activeTaskIdRef.current = null;
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleError = useCallback((message: string) => {
    setGenerationState("error");
    setErrorMessage(message);
    setStatusMessage("");
    setWaitingHint("");
    setPollWarning(null);
    activeTaskIdRef.current = null;
    pollErrorCountRef.current = 0;
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (taskId: string) => {
    if (activeTaskIdRef.current !== taskId) {
      return;
    }
    pollCountRef.current += 1;

    if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
      handleError(lang === "zh" ? "生成超时，请稍后重试" : "Generation timed out, please try again");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const res = await fetch(`/api/generate-video/status?taskId=${encodeURIComponent(taskId)}`, { signal });
      if (!res.ok) {
        if (res.status === 401) {
          handleError(t.flow_error_login_required);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (activeTaskIdRef.current !== taskId) {
        return;
      }
      pollErrorCountRef.current = 0;
      setPollWarning(null);

      if (data.state === "success" && data.videoUrl) {
        setResultVideoUrl(data.videoUrl);
        setGenerationState("success");
        setStatusMessage("");
        setWaitingHint("");
        activeTaskIdRef.current = null;
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        return;
      }

      if (data.state === "fail") {
        handleError(data.error || (lang === "zh" ? "生成失败" : "Generation failed"));
        return;
      }

      const pollCount = pollCountRef.current;
      let hint = "";

      if (pollCount > 60) {
        hint = lang === "zh" ? `（${t.flow_long_wait_hint}）` : ` (${t.flow_long_wait_hint})`;
      } else if (pollCount > 6) {
        hint = lang === "zh" ? "（服务器繁忙，请耐心等待）" : " (Server busy, please wait)";
      } else if (pollCount > 2) {
        hint = lang === "zh" ? "（视频生成通常需要 1-3 分钟）" : " (Usually takes 1-3 min)";
      }
      setWaitingHint(hint);

      const stateMessages: Record<string, { zh: string; en: string }> = {
        waiting: { zh: "排队中...", en: "Waiting in queue..." },
        queuing: { zh: "排队中...", en: "Waiting in queue..." },
        generating: { zh: "生成中...即将完成", en: "Generating...almost done" }
      };
      const msg = stateMessages[data.state] || stateMessages.waiting;
      setStatusMessage(msg[lang]);

    } catch (err) {
      console.error("Polling error:", err);
      pollErrorCountRef.current += 1;
      if (pollErrorCountRef.current >= 3) {
        setPollWarning(t.flow_polling_unstable);
      }
    }
  }, [handleError, lang, t.flow_error_login_required, t.flow_polling_unstable]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isProcessing) return;

    resetState();
    setResultVideoUrl(null);

    let imageUrl: string | undefined;

    if (generationType === "image" && referenceImages.length > 0) {
      setGenerationState("uploading");
      setStatusMessage(lang === "zh" ? "上传图片中..." : "Uploading image...");

      try {
        const uploadRes = await fetch("/api/upload-reference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: referenceImages[0] })
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || `Upload failed: ${uploadRes.status}`);
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      } catch (err) {
        handleError(err instanceof Error ? err.message : (lang === "zh" ? "图片上传失败" : "Image upload failed"));
        return;
      }
    }

    setGenerationState("creating");
    setStatusMessage(lang === "zh" ? "创建任务中..." : "Creating task...");

    try {
      const createRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          image_url: imageUrl,
          duration,
          resolution,
          multi_shots: multiShots
        })
      });

      if (!createRes.ok) {
        if (createRes.status === 401) {
          handleError(t.flow_error_login_required);
          return;
        }
        if (createRes.status === 402) {
          const errData = await createRes.json().catch(() => ({}));
          const required = errData.required ?? 0;
          const available = errData.available ?? 0;
          handleError(t.flow_error_insufficient_credits.replace("{0}", String(required)).replace("{1}", String(available)));
          return;
        }
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || `Create task failed: ${createRes.status}`);
      }

      const createData = await createRes.json();
      const taskId = createData.taskId;

      if (!taskId) {
        throw new Error("No taskId returned");
      }

      setGenerationState("polling");
      setStatusMessage(lang === "zh" ? "排队中..." : "Waiting in queue...");
      activeTaskIdRef.current = taskId;
      pollCountRef.current = 0;
      pollErrorCountRef.current = 0;
      setPollWarning(null);

      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
      pollingRef.current = window.setInterval(() => {
        pollStatus(taskId);
      }, POLL_INTERVAL_MS);
      await pollStatus(taskId);

    } catch (err) {
      handleError(err instanceof Error ? err.message : (lang === "zh" ? "创建任务失败" : "Failed to create task"));
    }
  }, [canGenerate, isProcessing, resetState, generationType, referenceImages, lang, handleError, prompt, duration, resolution, multiShots, pollStatus, t.flow_error_login_required]);

  const [showUploader, setShowUploader] = useState(true);

  useEffect(() => {
    if (generationType === "image") {
      setShowUploader(referenceImages.length === 0);
    } else {
      setShowUploader(false);
    }
  }, [generationType, referenceImages.length]);

  return (
    <div className="flex flex-col lg:grid gap-8 lg:grid-cols-[400px_1fr] lg:h-[calc(100vh-8rem)] lg:min-h-[640px] items-stretch mb-16 lg:mb-0 lg:overflow-hidden">
      <div className="flex flex-col gap-10 lg:h-full lg:overflow-y-auto custom-scrollbar pr-0 lg:pr-2">
        <SectionCard title={t.flow_input_title} className="space-y-5">
          <ButtonSelect
            label={t.flow_type_label}
            items={[
              { label: t.flow_type_text, value: "text" },
              { label: t.flow_type_image, value: "image" }
            ]}
            value={generationType}
            onChange={(value) => setGenerationType(value as FlowGenerationType)}
            columns={2}
          />

          {generationType === "image" && (
            <div className="space-y-2">
              <div className="text-xs text-lux-muted tracking-[0.12em] uppercase">
                {t.flow_reference_label}
              </div>
              {showUploader ? (
                <UploadCard
                  onImagesSelected={(dataUrls) => {
                    setReferenceImages(dataUrls);
                    if (dataUrls.length > 0) {
                      setShowUploader(false);
                    }
                  }}
                  currentImages={referenceImages}
                  maxImages={1}
                />
              ) : (
                <div className="group relative w-full h-48 overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0f]">
                  
                  {referenceImages[0] && (
                    <div
                      className="absolute inset-0 opacity-30 blur-2xl saturate-150"
                      style={{ backgroundImage: `url(${referenceImages[0]})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    />
                  )}

                  
                  <div className="relative h-full w-full p-4">
                    {referenceImages[0] ? (
                      <img
                        src={referenceImages[0]}
                        alt={t.flow_reference_label}
                        className="h-full w-full object-contain drop-shadow-2xl"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lux-muted">
                        {t.no_image}
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 transition-all duration-300 backdrop-blur-[2px] group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setShowUploader(true)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
                      title={t.flow_replace_image}
                    >
                      
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReferenceImages([]);
                        setShowUploader(true);
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-red-500/20 hover:text-red-400 hover:scale-110"
                      title={t.flow_remove_image}
                    >
                      
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {!hasReference && (
                <p className="text-xs text-lux-muted/80">{t.flow_reference_required}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-lux-text">{t.flow_prompt_label}</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-lux border border-lux-line bg-lux-surface p-3 text-sm text-lux-text min-h-[140px] resize-none focus:outline-none focus:ring-2 focus:ring-lux-accent/70"
              maxLength={maxPromptLength}
              placeholder={t.flow_prompt_placeholder}
            />
            {promptError && (
              <p className="text-xs text-amber-300/90">{promptError}</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title={t.flow_settings_title} className="space-y-5">
          <div className="space-y-4">
            <ButtonSelect
              label={t.flow_duration_label}
              items={DURATION_OPTIONS}
              value={duration}
              onChange={setDuration}
              columns={3}
            />
            <ButtonSelect
              label={t.flow_resolution_label}
              items={RESOLUTION_OPTIONS}
              value={resolution}
              onChange={setResolution}
              columns={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-lux-text">{t.flow_multi_shots_label}</p>
                <p className="text-xs text-lux-muted/80">{t.flow_multi_shots_hint}</p>
              </div>
              <button
                type="button"
                onClick={() => setMultiShots((prev) => !prev)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${multiShots ? "bg-lux-text" : "bg-white/20"}`}
                aria-pressed={multiShots}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${multiShots ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
          </div>
        </SectionCard>

        
        {!isProcessing && canGenerate && (
          <div className="text-center text-xs text-lux-muted">
            {t.flow_estimated_credits?.replace("{0}", estimatedCredits.toString()) ?? `预估消耗 ${estimatedCredits} 积分`}
          </div>
        )}

        <div className="w-full flex justify-center">
          <button
            onClick={handleGenerate}
            className="lux-glow-button group w-full md:w-2/3 lg:w-1/2 py-4 bg-white text-black font-serif tracking-widest text-sm hover:bg-[#ddd] transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:outline-none flex items-center justify-center gap-3"
            disabled={!canGenerate || isProcessing}
          >
            <span className="text-sm">{isProcessing ? statusMessage || t.flow_generate_loading : t.flow_generate_action}</span>
            <span className="block w-1 h-1 bg-black rounded-full transition-all group-hover:w-2" />
          </button>
        </div>

        
        <div className="space-y-2 text-center">
          {isProcessing && null}

          {errorMessage && (
            <p className="text-xs text-red-400">
              {errorMessage}
            </p>
          )}

          {actionHint && (
            <p className="text-xs text-amber-300/90">
              {actionHint}
            </p>
          )}
        </div>


      </div>

      <div className="flex flex-col gap-4 min-h-0">
        <VideoModelInfo />
        <div className="lux-grid-bg rounded-lux p-3 flex-1 min-h-0">
          <div className="relative overflow-hidden rounded-lux border border-lux-line bg-black min-h-[55vh] lg:h-full group flex items-center justify-center">
            
            {!resultVideoUrl && !isProcessing && (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-60 group-hover:opacity-80 scale-105 group-hover:scale-110 group-hover:saturate-150"
                  style={{ backgroundImage: "url('/flow_preview_placeholder.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700 opacity-80 group-hover:opacity-50" />

                
                {errorMessage ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 text-center">
                    <div className="max-w-md w-full px-6 py-4 border border-[#E83F5B]/30 bg-[#130203]/70 text-[#F6D8DC] tracking-wide text-xs uppercase leading-relaxed shadow-[0px_10px_40px_rgba(0,0,0,0.45)]">
                      <div className="font-serif text-sm text-[#F9B3C1] mb-2 tracking-[0.4em]">
                        {ENGLISH_ONLY_TEXT.alert_label}
                      </div>
                      <div className="text-[11px] font-light normal-case text-[#FCE4E8]">
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
                    <div className="opacity-30 select-none pointer-events-none">
                      <p className="font-serif italic text-2xl text-white tracking-wider">&ldquo;{ENGLISH_ONLY_TEXT.flow_standby_quote}&rdquo;</p>
                      <div className="w-8 h-[1px] bg-white mx-auto mt-2"></div>
                    </div>
                  </div>
                )}
              </>
            )}

            
            {resultVideoUrl && (
              <VideoPlayer src={resultVideoUrl} autoPlay loop />
            )}

            
            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20 text-center px-6">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <div className="flex flex-col items-center gap-3">
                  <span className="text-xs tracking-[0.3em] uppercase text-white leading-relaxed">
                    {statusMessage || t.flow_generate_loading}
                    {waitingHint && <span className="normal-case tracking-normal opacity-70 ml-2 block sm:inline mt-1 sm:mt-0">{waitingHint}</span>}
                  </span>
                  <p className="text-[10px] text-white/50 font-light tracking-wide">
                    {t.flow_status_history_hint}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}