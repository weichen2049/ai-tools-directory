"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { emitUsageUpdate } from "@lib/usageEvents";

export default function RechargeCallbackPage() {
  const searchParams = useSearchParams();
  const redirectStatus = useMemo(
    () => searchParams?.get("redirect_status")?.toLowerCase() ?? null,
    [searchParams]
  );
  const [message, setMessage] = useState("正在确认支付，请稍候…");
  const [subMessage, setSubMessage] = useState("系统会自动刷新积分余额");
  const [pendingRedirect, setPendingRedirect] = useState(true);

  useEffect(() => {
    if (redirectStatus === "failed") {
      setMessage("支付失败或已过期");
      setSubMessage("请返回 Imago 重新发起支付");
      setPendingRedirect(false);
      return;
    }
    if (redirectStatus === "canceled") {
      setMessage("支付已取消");
      setSubMessage("如需继续，请回 Imago 再次发起支付");
      setPendingRedirect(false);
      return;
    }

    let cancelled = false;
    const syncUsage = async () => {
      try {
        if (redirectStatus === "succeeded") {
          setMessage("支付成功 · 正在刷新额度");
        } else {
          setMessage("正在确认支付，请稍候…");
        }
        setSubMessage("系统会自动刷新积分余额");

        await fetch("/api/usage", { cache: "no-store", credentials: "include" });
        emitUsageUpdate();
        if (cancelled) return;
        setMessage("支付成功 · 正在返回 Imago");
        setSubMessage("如未自动跳转，可点击下方按钮");
      } catch {
        if (cancelled) return;
        setMessage("已收到支付回调");
        setSubMessage("额度尚未自动刷新，请手动返回重试");
        setPendingRedirect(false);
        return;
      }

      setTimeout(() => {
        if (cancelled) return;
        window.location.href = "/";
      }, 2000);
    };
    void syncUsage();
    return () => {
      cancelled = true;
    };
  }, [redirectStatus]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#050505] to-[#0b0b0b] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
        <div className="mb-6 flex items-center justify-center">
          <span className="h-3 w-3 animate-ping rounded-full bg-[#f5d9a3]" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Imago</p>
        <h1 className="mt-4 text-3xl font-serif tracking-[0.2em]">{message}</h1>
        <p className="mt-3 text-sm text-white/70">{subMessage}</p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-2 text-[11px] uppercase tracking-[0.3em] text-white hover:border-white/70 transition"
        >
          返回首页
        </Link>
        {pendingRedirect && (
          <p className="mt-4 text-[10px] text-white/50">页面将在数秒内自动返回</p>
        )}
      </div>
    </main>
  );
}