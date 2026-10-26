
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type GenderGatewayProps = {
    onSelect: (gender: "female" | "male" | "agender") => void;
};

export function GenderGateway({ onSelect }: GenderGatewayProps) {
    const { lang } = useLanguage();

    const [hoveredId, setHoveredId] = useState<"female" | "male" | "agender" | null>(null);
    const [selectedId, setSelectedId] = useState<"female" | "male" | "agender" | null>(null);
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
                setHoveredId(null);
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

    const cards = [
        {
            id: "female" as const,
            label: "HER",
            subLabel: lang === "zh" ? "她" : "FEMALE",
            desc: lang === "zh" ? "柔美与优雅的极致展现" : "Ultimate expression of grace and elegance",
            image: "/gateway_gender_her.png"
        },
        {
            id: "male" as const,
            label: "HIM",
            subLabel: lang === "zh" ? "他" : "MALE",
            desc: lang === "zh" ? "力量与结构的完美平衡" : "Perfect balance of power and structure",
            image: "/gateway_gender_him.png"
        },
        {
            id: "agender" as const,
            label: "X",
            subLabel: lang === "zh" ? "无界" : "AGENDER",
            desc: lang === "zh" ? "打破定义的先锋美学" : "Avant-garde aesthetics breaking definitions",
            image: "/gateway_gender_x.png"
        }
    ];

    const handleSelect = (id: "female" | "male" | "agender") => {
        setSelectedId(id);
        setIsExiting(true);
        setTimeout(() => {
            onSelect(id);
        }, 800);
    };

    if (!isMounted) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-1000 ${isExiting ? "opacity-0" : "opacity-100"
                }`}
        >
            <div className={`relative w-full h-full flex flex-col md:flex-row overflow-hidden transition-all duration-1000 ${isMounted ? "opacity-100" : "opacity-0"
                }`}>
                {cards.map((card) => {
                    const isHovered = canHover && hoveredId === card.id;
                    const isDimmed = canHover && hoveredId && hoveredId !== card.id;
                    const isSelected = selectedId === card.id;
                    const otherSelected = selectedId && selectedId !== card.id;

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
                            key={card.id}
                            className={`relative transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden cursor-pointer group border-b md:border-b-0 md:border-r border-white/5 last:border-0 ${flexClass}`}
                            onMouseEnter={() => !selectedId && canHover && setHoveredId(card.id)}
                            onMouseLeave={() => !selectedId && canHover && setHoveredId(null)}
                            onClick={() => handleSelect(card.id)}
                        >
                            <div
                                className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out ${isHovered || isSelected ? "scale-105 opacity-60 brightness-90" : "scale-100 opacity-60 brightness-90 md:opacity-40 md:brightness-50"
                                    }`}
                                style={{ backgroundImage: `url('${card.image}')` }}
                            />

                            <div className={`absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/20 to-transparent transition-opacity duration-700 ${isHovered ? "opacity-40" : "opacity-40 md:opacity-80"
                                }`} />

                            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20 transition-all duration-700 ${isDimmed ? "opacity-30 scale-95 blur-[1px]" : "opacity-100 scale-100 blur-0"
                                }`}>
                                <h2 className={`font-serif text-5xl md:text-8xl tracking-[0.1em] text-white mb-6 uppercase transition-all duration-700 ${isHovered ? "text-shadow-glow translate-y-0" : canHover ? "translate-y-0 md:translate-y-4" : "translate-y-0"
                                    }`}>
                                    {card.label}
                                </h2>

                                <div className={`overflow-hidden transition-all duration-700 ${isHovered ? "max-h-40 opacity-100 translate-y-0" : canHover ? "max-h-40 opacity-100 translate-y-0 md:max-h-0 md:opacity-0 md:translate-y-4" : "max-h-40 opacity-100 translate-y-0"
                                    }`}>
                                    <p className="text-xs md:text-sm tracking-[0.4em] uppercase text-white/80 mb-4">
                                        {card.subLabel}
                                    </p>
                                    <div className="w-12 h-px bg-white/30 mx-auto mb-4" />
                                    <p className="text-sm md:text-base font-light text-white/70 max-w-sm mx-auto leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className={`absolute top-12 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-all duration-1000 ${selectedId ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
                    }`}>
                    <h1 className="text-xl md:text-2xl font-serif tracking-[0.4em] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap uppercase">
                        {lang === "zh" ? "选择你的缪斯" : "Choose Your Muse"}
                    </h1>
                </div>
            </div>
        </div>,
        document.body
    );
}