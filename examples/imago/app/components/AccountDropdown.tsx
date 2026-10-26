"use client";

import { useEffect, useRef } from "react";
import type { UsageSummary } from "../hooks/useUsageSummary";
import { UI_TEXT } from "@lib/i18n";
import { MODEL_DISPLAY_NAMES } from "@lib/credits";

type AccountDropdownProps = {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement>;
  totalCredits: number | null;
  summary: UsageSummary | null;
  lang: "zh" | "en";
  onSignOut: () => Promise<void>;
  t: typeof UI_TEXT["zh"];
  onRecharge: () => void;
  onUsageRefresh: () => void;
  usageRefreshing: boolean;
};

export function AccountDropdown({
  open,
  onClose,
  anchorRef,
  totalCredits,
  summary,
  lang,
  onSignOut,
  t,
  onRecharge,
  onUsageRefresh,
  usageRefreshing
}: AccountDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) return null;


  return (
    <div
      ref={dropdownRef}
      className="fixed left-4 right-4 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-[21rem] rounded-[32px] border border-white/20 bg-[#090909]/95 p-5 text-[11px] tracking-[0.2em] text-white shadow-2xl z-40 backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <span className="uppercase text-white/70">{t.usage_panel_title}</span>
        <button
          type="button"
          onClick={onSignOut}
          className="text-[10px] uppercase text-white/60 hover:text-white"
        >
          {t.auth_sign_out}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-serif tracking-[0.2em]">{totalCredits ?? "--"}</span>
          <span className="text-xs text-white/60">{t.usage_label_credits}</span>
        </div>
        <button
          type="button"
          onClick={onUsageRefresh}
          disabled={usageRefreshing}
          className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white hover:border-white/40 disabled:opacity-40 flex items-center gap-1"
          aria-label={t.usage_refresh_button}
        >
          <span className={usageRefreshing ? "animate-spin" : ""}>↻</span>
          <span>{t.usage_refresh_button}</span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <CompactUsageRow
          name={MODEL_DISPLAY_NAMES.image}
          limit={summary?.image?.limit ?? 0}
          used={summary?.image?.used ?? 0}
          cost={summary?.costs.image ?? 0}
          lang={lang}
        />
        <CompactUsageRow
          name={MODEL_DISPLAY_NAMES.video}
          limit={summary?.video?.limit ?? 0}
          used={summary?.video?.used ?? 0}
          cost={summary?.costs.video ?? 0}
          lang={lang}
        />
      </div>

      <button
        type="button"
        onClick={onRecharge}
        className="mt-4 w-full rounded-full border border-white/30 px-4 py-2 text-white text-xs uppercase tracking-[0.3em] hover:border-white/70 transition"
      >
        {t.usage_panel_recharge_button}
      </button>
    </div>
  );
}

function CompactUsageRow({
  name,
  limit,
  used,
  cost,
  lang
}: {
  name: string;
  limit: number;
  used: number;
  cost: number;
  lang: "zh" | "en";
}) {
  const percentage = limit === 0 ? 100 : Math.min(100, (used / limit) * 100);
  const isExhausted = used >= limit;

  return (
    <div className="group flex items-center justify-between rounded-lg p-2.5 hover:bg-white/5 transition-colors">
      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white/90 truncate">{name}</span>
          {isExhausted && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/50 leading-none">
              {lang === "zh" ? "已用完" : "FULL"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <span>{lang === "zh" ? `超额 ${cost} 积分` : `+${cost} credits`}</span>
          
          <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isExhausted ? 'bg-red-400/50' : 'bg-white/40'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      <div className="text-right flex items-baseline gap-1.5">
        <div className="text-sm font-mono tracking-wider text-white/90">
          <span className={isExhausted ? "text-white/40" : "text-white"}>{used}</span>
          <span className="text-white/30 text-[10px] mx-0.5">/</span>
          <span className="text-white/30 text-[10px]">{limit}</span>
        </div>
        <span className="text-[10px] text-white/40">
          {lang === "zh" ? "已用" : "used"}
        </span>
      </div>
    </div>
  );
}