"use client";

import { useState } from "react";
import { Badge } from "./ModelSelector";
import { useLanguage } from "../providers/LanguageProvider";
import { VIDEO_CREDIT_COSTS } from "@lib/credits";

export function VideoModelInfo() {
    const { lang } = useLanguage();
    const [showPricing, setShowPricing] = useState(false);

    const modelName = "VIDEO";
    const pricingTitle = lang === "zh" ? "积分定价" : "Credit Pricing";
    const durationLabel = lang === "zh" ? "时长" : "Duration";

    return (
        <div className="space-y-3">
            <span className="block text-lux-muted tracking-[0.2em] uppercase text-[10px]">
                {lang === "zh" ? "模型" : "Model"}
            </span>
            <div className="relative inline-block">
                <button
                    type="button"
                    onMouseEnter={() => setShowPricing(true)}
                    onMouseLeave={() => setShowPricing(false)}
                    className="group relative rounded-full border px-4 py-2 text-xs tracking-[0.25em] uppercase transition-all duration-300 flex items-center gap-2 bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.35)] cursor-default"
                >
                    <span>{modelName}</span>
                </button>

                
                {showPricing && (
                    <div className="absolute left-0 top-full mt-2 z-50 bg-lux-surface border border-lux-line rounded-lg p-4 shadow-xl min-w-[240px] animate-fade-in">
                        <div className="text-xs text-lux-muted uppercase tracking-[0.15em] mb-3">
                            {pricingTitle}
                        </div>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-lux-muted/70">
                                    <th className="text-left pb-2 font-normal">{durationLabel}</th>
                                    <th className="text-center pb-2 font-normal">720p</th>
                                    <th className="text-center pb-2 font-normal">1080p</th>
                                </tr>
                            </thead>
                            <tbody className="text-lux-text">
                                {(["5", "10", "15"] as const).map((dur) => (
                                    <tr key={dur} className="border-t border-lux-line/50">
                                        <td className="py-2">{dur}s</td>
                                        <td className="py-2 text-center">{VIDEO_CREDIT_COSTS["720p"][dur]}</td>
                                        <td className="py-2 text-center">{VIDEO_CREDIT_COSTS["1080p"][dur]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}