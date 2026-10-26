"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_KEYS } from "@lib/publicEnv";

type Language = "zh" | "en";

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const STORAGE_KEY = STORAGE_KEYS.language;
const COOKIE_NAME = STORAGE_KEYS.language;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setLangCookie(value: Language) {
    if (typeof document === "undefined") return;
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function LanguageProvider({ children, initialLang = "zh" }: { children: React.ReactNode; initialLang?: Language }) {
    const [lang, setLangState] = useState<Language>(initialLang);
    useEffect(() => {
        const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
        if (savedLang && (savedLang === "zh" || savedLang === "en")) {
            setLangState(savedLang);
            setLangCookie(savedLang);
            return;
        }

        const candidates = (navigator.languages ?? [navigator.language]).map((l) => l?.toLowerCase?.() || "");
        const browserLang = candidates.some((l) => l.startsWith("zh")) ? "zh" : "en";
        setLangState(browserLang);
        localStorage.setItem(STORAGE_KEY, browserLang);
        setLangCookie(browserLang);
    }, []);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        localStorage.setItem(STORAGE_KEY, newLang);
        setLangCookie(newLang);
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}