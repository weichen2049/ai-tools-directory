"use client";

import Link from "next/link";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";
import { PUBLIC_CONFIG } from "@lib/publicEnv";

export default function ContactContent() {
    const { lang, setLang } = useLanguage();
    const t = UI_TEXT[lang];
    const contactEmail = PUBLIC_CONFIG.contactEmail;

    return (
        <div className="min-h-screen bg-lux-bg text-lux-text p-8 md:p-12 lg:p-16 relative overflow-hidden flex flex-col">
            
            <div className="lux-noise-layer fixed inset-0 z-0" />
            <div className="lux-ambient-light" />

            <div className="relative z-10 w-full max-w-6xl mx-auto flex-grow flex flex-col">
                <header className="mb-12 md:mb-20">
                    <div className="flex justify-between items-start mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-xs font-medium tracking-[0.2em] uppercase text-lux-muted hover:text-lux-text transition-colors duration-300"
                        >
                            {t.back_home}
                        </Link>

                        <div className="flex gap-4 text-xs font-medium tracking-[0.2em]">
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
                    </div>

                    <h1 className="text-3xl md:text-5xl font-serif tracking-wider mb-4">{t.contact_us}</h1>
                    <p className="text-lux-muted text-sm tracking-wide max-w-xl">
                        {t.contact_desc}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-16 lg:gap-20">
                    <section className="space-y-12">
                        <div className="space-y-2">
                            <p className="text-xs text-lux-muted tracking-widest uppercase">{t.email}</p>
                            <a href={`mailto:${contactEmail}`} className="block text-lg font-serif tracking-wide hover:text-lux-text/80 transition-colors">
                                {contactEmail}
                            </a>
                        </div>

                        
                    </section>
                </div>
            </div>
        </div>
    );
}