"use client";

import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useSupabase } from "../providers/SupabaseProvider";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";
import { MODEL_OPTIONS } from "@lib/models";
import { subscribeHistoryUpdate } from "@lib/historyEvents";
import { PreviewModal } from "./PreviewModal";
import { PromptModal } from "./PromptModal";
import { OPTIONS } from "@lib/options";
import { OPTION_LABELS_EN } from "@lib/i18n";
import { FREE_TEMPLATES } from "../config/freeTemplates";
import { Badge } from "./ModelSelector";
import { fetchWithRetry } from "@lib/utils/request";
import { captureClientError } from "@lib/utils/telemetry";

type HistoryItem = {
  id: string;
  model_id: string | null;
  image_url: string | null;
  video_url?: string | null; // Added
  type?: "image" | "video"; // Added
  summary: string | null;
  prompt_raw: string | null;
  metadata?: Record<string, unknown> | null;
  credits_spent: number | null;
  status: string | null;
  created_at: string;
};

type ChoiceMetadata = {
  choices?: {
    style_mode?: string;
    pose?: string;
    scene_location?: string;
  };
  template_id?: string;
  image_size?: string;
  flow?: {
    duration?: string;
    resolution?: string;
    multi_shots?: boolean;
    image_urls?: string[];
  };
};

const PAGE_SIZE = 12;
const MODEL_META_MAP = MODEL_OPTIONS.reduce<Record<string, { label: string; badge?: { text: string; variant?: "gold" | "nsfw" } }>>(
  (acc, option) => {
    acc[option.id] = { label: option.label, badge: option.badge };
    return acc;
  },
  {}
);
const TEMPLATE_LABEL_MAP = FREE_TEMPLATES.reduce<
  Record<string, { zh: string; en: string }>
>((acc, tpl) => {
  acc[tpl.id] = {
    zh: tpl.name,
    en: tpl.name_en || tpl.name
  };
  return acc;
}, {});

function getOptionLabel(category: keyof typeof OPTIONS, value: string | undefined, lang: "zh" | "en") {
  if (!value) return "";
  if (lang === "zh") {
    const option = OPTIONS[category]?.find((opt) => opt.value === value);
    return option?.label || "";
  }
  return OPTION_LABELS_EN[value] || "";
}

function localizeFreeformSummary(summary: string | null, lang: "zh" | "en") {
  if (!summary) return "";
  let text = summary.trim();
  if (lang === "zh") {
    text = text.replace(/^freeform/i, "自由模式");
    text = text.replace(/·\s*custom\b/gi, "· 自定义");
    return text;
  }
  text = text.replace(/^自由模式/, "Freeform");
  text = text.replace(/·\s*自定义\b/gi, "· Custom");
  return text.replace(/^freeform/i, "Freeform");
}

function isFreeformItem(item: HistoryItem) {
  if (item.type === "video") return false;
  const metadata = (item.metadata || {}) as ChoiceMetadata;
  if (metadata.choices) return false;
  if (metadata.template_id) return true;
  const summaryLower = (item.summary || "").toLowerCase();
  if (summaryLower.startsWith("freeform")) return true;
  if ((item.summary || "").startsWith("自由模式")) return true;
  return !metadata.choices && Boolean(item.prompt_raw);
}

function buildSummary(item: HistoryItem, lang: "zh" | "en") {
  const metadata = (item.metadata || {}) as ChoiceMetadata;
  if (item.type === "video") {
    const base = UI_TEXT[lang].history_video_summary;
    const flow = metadata.flow;
    if (flow?.duration || flow?.resolution) {
      const duration = flow.duration ? `${flow.duration}s` : undefined;
      const details = [flow.resolution, duration].filter(Boolean).join(" · ");
      return `${base} · ${details}`;
    }
    return base;
  }
  const freeform = isFreeformItem(item);
  if (metadata.choices) {
    const style = getOptionLabel("style_mode", metadata.choices.style_mode, lang);
    const pose = getOptionLabel("pose", metadata.choices.pose, lang);
    const scene = getOptionLabel("scene_location", metadata.choices.scene_location, lang);
    const parts = [style, pose, scene].filter(Boolean);
    if (parts.length > 0) return parts.join(" · ");
  }

  if (metadata.template_id) {
    const labels = TEMPLATE_LABEL_MAP[metadata.template_id];
    if (labels) {
      const prefix = lang === "zh" ? "自由模式" : "Freeform";
      return `${prefix} · ${lang === "zh" ? labels.zh : labels.en}`;
    }
    const prefix = lang === "zh" ? "自由模式" : "Freeform";
    const fallbackName =
      metadata.template_id === "custom"
        ? lang === "zh"
          ? "自定义"
          : "Custom"
        : metadata.template_id;
    return `${prefix} · ${fallbackName}`;
  }

  if (freeform) {
    return localizeFreeformSummary(item.summary, lang) || item.prompt_raw || "";
  }

  return item.summary || "";
}

