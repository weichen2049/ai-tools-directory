"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_MODEL_ID, MODEL_OPTIONS } from "@lib/models";
import { STORAGE_KEYS } from "@lib/publicEnv";

const STORAGE_KEY = STORAGE_KEYS.model;

export function useModelPreference() {
  const [modelId, setModelId] = useState<string>(DEFAULT_MODEL_ID);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && MODEL_OPTIONS.some((option) => option.id === saved)) {
        setModelId(saved);
      }
    } catch {
    }
  }, []);

  const handleModelChange = useCallback((nextId: string) => {
    const valid = MODEL_OPTIONS.find((option) => option.id === nextId);
    const resolved = valid ? valid.id : DEFAULT_MODEL_ID;
    setModelId(resolved);
    try {
      localStorage.setItem(STORAGE_KEY, resolved);
    } catch {
    }
  }, []);

  const selectItems = useMemo(
    () =>
      MODEL_OPTIONS.map((option) => ({
        label: option.label,
        value: option.id,
        badge: option.badge
      })),
    []
  );

  return {
    modelId,
    setModelId: handleModelChange,
    selectItems
  };
}