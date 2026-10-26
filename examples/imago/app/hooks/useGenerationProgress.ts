"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PROGRESS_UPDATE_INTERVAL_MS,
  PROGRESS_MESSAGE_UPDATE_INTERVAL_MS,
  PROGRESS_RESET_DELAY_MS,
  GENERATE_MODE_DURATION_MS,
  REFERENCE_MODE_DURATION_MS,
  TARGET_PROGRESS_BEFORE_COMPLETE,
  INITIAL_PROGRESS_GENERATE,
  INITIAL_PROGRESS_REFERENCE
} from "@lib/constants";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Mode = "generate" | "reference" | "freeform";

export function useGenerationProgress(mode: Mode = "generate", gender: "male" | "female" | "agender" = "female") {
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const messageTimerRef = useRef<number | null>(null);
  const resetRef = useRef<number | null>(null);
  const messageIndexRef = useRef(0);
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];
  const fallbackMessages = useMemo(
    () => {
      if (mode === "reference") return t.progress_reference_messages ?? [];
      if (mode === "freeform") return t.progress_messages_freeform ?? [];
      if (gender === "male") return t.progress_messages_male ?? [];
      return t.progress_messages_female ?? [];
    },
    [mode, gender, t]
  );

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (messageTimerRef.current) {
      window.clearInterval(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    if (resetRef.current) {
      window.clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    if (resetRef.current) window.clearTimeout(resetRef.current);
    resetRef.current = window.setTimeout(() => {
      setProgress(0);
      setProgressMessage(null);
      resetRef.current = null;
    }, PROGRESS_RESET_DELAY_MS);
  }, []);

  const startProgress = useCallback(() => {
    clearTimers();
    setProgress(mode === "reference" ? INITIAL_PROGRESS_REFERENCE : INITIAL_PROGRESS_GENERATE);
    setProgressMessage(fallbackMessages[0] ?? null);
    messageIndexRef.current = 1;

    const targetDuration = mode === "reference" ? REFERENCE_MODE_DURATION_MS : GENERATE_MODE_DURATION_MS;
    const totalUpdates = Math.floor(targetDuration / PROGRESS_UPDATE_INTERVAL_MS);
    const progressPerUpdate = TARGET_PROGRESS_BEFORE_COMPLETE / totalUpdates;

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= TARGET_PROGRESS_BEFORE_COMPLETE) return prev;
        const increment = progressPerUpdate * (0.8 + Math.random() * 0.4);
        return Math.min(prev + increment, TARGET_PROGRESS_BEFORE_COMPLETE);
      });
    }, PROGRESS_UPDATE_INTERVAL_MS);

    messageTimerRef.current = window.setInterval(() => {
      setProgressMessage(() => {
        const idx = messageIndexRef.current;
        const message = fallbackMessages[idx % fallbackMessages.length] ?? null;
        messageIndexRef.current = idx + 1;
        return message;
      });
    }, PROGRESS_MESSAGE_UPDATE_INTERVAL_MS);
  }, [clearTimers, fallbackMessages, mode]);

  const completeProgress = useCallback(() => {
    clearTimers();
    setProgress(100);
    setProgressMessage(t.progress_complete);
    scheduleReset();
  }, [clearTimers, scheduleReset, t.progress_complete]);

  const failProgress = useCallback(() => {
    clearTimers();
    setProgress(0);
    setProgressMessage(null);
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return {
    progress,
    progressMessage,
    startProgress,
    completeProgress,
    failProgress
  };
}