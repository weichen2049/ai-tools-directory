"use client";

import { useState, useCallback } from "react";
import { type Choices } from "@lib/schema";
import { BEACH_SCENE_FORBIDDEN_POSES, BODY_PART_CONTROL_VISIBILITY, type StyleMode } from "@lib/options";
import { STYLE_PRESETS_LIST, type PresetId } from "@lib/presets";
import { useHosieryControls } from "@lib/hooks/useHosieryControls";
import { useChoices } from "../hooks/useChoices"; // Type definition usage
import { useFilteredOptions } from "../hooks/useFilteredOptions";
import { useSlideAnimation } from "../hooks/useSlideAnimation";
import { Select } from "./Select";
import { AspectRatioSelector } from "./AspectRatioSelector";
import { StylingSection } from "./StylingSection";
import { HosierySection } from "./HosierySection";
import { MakeupSection } from "./MakeupSection";
import { BodyTypePresets } from "./BodyTypePresets";
import { UI_TEXT, getLocalizedOptions } from "@lib/i18n";
import { StylePresetPicker } from "./StylePresetPicker";

type FantasyControlsProps = {
    lang: "zh" | "en";
    choices: Choices;
    update: (field: keyof Choices, value: any) => void;
    updateStyle: (mode: StyleMode) => void;
    reroll: () => void;
    lowerBodyLocked: boolean;
    topIncludesBottom: boolean;
    bottomIncludesTop: boolean;
    isContinuingEdit: boolean;
};

