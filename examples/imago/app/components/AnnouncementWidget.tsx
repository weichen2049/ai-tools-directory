"use client";

import { useEffect, useMemo, useState } from "react";
import { ANNOUNCEMENTS } from "../config/announcements";
import { useLanguage } from "../providers/LanguageProvider";
import { useSupabase } from "../providers/SupabaseProvider";
import { STORAGE_KEYS } from "@lib/publicEnv";

const STORAGE_KEY = STORAGE_KEYS.announcements;

export function AnnouncementWidget() {
  const { lang } = useLanguage();
  const { user } = useSupabase();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        setDismissedIds(new Set(parsed));
      }
    } catch {
    } finally {
      setHydrated(true);
    }
  }, []);

  const active = useMemo(() => {
    const now = Date.now();
    return ANNOUNCEMENTS.find((announcement) => {
      if (announcement.active === false) return false;
      if (dismissedIds.has(announcement.id)) return false;
      if (announcement.startsAt && now < new Date(announcement.startsAt).getTime()) return false;
      if (announcement.endsAt && now > new Date(announcement.endsAt).getTime()) return false;
      return true;
    });
  }, [dismissedIds]);

  useEffect(() => {
    if (!active) setOpen(false);
  }, [active]);

  if (!hydrated || !active || !user) return null;

  const title = lang === "zh" ? active.title : active.title_en || active.title;
  const desc = lang === "zh" ? active.description : active.description_en || active.description;

  const handleDismiss = () => {
    const next = new Set(dismissedIds);
    next.add(active.id);
    setDismissedIds(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    }
    setOpen(false);
  };

  const buttonLabel = open
    ? lang === "zh"
      ? "收起通告"
      : "Hide Notice"
    : lang === "zh"
      ? "有新通知"
      : "New Notice";

  return (
    <div className="relative inline-flex items-center z-30">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="announce-button px-3 sm:px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-white/80 hover:text-white flex items-center"
        aria-label={buttonLabel}
      >
        <span className="hidden sm:inline">{buttonLabel}</span>
        <span className="sm:hidden">
          
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="announce-panel absolute top-full right-0 mt-3 w-72 max-w-[90vw] rounded-[32px] border border-white/10 bg-[#090909]/90 backdrop-blur px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/0 pointer-events-none" />
          <div className="relative space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/55">{title}</p>
            <p className="text-sm text-white/85 leading-relaxed">{desc}</p>
            <div className="flex items-center justify-end pt-2 text-xs gap-3">
              <button
                onClick={handleDismiss}
                className="text-white/50 hover:text-white text-[10px] uppercase tracking-[0.3em]"
              >
                {lang === "zh" ? "不再提示" : "Dismiss"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-white text-[12px]"
                aria-label="Close announcement"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}