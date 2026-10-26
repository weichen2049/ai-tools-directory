"use client";

import { STYLE_PRESETS_LIST, type PresetId } from "@lib/presets";
import { useLanguage } from "../providers/LanguageProvider";

type Props = {
    selectedPreset: PresetId | null;
    onSelect: (presetId: PresetId) => void;
    gender?: "female" | "male" | "agender" | null;
    mode?: "cinematic" | "compact";
};

export function StylePresetPicker({ selectedPreset, onSelect, gender = "female", mode = "compact" }: Props) {
    const { lang } = useLanguage();
    const currentGender = gender || "female";
    const isCinematic = mode === "cinematic";

    return (
        <div
            className={`
                relative w-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                ${isCinematic
                    ? "flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory md:block md:pb-[154%]"
                    : "pb-[32%]"
                }
            `}
            style={isCinematic ? undefined : { paddingBottom: '32%' }}
        >
            {STYLE_PRESETS_LIST.map((preset, index) => {
                const isSelected = selectedPreset === preset.id;
                const imageConfig = preset.images[currentGender];

                const top = isCinematic ? `${index * 34}%` : '0%';
                const left = isCinematic ? '0%' : `${index * 34}%`;
                const width = isCinematic ? '100%' : '32%';
                const height = isCinematic ? '32%' : '100%';

                const styleVars = {
                    '--d-top': top,
                    '--d-left': left,
                    '--d-width': width,
                    '--d-height': height,
                } as React.CSSProperties;

                return (
                    <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelect(preset.id)}
                        style={styleVars}
                        className={`
                            ${isCinematic
                                ? "relative w-[85%] aspect-[16/9] flex-shrink-0 snap-center md:absolute md:w-[var(--d-width)] md:h-[var(--d-height)] md:top-[var(--d-top)] md:left-[var(--d-left)]"
                                : "absolute w-[var(--d-width)] h-[var(--d-height)] top-[var(--d-top)] left-[var(--d-left)]"
                            }
                            group flex flex-col items-center 
                            rounded-sm overflow-hidden 
                            transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                            focus:outline-none
                            ${isSelected
                                ? "ring-2 ring-white shadow-[0_0_20px_rgba(255,255,255,0.3)] z-10"
                                : "ring-1 ring-white/10 hover:ring-white/40 hover:z-10"
                            }
                        `}
                    >
                        
                        <div className="relative w-full h-full overflow-hidden">
                            <img
                                src={imageConfig.src}
                                alt={preset.labelEn}
                                className={`
                                    w-full h-full object-cover 
                                    transition-[transform,filter] duration-1000 ease-out
                                    ${isSelected
                                        ? "scale-105 brightness-110"
                                        : "scale-100 brightness-[0.6] group-hover:brightness-[0.8] group-hover:scale-105"
                                    }
                                `}
                                style={{ objectPosition: isCinematic ? imageConfig.position : undefined }}
                            />
                            
                            <div className={`
                                absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent
                                transition-opacity duration-300
                                ${isSelected ? "opacity-50" : "opacity-80"}
                            `} />

                            
                            <div className={`
                                absolute top-2 right-2 flex items-center justify-center 
                                w-5 h-5 rounded-full bg-white text-black
                                transition-all duration-300 transform
                                ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"}
                            `}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        
                        <div className={`
                            absolute bottom-0 left-0 right-0 
                            flex items-end justify-center
                            transition-[padding] duration-700
                            ${isCinematic ? "p-4" : "py-2 px-1"}
                        `}>
                            <span className={`
                                uppercase font-medium tracking-[0.2em]
                                transition-all duration-700
                                ${isSelected ? "text-white drop-shadow-md" : "text-white/60 group-hover:text-white/90"}
                                ${isCinematic ? "text-lg tracking-[0.3em]" : "text-xs"}
                            `}>
                                {lang === "zh" ? preset.labelZh : preset.labelEn}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}