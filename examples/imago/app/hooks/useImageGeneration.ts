import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createChoicesSchema, type Choices } from "@lib/schema";
import { extractErrorMessage, isAbortError, formatErrorMessage } from "@lib/utils/errorHandling";
import { deepCloneChoices } from "@lib/utils/clone";
import { downloadImage } from "@lib/utils/download";
import { isHttpsUrl } from "@lib/utils/urlValidation";
import { useLanguage } from "../providers/LanguageProvider";
import { useSupabase } from "../providers/SupabaseProvider";
import { emitHistoryUpdate } from "@lib/historyEvents";
import { emitUsageUpdate } from "@lib/usageEvents";
import { ensureVisitorId } from "@lib/visitorId";
import { resolveGenerationError } from "@lib/errorMessages";
import { fetchWithRetry, type FetchRetryOptions } from "@lib/utils/request";
import { captureClientError } from "@lib/utils/telemetry";

type ProgressCallbacks = {
  startProgress: () => void;
  completeProgress: () => void;
  failProgress: () => void;
};

type UseImageGenerationProps = {
  onSwitchToFreeform?: (imageUrl?: string) => void;
};

export function useImageGeneration({ onSwitchToFreeform }: UseImageGenerationProps = {}) {
  const { lang } = useLanguage();
  const { user } = useSupabase();
  const schema = useMemo(() => createChoicesSchema(lang), [lang]);
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [lastGeneratedConfig, setLastGeneratedConfig] = useState<Choices | null>(null);
  const [promptText, setPromptText] = useState<string | null>(null); // stores prompt text
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
  const [referenceImageForDisplay, setReferenceImageForDisplay] = useState<string | null>(null); // for display only
  const [uploadingReference, setUploadingReference] = useState(false);
  const [referenceUploadError, setReferenceUploadError] = useState<string | null>(null);
  const [isReferenceMode, setIsReferenceMode] = useState(false);
  const [insufficientCreditsError, setInsufficientCreditsError] = useState(false);
  const ctrlRef = useRef<AbortController | null>(null);
  const referenceImageUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const isGeneratingRef = useRef(false);
  const prevUserIdRef = useRef<string | null | undefined>(user?.id);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id;

    if (prevUserId && !currentUserId) {
      setImg(null);
      setReferenceImageUrl(null);
      setReferenceImageForDisplay(null);
      setPromptText(null);
      setLastGeneratedConfig(null);
      setError(null);
      setIsReferenceMode(false);
      referenceImageUrlRef.current = null;
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id]);

  useEffect(() => {
    referenceImageUrlRef.current = referenceImageUrl;
  }, [referenceImageUrl]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (ctrlRef.current) {
        ctrlRef.current.abort();
      }
    };
  }, []);

  const getErrorMessage = useCallback((error: unknown, defaultMessage: string): string => {
    return extractErrorMessage(error, defaultMessage);
  }, []);

  const createAbortController = useCallback(() => {
    ctrlRef.current?.abort();
    ctrlRef.current = new AbortController();
    return ctrlRef.current;
  }, []);

  const normalizeApiErrorMessage = useCallback((payload: string | null | undefined) => {
    if (!payload) return "";
    try {
      const parsed = JSON.parse(payload) as { error?: string };
      if (parsed && typeof parsed.error === "string") {
        return parsed.error;
      }
    } catch {
    }
    return payload;
  }, []);

  const fetchWithErrorHandling = useCallback(
    async (url: string, options: FetchRetryOptions = {}): Promise<Response> => {
      try {
        return await fetchWithRetry(url, options);
      } catch (error: unknown) {
        if (isAbortError(error)) {
          throw error;
        }
        const normalized = normalizeApiErrorMessage(
          getErrorMessage(error, "网络连接失败")
        );
        captureClientError({
          component: "useImageGeneration",
          endpoint: url,
          message: normalized || "network_failed"
        });
        throw new Error(normalized || "网络连接失败");
      }
    },
    [getErrorMessage, normalizeApiErrorMessage]
  );

  const parseJsonResponse = useCallback(async <T,>(res: Response): Promise<T> => {
    try {
      return await res.json();
    } catch {
      throw new Error("服务器返回了无效的 JSON 响应");
    }
  }, []);

  const requestGenerate = useCallback(
    async (body: Record<string, unknown>, signal?: AbortSignal) => {
      const visitorId = ensureVisitorId();
      const res = await fetchWithErrorHandling("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(visitorId ? { "X-Visitor-Id": visitorId } : {})
        },
        body: JSON.stringify(body),
        signal,
        timeoutMs: 180000,
        retries: 1
      });

      return parseJsonResponse<{ image_url?: string; prompt_text?: string }>(res);
    },
    [fetchWithErrorHandling, parseJsonResponse]
  );

  const resetGenerationState = useCallback(() => {
    setLoading(true);
    setError(null);
    setInsufficientCreditsError(false);
    setImg(null);
    setPromptText(null);
    setDownloadError(null);
    setPreviewOpen(false);
  }, []);

  const generateImage = useCallback(
    async (choices: Choices, referenceUrl: string | null, modelId?: string, imageSize?: string): Promise<string> => {
      const parsed = schema.parse(choices);
      const abortController = createAbortController();
      const payload: Record<string, unknown> = { ...parsed };

      if (referenceUrl) {
        payload.reference_image_url = referenceUrl;
      }
      if (modelId) {
        payload.model_id = modelId;
      }
      if (imageSize) {
        payload.image_size = imageSize;
      }

      const data = await requestGenerate(payload, abortController.signal);

      if (!data.image_url || typeof data.image_url !== "string") {
        throw new Error("服务器响应中缺少有效的图片 URL");
      }

      if (data.prompt_text && typeof data.prompt_text === "string") {
        setPromptText(data.prompt_text);
      }

      return data.image_url;
    },
    [requestGenerate, createAbortController, schema]
  );

  const handleGenerationSuccess = useCallback(
    (imageUrl: string, choices: Choices, referenceUrl: string | null) => {
      setImg(imageUrl);
      const snapshot = deepCloneChoices(choices);
      setLastGeneratedConfig(snapshot);

      if (referenceUrl) {
        setIsReferenceMode(false);
      }
      emitHistoryUpdate();
      emitUsageUpdate();
    },
    []
  );

  const handleGenerationError = useCallback(
    (error: unknown, failProgress: () => void) => {
      if (isAbortError(error)) {
        return; // request cancelled, skip error display
      }
      if (!isMountedRef.current) return;
      const formatted = formatErrorMessage(error, lang);
      const resolved =
        formatted === "guest_limit" || formatted === "login_required" || formatted === "insufficient_credits"
          ? resolveGenerationError(formatted, lang)
          : formatted;
      setInsufficientCreditsError(formatted === "insufficient_credits");
      setError(resolved);
      failProgress();
    },
    [lang]
  );

  const onGenerate = useCallback(
    async (
      choices: Choices,
      startProgress: () => void,
      completeProgress: () => void,
      failProgress: () => void,
      modelId?: string,
      imageSize?: string
    ) => {
      if (!isMountedRef.current || isGeneratingRef.current || uploadingReference) return;

      isGeneratingRef.current = true;

      resetGenerationState();
      const referenceForRequest = referenceImageUrlRef.current;
      setIsReferenceMode(Boolean(referenceForRequest));

      startProgress();

      try {
        const imageUrl = await generateImage(choices, referenceForRequest, modelId, imageSize);
        if (!isMountedRef.current) return;

        handleGenerationSuccess(imageUrl, choices, referenceForRequest);
        completeProgress();
      } catch (error: unknown) {
        handleGenerationError(error, failProgress);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        isGeneratingRef.current = false;
      }
    },
    [resetGenerationState, generateImage, handleGenerationSuccess, handleGenerationError, uploadingReference]
  );

  const handlePreviewOpen = useCallback(() => {
    if (img) setPreviewOpen(true);
  }, [img]);

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!img || !isMountedRef.current) return;

    setDownloadError(null);
    setDownloading(true);

    try {
      await downloadImage(img);
    } catch (error: unknown) {
      if (isMountedRef.current) {
        setDownloadError(`下载失败：${getErrorMessage(error, "未知错误")}`);
      }
    } finally {
      if (isMountedRef.current) {
        setDownloading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img]);

  const canContinueEditWithCurrentImage = useCallback((): boolean => {
    return Boolean(img && lastGeneratedConfig && !uploadingReference && isMountedRef.current);
  }, [img, lastGeneratedConfig, uploadingReference]);

  const setReferenceImageDirectly = useCallback((imageUrl: string) => {
    setReferenceImageUrl(imageUrl);
    setReferenceImageForDisplay(imageUrl);
  }, []);

  const formatUploadError = useCallback(
    (error: unknown) => formatErrorMessage(error, lang),
    [lang]
  );

  const uploadReferenceImage = useCallback(async (imageData: string): Promise<boolean> => {
    if (uploadingReference) return false;
    let success = false;
    try {
      setReferenceUploadError(null);
      setUploadingReference(true);

      const res = await fetchWithErrorHandling("/api/upload-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
        timeoutMs: 20000,
        retries: 1
      });

      const data = await parseJsonResponse<{ url?: string }>(res);

      if (!data?.url || typeof data.url !== "string") {
        throw new Error("未获取到参考图地址");
      }

      if (!isMountedRef.current) return false;
      setReferenceImageUrl(data.url);
      setReferenceImageForDisplay(imageData);
      success = true;
    } catch (error: unknown) {
      if (!isMountedRef.current) return false;
      const message = formatUploadError(error);
      setError(message);
      setReferenceUploadError(message);
    } finally {
      if (isMountedRef.current) {
        setUploadingReference(false);
      }
    }
    return success;
  }, [fetchWithErrorHandling, parseJsonResponse, formatUploadError, uploadingReference]);

  const handleContinueEdit = useCallback(async () => {
    if (!canContinueEditWithCurrentImage()) return;

    if (isHttpsUrl(img!)) {
      setReferenceImageDirectly(img!);
      if (onSwitchToFreeform) {
        onSwitchToFreeform(img!);
      }
      return;
    }

    const uploaded = await uploadReferenceImage(img!);
    if (uploaded && onSwitchToFreeform) {
      onSwitchToFreeform(img!);
    }
  }, [img, canContinueEditWithCurrentImage, setReferenceImageDirectly, uploadReferenceImage, onSwitchToFreeform]);

  const handleCancelContinueEdit = useCallback(() => {
    setReferenceImageUrl(null);
    setReferenceImageForDisplay(null);
  }, []);

  return {
    img,
    loading,
    error,
    insufficientCreditsError,
    previewOpen,
    downloading,
    downloadError,
    lastGeneratedConfig,
    promptText,
    referenceImageUrl,
    referenceImageForDisplay,
    uploadingReference,
    referenceUploadError,
    isReferenceMode,
    onGenerate,
    handlePreviewOpen,
    handlePreviewClose,
    handleDownload,
    handleContinueEdit,
    handleCancelContinueEdit
  };
}