export function FantasyControls({
    lang,
    choices,
    update,
    updateStyle,
    reroll,
    lowerBodyLocked,
    topIncludesBottom,
    bottomIncludesTop,
    isContinuingEdit
}: FantasyControlsProps) {
    const t = UI_TEXT[lang];
    const [selectedPreset, setSelectedPreset] = useState<PresetId | null>(null);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const isBodyCloseupMode = choices.style_mode === "body_part_closeup";
    const bodyPartControls = isBodyCloseupMode ? BODY_PART_CONTROL_VISIBILITY[choices.pose] : undefined;

    const allowHairSelection = !isBodyCloseupMode || Boolean(bodyPartControls?.hair);
    const allowTopSelection = !isBodyCloseupMode || Boolean(bodyPartControls?.top);
    const allowBottomSelection = !isBodyCloseupMode || Boolean(bodyPartControls?.bottom);
    const allowHosierySelection = !isBodyCloseupMode || Boolean(bodyPartControls?.hosiery);
    const allowFootwearSelection = !isBodyCloseupMode || Boolean(bodyPartControls?.footwear);
    const allowAccessorySelection = !isBodyCloseupMode || Boolean(bodyPartControls?.accessories);
    const allowMakeupSelection = !isBodyCloseupMode || Boolean(bodyPartControls?.makeup);

    const isBareLeg = choices.bare_leg ?? false;
    const isBareFace = choices.bare_makeup ?? false;

    const {
        hosieryTypeOptions,
        hosieryMaterialOptions,
        isWoolHosiery,
        isFishnetMaterial,
        isSilkType,
        handleMaterialChange,
        handleTypeChange
    } = useHosieryControls(choices, update, lang);

    const filteredOptions = useFilteredOptions(choices.style_mode, choices.gender, lang);

    const isAnimating = useSlideAnimation(isAdvancedOpen);
    const isHosieryAnimating = useSlideAnimation(isBareLeg);

    const handlePresetSelect = useCallback((presetId: PresetId) => {
        const preset = STYLE_PRESETS_LIST.find(p => p.id === presetId);
        if (preset) {
            setSelectedPreset(presetId);
            const currentGender = choices.gender || 'female';
            const presetChoices = preset.choices[currentGender];
            Object.entries(presetChoices).forEach(([key, value]) => {
                if (value !== undefined) {
                    update(key as keyof Choices, value as any);
                }
            });
        }
    }, [update, choices.gender]);


    const {
        pose: poseOptions,
        scene: sceneOptions,
        mood: moodOptions,
        hair: hairStyleOptions,
        top: topStyleOptionsRaw,
        bottom: bottomStyleOptionsRaw,
        footwear: footwearOptions,
        hairClip: hairClipOptions,
        earring: earringOptions,
        makeupStyle: makeupStyleOptions,
        makeupIntensity: makeupIntensityOptions,
        neckBodyAccessories: neckBodyAccessoriesOptions
    } = filteredOptions;

    const sideLieRestrictedScenes = new Set<Choices["scene_location"]>([
        "bathroom",
        "changing_room",
        "elevator_reflection",
        "gym"
    ]);
    const bedOnlyScenes = new Set<Choices["scene_location"]>(["dorm_room", "hotel_suite"]);
    const beachForbiddenSet = new Set<Choices["pose"]>([...BEACH_SCENE_FORBIDDEN_POSES] as Choices["pose"][]);

    const poseOptionsFiltered = poseOptions.filter((option) => {
        if (option.value === "mobile_side_lie" && sideLieRestrictedScenes.has(choices.scene_location)) {
            return false;
        }
        if (choices.scene_location === "beach_sunset" && beachForbiddenSet.has(option.value as Choices["pose"])) {
            return false;
        }
        if (option.value === "mobile_bed_prone" && !bedOnlyScenes.has(choices.scene_location)) {
            return false;
        }
        return true;
    });

    const BED_SCENES: Choices["scene_location"][] = ["dorm_room", "bedroom", "hotel_suite"];
    const sceneOptionsFiltered = choices.pose === "mobile_bed_prone"
        ? sceneOptions.filter((opt) => BED_SCENES.includes(opt.value as Choices["scene_location"]))
        : sceneOptions;

    const gender = choices.gender || "female";
    const topStyleOptions = topStyleOptionsRaw.filter((option) => {
        if (choices.bottom_style === "bath_towel" && option.value === "bath_towel" && gender === "male") {
            return false;
        }
        return true;
    });

    const bottomStyleOptions = bottomStyleOptionsRaw.filter((option) => {
        if ((gender === "female" || gender === "agender") && option.value === "bath_towel") {
            return false;
        }
        return true;
    });

    const stylingBodyPartNotes: string[] = [];
    if (isBodyCloseupMode) {
        const hidden: string[] = [];
        const partNames = {
            hair: lang === "zh" ? "发型" : "Hair",
            top: lang === "zh" ? "上衣" : "Top",
            bottom: lang === "zh" ? "下装" : "Bottom",
            footwear: lang === "zh" ? "鞋履" : "Footwear"
        };

        if (!allowHairSelection) hidden.push(partNames.hair);
        if (!allowTopSelection) hidden.push(partNames.top);
        if (!allowBottomSelection) hidden.push(partNames.bottom);
        if (!allowFootwearSelection) hidden.push(partNames.footwear);
        if (hidden.length > 0) {
            stylingBodyPartNotes.push(
                lang === "zh"
                    ? `局部特写不展示${hidden.join("、")}，相关选项已锁定。`
                    : `Close-up mode does not show ${hidden.join(", ")}; related options are locked.`
            );
        }
    }
    const hosieryBodyPartNote = isBodyCloseupMode && !allowHosierySelection
        ? (lang === "zh" ? "该局部特写画面不含腿部或脚部，丝袜配置会被忽略。" : "This close-up does not include legs or feet; hosiery settings will be ignored.")
        : undefined;
    const makeupBodyPartNotes = isBodyCloseupMode && (!allowMakeupSelection || !allowAccessorySelection)
        ? [lang === "zh" ? "局部特写不包含面部，妆容与配饰设置将被锁定。" : "Close-up does not include face; makeup and accessories are locked."]
        : [];

    return (
        <div className="flex flex-col gap-10 lg:h-full lg:overflow-y-auto custom-scrollbar pr-0 lg:pr-2">
            
            <div className="pb-6 border-b border-lux-line/50">
                <div className="flex gap-2">
                    {(["female", "male", "agender"] as const).map((g) => (
                        <button
                            key={g}
                            onClick={() => {
                                update("gender", g);
                                setSelectedPreset(null); // Clear preset when gender changes
                            }}
                            className={`flex-1 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-300 border ${choices.gender === g
                                ? "bg-lux-text text-lux-bg border-lux-text"
                                : "border-lux-line text-lux-muted hover:text-lux-text hover:border-lux-text/50"
                                }`}
                        >
                            {getLocalizedOptions("gender", lang).find(opt => opt.value === g)?.label}
                        </button>
                    ))}
                </div>
            </div>

            
            <div
                className="grid transition-[grid-template-rows] duration-500 ease-out"
                style={{ gridTemplateRows: isAdvancedOpen ? '0fr' : '1fr' }}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="space-y-4 pb-2">
                        <h3 className="text-sm font-medium text-lux-muted tracking-[0.15em] uppercase">
                            {lang === "zh" ? "快速风格" : "Quick Style"}
                        </h3>
                        <StylePresetPicker
                            selectedPreset={selectedPreset}
                            onSelect={handlePresetSelect}
                            gender={choices.gender}
                            mode="cinematic"
                        />
                    </div>
                </div>
            </div>

            
            <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-lux-line/50 text-lux-muted hover:text-lux-text hover:border-lux-line transition-all duration-300"
            >
                <span className="text-xs tracking-[0.2em] uppercase">
                    {isAdvancedOpen
                        ? (lang === "zh" ? "收起自定义选项" : "Hide Options")
                        : (lang === "zh" ? "更多自定义选项" : "More Options")
                    }
                </span>
                <svg
                    className={`w-3 h-3 transition-transform duration-300 ${isAdvancedOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            
            <div
                className={`grid transition-[grid-template-rows] duration-500 ease-out 
          ${isAdvancedOpen ? "opacity-100" : "opacity-0"} 
          ${isAdvancedOpen && !isAnimating ? "overflow-visible" : "overflow-hidden"}`}
                style={{ gridTemplateRows: isAdvancedOpen ? '1fr' : '0fr' }}
            >
                <div className="min-h-0">

                    <div className="space-y-8 py-4">
                        <div className="flex items-center justify-between border-b border-lux-line pb-2">
                            <h3 className="text-base font-semibold text-lux-text tracking-[0.08em]">
                                {t.basic_settings}
                            </h3>
                            <button
                                type="button"
                                onClick={reroll}
                                className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/80 hover:text-white hover:border-white/40 transition-colors"
                            >
                                <span>{t.reroll_choices}</span>
                                <span aria-hidden="true" className="text-xs">↺</span>
                            </button>
                        </div>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                            <Select
                                label={t.style_preset}
                                value={choices.style_mode}
                                onChange={(value) => updateStyle(value as StyleMode)}
                                items={getLocalizedOptions("style_mode", lang)}
                            />
                            <Select
                                label={isBodyCloseupMode ? t.body_part : t.pose_camera}
                                value={choices.pose}
                                onChange={(value) => update("pose", value as Choices["pose"])}
                                items={poseOptionsFiltered}
                            />
                        </div>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                            <Select
                                label={t.scene}
                                value={choices.scene_location}
                                onChange={(value) => update("scene_location", value as Choices["scene_location"])}
                                items={sceneOptionsFiltered}
                                disabled={isBodyCloseupMode}
                            />
                            <Select
                                label={t.expression_mood}
                                value={choices.mood}
                                onChange={(value) => update("mood", value as Choices["mood"])}
                                items={moodOptions}
                                disabled={isBodyCloseupMode || choices.style_mode === "rough_street_snap"}
                            />
                        </div>
                        {isBodyCloseupMode && (
                            <p className="text-[10px] text-lux-muted -mt-2 tracking-wide">
                                {t.closeup_note}
                            </p>
                        )}
                        {choices.style_mode === "mobile_front" && (
                            <p className="text-[10px] text-lux-muted -mt-2 tracking-wide">
                                {t.selfie_note}
                            </p>
                        )}
                        {choices.style_mode === "rough_street_snap" && (
                            <p className="text-[10px] text-lux-muted -mt-2 tracking-wide">
                                {t.rough_street_snap_note}
                            </p>
                        )}

                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                            <Select
                                label={t.ethnicity_label}
                                value={choices.ethnicity || "east_asian"}
                                onChange={(value) => update("ethnicity", value as Choices["ethnicity"])}
                                items={getLocalizedOptions("ethnicity", lang)}
                                disabled={isContinuingEdit}
                            />
                            {isContinuingEdit && (
                                <p className="col-span-2 text-xs text-neutral-500">
                                    {t.reference_locked_note}
                                </p>
                            )}
                        </div>
                        <BodyTypePresets
                            gender={choices.gender || "female"}
                            currentValue={choices.body_type || "healthy"}
                            onSelect={(value) => update("body_type", value as Choices["body_type"])}
                            disabled={isContinuingEdit}
                        />
                        <AspectRatioSelector
                            value={choices.aspect_ratio}
                            onChange={(value) => update("aspect_ratio", value as Choices["aspect_ratio"])}
                        />
                    </div>

                    <div className="space-y-6 pt-2">
                        <h3 className="text-base font-semibold text-lux-text tracking-[0.08em] border-b border-lux-line pb-2">{t.styling}</h3>
                        <StylingSection
                            hairStyle={choices.hair_style}
                            hairColor={choices.hair_color}
                            topStyle={choices.top_style}
                            bottomStyle={choices.bottom_style}
                            footwearStyle={choices.footwear_style}
                            onHairStyleChange={(value) => update("hair_style", value)}
                            onHairColorChange={(value) => update("hair_color", value)}
                            onTopStyleChange={(value) => update("top_style", value)}
                            onBottomStyleChange={(value) => update("bottom_style", value)}
                            onFootwearStyleChange={(value) => update("footwear_style", value)}
                            hairStyleOptions={hairStyleOptions}
                            hairColorOptions={getLocalizedOptions("hair_color", lang)}
                            topStyleOptions={topStyleOptions}
                            bottomStyleOptions={bottomStyleOptions}
                            footwearOptions={footwearOptions}
                            lowerBodyLocked={lowerBodyLocked}
                            topIncludesBottom={topIncludesBottom}
                            bottomIncludesTop={bottomIncludesTop}
                            styleMode={choices.style_mode}
                            disableHair={!allowHairSelection}
                            disableHairColor={!allowHairSelection}
                            disableTopStyle={!allowTopSelection}
                            disableBottomStyle={!allowBottomSelection}
                            disableFootwearStyle={!allowFootwearSelection}
                            bodyPartNotes={stylingBodyPartNotes}
                        />
                    </div>
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between border-b border-lux-line pb-2">
                            <h3 className="text-base font-semibold text-lux-text tracking-[0.08em]">{t.hosiery}</h3>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isBareLeg}
                                        onChange={(event) => update("bare_leg", event.target.checked)}
                                        disabled={lowerBodyLocked || !allowHosierySelection}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-8 h-4 rounded-full transition-all duration-300 ${lowerBodyLocked || !allowHosierySelection
                                        ? "border border-lux-line bg-lux-surface opacity-50"
                                        : isBareLeg
                                            ? "bg-lux-text"
                                            : "border border-lux-line bg-transparent group-hover:border-lux-text/50"
                                        }`}></div>
                                    <div className={`absolute top-1 left-1 w-2 h-2 rounded-full transition-all duration-300 ${lowerBodyLocked || !allowHosierySelection
                                        ? "bg-lux-muted"
                                        : isBareLeg
                                            ? "bg-lux-bg translate-x-4"
                                            : "bg-lux-muted group-hover:bg-lux-text"
                                        }`}></div>
                                </div>
                                <span
                                    className={
                                        lowerBodyLocked || !allowHosierySelection ? "text-lux-muted text-xs" : "text-lux-text text-xs tracking-wider"
                                    }
                                >
                                    {t.bare_leg}
                                </span>
                            </label>
                        </div>
                        <div
                            className={`grid transition-[grid-template-rows] duration-500 ease-out 
                ${!isBareLeg ? "opacity-100" : "opacity-0"}
                ${!isBareLeg && !isHosieryAnimating ? "overflow-visible" : "overflow-hidden"}`}
                            style={{ gridTemplateRows: !isBareLeg ? '1fr' : '0fr' }}
                        >
                            <div className="min-h-0 pt-1">
                                <HosierySection
                                    isBareLeg={isBareLeg}
                                    hosieryType={choices.hosiery_type}
                                    hosieryColor={choices.hosiery_color}
                                    hosieryMaterial={choices.hosiery_material}
                                    hosieryDenier={choices.hosiery_denier}
                                    onTypeChange={handleTypeChange}
                                    onColorChange={(value) => update("hosiery_color", value)}
                                    onMaterialChange={handleMaterialChange}
                                    onDenierChange={(value) => update("hosiery_denier", value)}
                                    hosieryTypeOptions={hosieryTypeOptions}
                                    hosieryMaterialOptions={hosieryMaterialOptions}
                                    hosieryColorOptions={getLocalizedOptions("hosiery_color", lang)}
                                    hosieryDenierOptions={getLocalizedOptions("hosiery_denier", lang)}
                                    lowerBodyLocked={lowerBodyLocked}
                                    disabledByBodyPart={!allowHosierySelection}
                                    isWoolHosiery={isWoolHosiery}
                                    isFishnetMaterial={isFishnetMaterial}
                                    isSilkType={isSilkType}
                                    bodyPartNote={hosieryBodyPartNote}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between border-b border-lux-line pb-2">
                            <h3 className="text-base font-semibold text-lux-text tracking-[0.08em]">{t.makeup_accessories}</h3>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={isBareFace}
                                        onChange={(event) => update("bare_makeup", event.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className={`w-8 h-4 rounded-full transition-all duration-300 ${isBareFace
                                        ? "bg-lux-text"
                                        : "border border-lux-line bg-transparent group-hover:border-lux-text/50"
                                        }`}></div>
                                    <div className={`absolute top-1 left-1 w-2 h-2 rounded-full transition-all duration-300 ${isBareFace
                                        ? "bg-lux-bg translate-x-4"
                                        : "bg-lux-muted group-hover:bg-lux-text"
                                        }`}></div>
                                </div>
                                <span className="text-lux-text text-xs tracking-wider">{t.bare_face}</span>
                            </label>
                        </div>
                        <div className="pt-1">
                            <MakeupSection
                                isBareFace={choices.bare_makeup}
                                makeupStyle={choices.makeup_style}
                                makeupIntensity={choices.makeup_intensity}
                                hairClip={choices.hair_clip}
                                earrings={choices.earrings}
                                neckBodyAccessories={choices.neck_body_accessories}
                                glassesStyle={choices.glasses_style}
                                onMakeupStyleChange={(value) => update("makeup_style", value)}
                                onMakeupIntensityChange={(value) => update("makeup_intensity", value)}
                                onHairClipChange={(value) => update("hair_clip", value)}
                                onEarringChange={(value) => update("earrings", value)}
                                onNeckBodyAccessoriesChange={(value) => update("neck_body_accessories", value)}
                                onGlassesStyleChange={(value) => update("glasses_style", value)}
                                makeupStyleOptions={makeupStyleOptions}
                                makeupIntensityOptions={makeupIntensityOptions}
                                hairClipOptions={hairClipOptions}
                                earringOptions={earringOptions}
                                neckBodyAccessoriesOptions={neckBodyAccessoriesOptions}
                                glassesOptions={getLocalizedOptions("glasses_style", lang)}
                                bodyPartNotes={makeupBodyPartNotes}
                                disableMakeup={!allowMakeupSelection}
                                disableAccessories={!allowAccessorySelection}
                            />
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}