function HistoryCardBase({
  item,
  onPreview,
  onPrompt,
  delay,
  t,
  onEdit,
  isMenuOpen,
  onMenuOpenChange,
  onAnimate
}: {
  item: ReturnType<typeof formatHistoryItems>[number];
  onPreview: (url: string, type: "image" | "video") => void;
  onPrompt: (prompt: string) => void;
  delay: number;
  t: typeof UI_TEXT["zh"];
  onEdit?: (url: string) => void;
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onAnimate?: (url: string) => void;
}) {
  const isVideo = item.type === "video";
  const hasVideo = isVideo && Boolean(item.video_url);
  const displayUrl = hasVideo
    ? null
    : item.image_url || (isVideo ? "/flow_preview_placeholder.png" : null);

  return (
    <article
      className="history-card group relative rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent flex flex-col transition-all duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        type="button"
        className="relative aspect-square bg-black/60 w-full overflow-hidden rounded-t-[28px]"
        onClick={() => {
          if (hasVideo && item.video_url) onPreview(item.video_url, "video");
          else if (item.image_url) onPreview(item.image_url, "image");
        }}
        onMouseEnter={(e) => {
          if (hasVideo) {
            const video = e.currentTarget.querySelector("video");
            if (video) video.play().catch(() => { });
          }
        }}
        onMouseLeave={(e) => {
          if (hasVideo) {
            const video = e.currentTarget.querySelector("video");
            if (video) {
              video.pause();
              video.currentTime = 0;
            }
          }
        }}
      >
        {hasVideo && item.video_url ? (
          <video
            src={item.video_url}
            className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.05]"
            muted
            playsInline
            loop
            preload="auto"
          />
        ) : displayUrl ? (
          <img
            src={displayUrl}
            alt={item.summary ?? "result"}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition duration-700 group-hover:scale-[1.05] ${((item.metadata as ChoiceMetadata)?.choices?.pose || "").startsWith("closeup_")
              ? "object-center"
              : "object-top"
              }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-lux-muted">{t.no_image}</div>
        )}
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-[11px] tracking-[0.2em] uppercase text-white/80">
          <span>{item.model_label || (isVideo ? t.badge_video : t.badge_model)}</span>
          {item.model_badge?.variant === "gold" && (
            <Badge text={item.model_badge.text} variant="gold" active />
          )}
          {item.model_badge?.variant === "gold" && item.image_size && (
            <span className="border-l border-white/30 pl-2 ml-1">{item.image_size}</span>
          )}
        </div>
        
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        )}
      </button>
      <div className="p-4 space-y-2 text-xs tracking-wide bg-[#0c0c0f]/90 relative rounded-b-[28px]">
        <p className="text-sm font-semibold text-white line-clamp-2 pr-6">{item.displaySummary || "—"}</p>
        <div className="text-[11px] text-lux-muted flex justify-between gap-3">
          <span>{item.date.toLocaleDateString()}</span>
          <span>{item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-lux-muted/80 uppercase h-5">
          <span>
            {typeof item.credits_spent === "number"
              ? `${t.history_credits_label} ${item.credits_spent}`
              : `${t.history_status_label} ${item.status ?? "completed"}`}
          </span>
          
          <ActionsMenu
            item={item}
            onEdit={onEdit}
            onAnimate={onAnimate}
            onPrompt={onPrompt}
            t={t}
            isVideo={isVideo}
            open={isMenuOpen}
            setOpen={onMenuOpenChange}
          />
        </div>
      </div>
    </article>
  );
}

