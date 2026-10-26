"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { FantasyMode } from "./components/FantasyMode";
import { useLanguage } from "./providers/LanguageProvider";
import { UI_TEXT, ENGLISH_ONLY_TEXT } from "@lib/i18n";
import { AuthControls } from "./components/AuthControls";
import { HistoryPanel } from "./components/HistoryPanel";
import { AnnouncementWidget } from "./components/AnnouncementWidget";
import { ModeGateway } from "./components/ModeGateway";
import { buildCallbackSearchParams } from "@lib/auth/redirects";
import { FlowMode } from "./components/FlowMode";
import { AgeGate } from "./components/AgeGate";

const FreeformMode = dynamic(
  () =>
    import("./components/FreeformMode").then((mod) => ({
      default: mod.FreeformMode
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[300px] flex items-center justify-center text-sm text-lux-muted">
        Loading Freeform Mode…
      </div>
    )
  }
);

export default function Page() {
  const [activeMode, setActiveMode] = useState<"generate" | "free" | "flow">("generate");
  const [currentTime, setCurrentTime] = useState("");
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const generateRef = useRef<HTMLButtonElement | null>(null);
  const freeRef = useRef<HTMLButtonElement | null>(null);
  const flowRef = useRef<HTMLButtonElement | null>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  const [hasCompletedGateway, setHasCompletedGateway] = useState(false);
  const [isEnteringMain, setIsEnteringMain] = useState(false);
  const [pendingFreeformImage, setPendingFreeformImage] = useState<string | null>(null);
  const [pendingFlowImage, setPendingFlowImage] = useState<string | null>(null);

  const { lang, setLang } = useLanguage();
  const t = UI_TEXT[lang];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = buildCallbackSearchParams({
      code: params.get("code"),
      type: params.get("type"),
      next: params.get("next")
    });
    if (!search) return;
    window.location.replace(`/auth/callback?${search}`);
  }, []);

  const updateIndicator = useCallback(() => {
    const container = tabsRef.current;
    if (!container) return;
    const target =
      activeMode === "generate"
        ? generateRef.current
        : activeMode === "free"
          ? freeRef.current
          : flowRef.current;
    if (!target) return;
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setIndicator({
      width: targetRect.width,
      left: targetRect.left - containerRect.left
    });
  }, [activeMode]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, lang]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  useEffect(() => {
    if (hasCompletedGateway && isEnteringMain) {
      const timer = setTimeout(() => {
        setIsEnteringMain(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedGateway, isEnteringMain]);

  const handleModeSelect = (mode: "fantasy" | "freeform" | "flow") => {
    setActiveMode(mode === "fantasy" ? "generate" : mode === "freeform" ? "free" : "flow");
    setIsEnteringMain(true);
    setHasCompletedGateway(true);
  };

  const handleEditFromHistory = (imageUrl: string) => {
    setPendingFreeformImage(imageUrl);
    setActiveMode("free");
  };

  const handleSwitchToFlow = (imageUrl: string) => {
    setPendingFlowImage(imageUrl);
    setActiveMode("flow");
  };

  const handleSwitchToFreeform = (imageUrl?: string) => {
    if (imageUrl) {
      setPendingFreeformImage(imageUrl);
    }
    setActiveMode("free");
  };

  if (!hasCompletedGateway) {
    return (
      <>
        <AgeGate />
        <ModeGateway onModeSelect={handleModeSelect} />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen bg-lux-bg text-lux-text flex flex-col relative overflow-x-hidden transition-all duration-500 ${isEnteringMain ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
    >
      <div className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 relative z-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-serif tracking-[0.12em] flex items-center gap-2 md:gap-3 select-none">
              <img src="/favicon.svg" alt="" className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
              IMAGO
            </h1>

            <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-6">
              
              <div className="flex gap-2 text-[10px] sm:text-xs font-medium tracking-[0.2em]">
                <button
                  onClick={() => setLang("en")}
                  className={`transition-colors duration-300 ${lang === "en" ? "text-lux-text" : "text-lux-muted hover:text-lux-text"}`}
                >
                  EN
                </button>
                <span className="text-lux-muted">/</span>
                <button
                  onClick={() => setLang("zh")}
                  className={`transition-colors duration-300 ${lang === "zh" ? "text-lux-text" : "text-lux-muted hover:text-lux-text"}`}
                >
                  中文
                </button>
              </div>

              <HistoryPanel onEdit={handleEditFromHistory} onAnimate={handleSwitchToFlow} />
              <AuthControls />
              <AnnouncementWidget />
            </div>
          </div>

          <div
            ref={tabsRef}
            className="relative flex gap-6 md:gap-8 items-center pb-1"
          >
            <span
              className="pointer-events-none absolute bottom-0 h-[2px] bg-lux-text transition-all duration-300 ease-out"
              style={{
                width: indicator.width ? `${indicator.width}px` : 0,
                transform: `translateX(${indicator.left}px)`,
                opacity: indicator.width ? 1 : 0
              }}
            />
            <button
              ref={generateRef}
              className={`py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border-b-0 ${activeMode === "generate"
                ? "text-lux-text"
                : "text-lux-muted hover:text-lux-text/80"
                } flex-shrink-0 whitespace-nowrap`}
              onClick={() => setActiveMode("generate")}
            >
              {t.mode_fantasy}
            </button>
            <button
              ref={freeRef}
              className={`py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border-b-0 ${activeMode === "free"
                ? "text-lux-text"
                : "text-lux-muted hover:text-lux-text/80"
                } flex-shrink-0 whitespace-nowrap`}
              onClick={() => setActiveMode("free")}
            >
              {t.mode_freeform}
            </button>
            <button
              ref={flowRef}
              className={`py-2 text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border-b-0 ${activeMode === "flow"
                ? "text-lux-text"
                : "text-lux-muted hover:text-lux-text/80"
                } flex-shrink-0 whitespace-nowrap`}
              onClick={() => setActiveMode("flow")}
            >
              {t.mode_flow}
            </button>
          </div>

        </header>

        <div className={activeMode === "generate" ? "block" : "hidden"}>
          <FantasyMode
            onSwitchToFreeform={handleSwitchToFreeform}
            onSwitchToFlow={handleSwitchToFlow}
            isActive={activeMode === "generate"}
          />
        </div>
        <div className={activeMode === "free" ? "block" : "hidden"}>
          <FreeformMode
            initialImage={pendingFreeformImage}
            onConsumeInitialImage={() => setPendingFreeformImage(null)}
            onSwitchToFlow={handleSwitchToFlow}
          />
        </div>
        <div className={activeMode === "flow" ? "block" : "hidden"}>
          <FlowMode
            initialImage={pendingFlowImage}
            onConsumeInitialImage={() => setPendingFlowImage(null)}
          />
        </div>
      </div>

      
      <div className="h-24 lg:hidden" />

      
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4 hidden lg:flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-[10px] text-zinc-500 font-mono tracking-widest select-none z-50 relative">
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-lux-text transition-colors duration-300">{t.terms}</a>
          <a href="/privacy" className="hover:text-lux-text transition-colors duration-300">{t.privacy}</a>
          <a href="/contact" className="hover:text-lux-text transition-colors duration-300">{t.contact}</a>
        </div>
        <div className="pointer-events-none text-center sm:text-right space-y-1">
          <div>IMAGO_V1.0 // {currentTime}</div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600">Your Deepest Fantasies, Realized</div>
        </div>
      </footer>
    </div>
  );
}