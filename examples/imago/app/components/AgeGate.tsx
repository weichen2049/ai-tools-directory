"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../providers/LanguageProvider";
import Link from "next/link";
import { UI_TEXT } from "@lib/i18n";
import { STORAGE_KEYS, PUBLIC_CONFIG } from "@lib/publicEnv";

const STORAGE_KEY = STORAGE_KEYS.ageVerified;
const AGE_GATE_ENABLED = PUBLIC_CONFIG.ageGateEnabled;
const LOGO_PATH = PUBLIC_CONFIG.logoPath;

const CONTENT = {
    en: {
        title: "RESTRICTED ACCESS",
        subtitle: "Age Verification Required",
        description: "This website contains AI-generated adult content, including nudity, sexual themes, and other explicit material.",
        confirmItems: [
            "I am at least 18 years old or the age of majority in my jurisdiction, whichever is greater",
            "Accessing adult content is legal in my location",
            "I consent to viewing explicit content",
            "I accept full responsibility for any false declaration"
        ],
        enterButton: "I CONFIRM / ENTER",
        exitButton: "EXIT",
        termsNotice: "By entering, you agree to our",
        termsLink: "Terms of Service",
        privacyLink: "Privacy Policy",
        and: "and"
    },
    zh: {
        title: "访问限制",
        subtitle: "需验证年龄",
        description: "本网站包含 AI 生成的成人内容，包括裸露、性暗示及其他限制级素材。",
        confirmItems: [
            "我已年满 18 岁或达到所在地区法定成年年龄（以较大者为准）",
            "在我所在地区访问成人内容是合法的",
            "我同意浏览限制级内容",
            "我对任何虚假声明承担全部法律责任"
        ],
        enterButton: "我确认 / 进入",
        exitButton: "离开",
        termsNotice: "进入即表示您同意我们的",
        termsLink: "服务条款",
        privacyLink: "隐私政策",
        and: "和"
    }
};

export function AgeGate() {
    const { lang } = useLanguage();
    const t = CONTENT[lang];
    const ui = UI_TEXT[lang];

    const [showGate, setShowGate] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!AGE_GATE_ENABLED) return;
        const verified = localStorage.getItem(STORAGE_KEY);
        if (!verified) {
            setShowGate(true);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleEnter = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsExiting(true);
        setTimeout(() => {
            setShowGate(false);
            document.body.style.overflow = "";
        }, 800);
    };

    const handleExit = () => {
        window.location.href = "https://www.google.com";
    };

    if (!mounted || !showGate) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-start md:items-center justify-center overflow-y-auto py-8 md:py-0 bg-[#050505] transition-all duration-1000 ${isExiting ? "opacity-0 pointer-events-none scale-105 blur-sm" : "opacity-100 scale-100 blur-0"
                }`}
        >
            
            <div className="lux-noise-layer fixed inset-0 opacity-[0.15]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a1a1a]/20 to-black/80" />

            
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[4000ms]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[5000ms]" />

            
            <div className={`relative z-10 w-full max-w-lg mx-6 p-8 md:p-12 transition-all duration-1000 transform ${isExiting ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
                }`}>

                
                <div className="absolute inset-0 border border-white/10 rounded-sm pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-lux-gold/50 to-transparent" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-lux-gold/50 to-transparent" />

                    
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-lux-gold/30" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-lux-gold/30" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-lux-gold/30" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-lux-gold/30" />
                </div>

                <div className="relative flex flex-col items-center">
                    
                    <div className="mb-12 opacity-90">
                        <img src={LOGO_PATH} alt="" className="w-10 h-10 mx-auto opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
                    </div>

                    
                    <div className="mb-12 relative group cursor-default">
                        
                        <div className="absolute inset-0 bg-[#E83F5B] blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                        <div className="relative border-[2px] border-[#E83F5B] rounded-lg px-4 py-1.5 shadow-[0_0_10px_rgba(232,63,91,0.5),inset_0_0_8px_rgba(232,63,91,0.3)] bg-black/40 backdrop-blur-sm group-hover:shadow-[0_0_20px_rgba(232,63,91,0.8),inset_0_0_15px_rgba(232,63,91,0.5)] transition-all duration-500">
                            <span className="text-[#E83F5B] font-sans text-3xl font-normal tracking-wider drop-shadow-[0_0_8px_rgba(232,63,91,0.8)]">
                                18+
                            </span>
                        </div>
                    </div>

                    
                    <div className="text-center space-y-8 mb-12 w-full">
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-serif text-lux-text tracking-[0.2em] uppercase text-shadow-sm">
                                {t.title}
                            </h2>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-lux-muted/60">
                                {t.subtitle}
                            </p>
                        </div>

                        <div className="relative py-6 space-y-6">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-[#E83F5B]/30" />

                            <p className="font-light text-lux-text/90 text-base leading-relaxed tracking-wide max-w-md mx-auto">
                                {t.description}
                            </p>

                            
                            <ul className="text-left max-w-sm mx-auto space-y-3">
                                {t.confirmItems.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm text-lux-text/60 leading-relaxed">
                                        <svg className="flex-shrink-0 w-3.5 h-3.5 mt-1 text-lux-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-[#E83F5B]/30" />
                        </div>
                    </div>

                    
                    <div className="w-full space-y-5 max-w-xs">
                        <button
                            onClick={handleEnter}
                            className="w-full py-4 relative group overflow-hidden transition-all duration-500"
                        >
                            <div className="absolute inset-0 border border-lux-text/30 group-hover:border-lux-text/60 transition-colors duration-500" />
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
                            <span className="relative text-xs tracking-[0.3em] font-medium text-lux-text group-hover:tracking-[0.4em] transition-all duration-500 uppercase">
                                {t.enterButton}
                            </span>
                        </button>

                        <div className="flex justify-center">
                            <button
                                onClick={handleExit}
                                className="text-[10px] text-lux-muted/40 hover:text-lux-text/60 transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-lux-muted/30 pb-1"
                            >
                                {t.exitButton}
                            </button>
                        </div>
                    </div>

                    
                    <div className="mt-12 text-center opacity-50 hover:opacity-100 transition-opacity duration-500">
                        <p className="text-[10px] text-lux-muted tracking-wider">
                            {t.termsNotice}{" "}
                            <Link href="/terms" className="border-b border-white/30 hover:border-white/60 transition-all">
                                {t.termsLink}
                            </Link>
                            {" "}{t.and}{" "}
                            <Link href="/privacy" className="border-b border-white/30 hover:border-white/60 transition-all">
                                {t.privacyLink}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}