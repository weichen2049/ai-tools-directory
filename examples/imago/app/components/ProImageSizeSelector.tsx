"use client";

import { useEffect, useState } from "react";
import { PRO_IMAGE_SIZES, type ProImageSize } from "@lib/models";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

type Props = {
    value: ProImageSize;
    onChange: (size: ProImageSize) => void;
    visible: boolean;
};


export function ProImageSizeSelector({ value, onChange, visible }: Props) {
    const { lang } = useLanguage();
    const t = UI_TEXT[lang];

    const [shouldRender, setShouldRender] = useState(visible);
    const [animating, setAnimating] = useState<"enter" | "exit" | null>(null);

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                setAnimating("enter");
            });
        } else if (shouldRender) {
            setAnimating("exit");
        }
    }, [visible, shouldRender]);

    const handleAnimationEnd = () => {
        if (animating === "exit") {
            setShouldRender(false);
        }
        setAnimating(null);
    };

    if (!shouldRender) return null;

    const animationClass =
        animating === "enter"
            ? "animate-size-selector-enter"
            : animating === "exit"
                ? "animate-size-selector-exit"
                : "";

    return (
        <div
            className={`space-y-2 overflow-hidden ${animationClass}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <span className="text-lux-muted tracking-[0.2em] uppercase text-[10px]">
                {t.pro_image_size_label}
            </span>
            <div className="flex flex-wrap gap-2">
                {PRO_IMAGE_SIZES.map((size) => {
                    const isActive = size === value;
                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => onChange(size)}
                            className={`rounded-full border px-3 py-1.5 text-xs tracking-[0.2em] uppercase transition-all duration-300 ${isActive
                                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"
                                }`}
                        >
                            {size}
                        </button>
                    );
                })}
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] text-lux-muted/70 leading-relaxed">
                    {t.pro_image_size_hint_time}
                </p>
                <p className="text-[10px] text-lux-muted/70 leading-relaxed">
                    {t.pro_image_size_hint_credits}
                </p>
            </div>
        </div>
    );
}