function ActionsMenu({ item, onEdit, onAnimate, onPrompt, t, isVideo, open, setOpen }: {
  item: any,
  onEdit?: (url: string) => void,
  onAnimate?: (url: string) => void,
  onPrompt: (p: string) => void,
  t: any,
  isVideo: boolean,
  open: boolean,
  setOpen: (v: boolean) => void
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top?: number; left: number; bottom?: number }>({ left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const estimatedHeight = 180;

      let newCoords: { top?: number; left: number; bottom?: number } = {
        top: rect.bottom + 8,
        left: rect.right - 128
      };

      if (spaceBelow < estimatedHeight && rect.top > spaceBelow) {
        newCoords = {
          bottom: viewportHeight - rect.top + 8,
          left: rect.right - 128
        };
      }
      setCoords(newCoords);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, true);
    const handleClickOutside = () => setOpen(false);
    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [open, setOpen]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = item.video_url || item.image_url;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `download-${Date.now()}.${isVideo ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-lux-muted hover:text-white transition-colors p-1 -mr-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed w-32 bg-black/90 border border-white/10 rounded-lg shadow-xl backdrop-blur-md overflow-hidden z-[70] flex flex-col py-1"
          style={{ top: coords.top, bottom: coords.bottom, left: coords.left }}
          onClick={(e) => e.stopPropagation()} // Stop click from reaching document listener
        >
          
          {item.prompt_raw && (
            <button
              onClick={() => { onPrompt(item.prompt_raw!); setOpen(false); }}
              className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-lux-text hover:bg-white/10 hover:text-white transition-colors"
            >
              {t.view_prompt}
            </button>
          )}

          
          {item.image_url && onEdit && !isVideo && (
            <button
              onClick={() => { onEdit(item.image_url!); setOpen(false); }}
              className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-lux-text hover:bg-white/10 hover:text-white transition-colors"
            >
              {t.history_menu_edit}
            </button>
          )}

          
          {item.image_url && onAnimate && !isVideo && (
            <button
              onClick={() => { onAnimate(item.image_url!); setOpen(false); }}
              className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-lux-text hover:bg-white/10 hover:text-white transition-colors"
            >
              {t.history_menu_animate}
            </button>
          )}

          
          <button
            onClick={handleDownload}
            className="text-left px-3 py-2 text-[10px] uppercase tracking-wider text-lux-text hover:bg-white/10 hover:text-white transition-colors"
          >
            {t.history_menu_download}
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

const HistoryCard = memo(HistoryCardBase);

type FormattedHistoryItem = ReturnType<typeof formatHistoryItems>[number];

function formatHistoryItems(items: HistoryItem[], lang: "zh" | "en") {
  return items.map((item) => {
    const date = new Date(item.created_at);
    const modelMeta = item.model_id ? MODEL_META_MAP[item.model_id] : undefined;
    const freeform = isFreeformItem(item);
    const metadata = (item.metadata || {}) as ChoiceMetadata;
    return {
      ...item,
      date,
      model_label: modelMeta?.label || item.model_id || "",
      model_badge: modelMeta?.badge,
      displaySummary: buildSummary(item, lang),
      isFreeform: freeform,
      image_size: metadata.image_size
    };
  });
}

interface HistoryPanelProps {
  onEdit?: (imageUrl: string) => void;
  onAnimate?: (imageUrl: string) => void;
  className?: string;
}

export function HistoryPanel({ onEdit, onAnimate, className = "" }: HistoryPanelProps = {}) {
  const { user } = useSupabase();
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [pendingRefresh, setPendingRefresh] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [promptPreview, setPromptPreview] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"image" | "video">("image");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchHistory = useCallback(
    async (reset = false) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const from = reset ? 0 : items.length;
        const to = from + PAGE_SIZE - 1;
        const res = await fetchWithRetry(`/api/history?from=${from}&to=${to}&type=${filterType}`, {
          cache: "no-store",
          timeoutMs: 12000,
          retries: 1
        });
        const json = (await res.json()) as { data: HistoryItem[] };
        setItems((prev) => (reset ? json.data : [...prev, ...json.data]));
        setHasMore(json.data.length === PAGE_SIZE);
        setInitialLoaded(true);
      } catch (err) {
        captureClientError({
          component: "HistoryPanel",
          endpoint: "/api/history",
          message: err instanceof Error ? err.message : "history_failed"
        });
        setError(t.history_error);
      } finally {
        setLoading(false);
      }
    },
    [user, items.length, t.history_error, filterType]
  );

  useEffect(() => {
    setItems([]);
    setInitialLoaded(false);
    setHasMore(true);
    setActiveMenuId(null);
    if (open) {
      void fetchHistory(true);
    }
  }, [filterType]);

  useEffect(() => {
    if (open && !initialLoaded && !loading) {
      void fetchHistory(true);
    }
  }, [open, initialLoaded, loading, fetchHistory]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setInitialLoaded(false);
      setHasMore(true);
      setPendingRefresh(false);
      return;
    }
    setItems([]);
    setInitialLoaded(false);
    setHasMore(true);
    setPendingRefresh(true);
  }, [user?.id, user]);

  useEffect(() => {
    if (!open || !pendingRefresh || loading) return;
    void fetchHistory(true);
    setPendingRefresh(false);
  }, [open, pendingRefresh, loading, fetchHistory]);

  useEffect(() => {
    const unsubscribe = subscribeHistoryUpdate(() => {
      if (open) {
        void fetchHistory(true);
      } else {
        setPendingRefresh(true);
      }
    });
    return unsubscribe;
  }, [open, fetchHistory]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/history/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.recoveredCount > 0 || data.refundCount > 0) {
          fetchHistory(true);
        }
      }
    } catch (err) {
      console.error("Sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const formattedItems = useMemo(() => formatHistoryItems(items, lang), [items, lang]);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-lux-text border border-lux-text/40 px-3 py-1 hover:border-lux-text transition-colors flex items-center gap-2"
        aria-label={t.history_button}
      >
        <span className="hidden sm:inline">{t.history_button}</span>
        <span className="sm:hidden">
          
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur" onClick={() => setOpen(false)} />
            
            <div className="relative z-10 w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-[32px] border border-white/15 bg-[#0b0b0e]/95 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 flex-shrink-0">
                <div>
                  <p className={`text-xs tracking-[0.2em] text-lux-muted ${lang === "en" ? "uppercase" : ""}`}>{t.history_title}</p>
                  <p className="text-[11px] text-lux-muted/70">{user.email ?? user.id}</p>
                  <p className="mt-1 text-[10px] text-lux-muted/60">{t.history_limit_notice}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs tracking-[0.2em] text-lux-muted hover:text-white"
                >
                  ✕
                </button>
              </div>

              
              <div className="flex items-center gap-6 px-6 pt-4 pb-2 border-b border-white/5">
                <button
                  onClick={() => setFilterType("image")}
                  className={`text-xs tracking-[0.2em] uppercase pb-2 transition-colors border-b-2 ${filterType === "image" ? "text-white border-white" : "text-lux-muted border-transparent hover:text-white/80"
                    }`}
                >
                  {t.tab_images}
                </button>
                <button
                  onClick={() => setFilterType("video")}
                  className={`text-xs tracking-[0.2em] uppercase pb-2 transition-colors border-b-2 ${filterType === "video" ? "text-white border-white" : "text-lux-muted border-transparent hover:text-white/80"
                    }`}
                >
                  {t.tab_videos}
                </button>

                
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="text-[10px] tracking-[0.2em] uppercase text-lux-muted hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
                    title="Sync missing tasks"
                  >
                    <svg className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isSyncing ? t.history_syncing : t.history_sync}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {error && <p className="text-sm text-red-400">{error}</p>}

                {!error && !loading && formattedItems.length === 0 && (
                  <p className="text-sm text-lux-muted text-center py-10">
                    {filterType === "video" ? t.history_empty_videos : t.history_empty}
                  </p>
                )}

                {loading && !initialLoaded && (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`history-skeleton-${index}`}
                        className="animate-pulse rounded-[28px] border border-white/5 bg-white/5/20 h-64"
                      >
                        <div className="h-2/3 bg-white/5 rounded-t-[28px]" />
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-white/10 rounded" />
                          <div className="h-3 bg-white/10 rounded w-1/2" />
                          <div className="h-3 bg-white/10 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 items-start">
                  {formattedItems.map((item, index) => (
                    <HistoryCard
                      key={item.id}
                      item={item as FormattedHistoryItem}
                      delay={index * 50}
                      t={t}
                      isMenuOpen={activeMenuId === item.id}
                      onMenuOpenChange={(open) => setActiveMenuId(open ? item.id : null)}
                      onPreview={(url, type) => setPreviewMedia({ url, type })}
                      onPrompt={(prompt) => setPromptPreview(prompt)}
                      onEdit={(url) => {
                        onEdit?.(url);
                        setOpen(false);
                      }}
                      onAnimate={(url) => {
                        onAnimate?.(url);
                        setOpen(false);
                      }}
                    />
                  ))}
                </div>

                {hasMore && !loading && formattedItems.length > 0 && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => void fetchHistory(false)}
                      className="text-xs tracking-[0.3em] uppercase border border-white/30 px-4 py-2 hover:border-white"
                    >
                      {t.history_load_more}
                    </button>
                  </div>
                )}

                {loading && !initialLoaded && <p className="text-center text-xs text-lux-muted">{t.auth_syncing}</p>}
              </div>
            </div>

            
            {previewMedia && (
              <PreviewModal
                url={previewMedia.url}
                type={previewMedia.type}
                open={Boolean(previewMedia)}
                onClose={() => setPreviewMedia(null)}
              />
            )}

            <PromptModal
              promptText={promptPreview || ""}
              open={!!promptPreview}
              onClose={() => setPromptPreview(null)}
            />
          </div>,
          document.body
        )}
    </>
  );
}