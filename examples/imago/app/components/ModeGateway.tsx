"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type ModeGatewayProps = {
    onModeSelect: (mode: "fantasy" | "freeform" | "flow") => void;
};

export function ModeGateway({ onModeSelect }: ModeGatewayProps) {
    const { lang } = useLanguage();
    const t = UI_TEXT[lang];
    const [hoveredMode, setHoveredMode] = useState<"fantasy" | "freeform" | "flow" | null>(null);
    const [selectedMode, setSelectedMode] = useState<"fantasy" | "freeform" | "flow" | null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [canHover, setCanHover] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const media = window.matchMedia("(hover: hover)");
        setCanHover(media.matches);
        setIsMounted(true);
        const handleChange = (event: MediaQueryListEvent) => {
            setCanHover(event.matches);
            if (!event.matches) {
                setHoveredMode(null);
            }
        };
        if (media.addEventListener) {
            media.addEventListener("change", handleChange);
        } else {
            media.addListener(handleChange);
        }
        return () => {
            if (media.removeEventListener) {
                media.removeEventListener("change", handleChange);
            } else {
                media.removeListener(handleChange);
            }
        };
    }, []);

    const modes = [
        {
            id: "fantasy" as const,
            label: "FANTASY",
            subLabel: t.mode_fantasy_sub,
            desc: t.mode_fantasy_desc,
            image: "/gateway_fantasy_sculpture.png"
        },
        {
            id: "freeform" as const,
            label: "FREEFORM",
            subLabel: t.mode_freeform_sub,
            desc: t.mode_freeform_desc,
            image: "/gateway_freeform_flux.png"
        },
        {
            id: "flow" as const,
            label: "FLOW",
            subLabel: t.mode_flow_sub,
            desc: t.mode_flow_desc,
            image: "/gateway_flow_motion.png"
        }
    ];

    const handleModeClick = (mode: "fantasy" | "freeform" | "flow") => {
        setSelectedMode(mode);

        setIsExiting(true);
        setTimeout(() => {
            onModeSelect(mode);
        }, 800);
    };

    return (
        <div
            className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 ${isExiting ? "opacity-0" : "opacity-100"
                }`}
        >
            <div className={`relative w-full h-full flex flex-col md:flex-row overflow-hidden transition-all duration-1000 ${isMounted ? "opacity-100" : "opacity-0"
                }`}>
                {modes.map((mode) => {
                    const isHovered = canHover && hoveredMode === mode.id;
                    const isDimmed = canHover && hoveredMode && hoveredMode !== mode.id;
                    const isSelected = selectedMode === mode.id;
                    const otherSelected = selectedMode && selectedMode !== mode.id;

                    let flexClass = "flex-1";
                    if (isSelected) {
                        flexClass = "flex-[1000_1_0%]";
                    } else if (otherSelected) {
                        flexClass = "flex-[0_0_0%]";
                    } else if (isHovered) {
                        flexClass = "flex-[2_1_0%]";
                    } else if (isDimmed) {
                        flexClass = "flex-[1_1_0%]";
                    }

                    return (
                        <div
                            key={mode.id}
                            className={`relative transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden cursor-pointer group border-b md:border-b-0 md:border-r border-white/5 last:border-0 ${flexClass}`}
                            onMouseEnter={() => !selectedMode && canHover && setHoveredMode(mode.id)}
                            onMouseLeave={() => !selectedMode && canHover && setHoveredMode(null)}
                            onClick={() => handleModeClick(mode.id)}
                        >
                            <div
                                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out ${isHovered || isSelected ? "scale-105 opacity-60 brightness-90" : "scale-100 opacity-60 brightness-90 md:opacity-40 md:brightness-50"
                                    }`}
                                style={{ backgroundImage: `url('${mode.image}')` }}
                            />

                            <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/20 to-transparent transition-opacity duration-700 ${isHovered ? "opacity-40" : "opacity-40 md:opacity-80"
                                }`} />

                            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 transition-all duration-700 ${isDimmed ? "opacity-30 scale-95 blur-[1px]" : "opacity-100 scale-100 blur-0"
                                }`}>
                                <h2 className={`font-serif text-4xl md:text-7xl tracking-[0.2em] text-white mb-6 uppercase transition-all duration-700 ${isHovered ? "text-shadow-glow translate-y-0" : canHover ? "translate-y-0 md:translate-y-4" : "translate-y-0"
                                    }`}>
                                    {mode.label}
                                </h2>

                                <div className={`overflow-hidden transition-all duration-700 ${isHovered ? "max-h-40 opacity-100 translate-y-0" : canHover ? "max-h-40 opacity-100 translate-y-0 md:max-h-0 md:opacity-0 md:translate-y-4" : "max-h-40 opacity-100 translate-y-0"
                                    }`}>
                                    <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/80 mb-4">
                                        {mode.subLabel}
                                    </p>
                                    <div className="w-12 h-px bg-white/30 mx-auto mb-4" />
                                    <p className="text-sm md:text-base font-light text-white/70 max-w-sm mx-auto leading-relaxed">
                                        {mode.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className={`relative md:absolute md:top-12 md:left-1/2 md:-translate-x-1/2 z-40 pointer-events-none transition-all duration-1000 flex justify-center md:block w-full md:w-auto order-first md:order-none mt-6 mb-2 md:mt-0 md:mb-0 ${selectedMode ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
                    }`}>
                    <h1 className="text-xl md:text-2xl font-serif tracking-[0.6em] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap">
                        IMAGO
                    </h1>
                </div>
            </div>
        </div>
    );
}