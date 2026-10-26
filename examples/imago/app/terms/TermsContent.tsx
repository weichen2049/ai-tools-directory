"use client";

import Link from "next/link";
import { useLanguage } from "../providers/LanguageProvider";
import { PUBLIC_CONFIG } from "@lib/publicEnv";

type Section = {
    title: string;
    content: string;
    list?: string[];
};

type TermsDictionary = {
    en: {
        back: string;
        title: string;
        updated: string;
        sections: Section[];
        copyright: string;
    };
    zh: {
        back: string;
        title: string;
        updated: string;
        sections: Section[];
        copyright: string;
    };
};

export default function TermsContent() {
    const { lang, setLang } = useLanguage();
    const appName = PUBLIC_CONFIG.appName;
    const appNameUpper = appName.toUpperCase();
    const contactEmail = PUBLIC_CONFIG.contactEmail;

    const content: TermsDictionary = {
        en: {
            back: "← Back to Home",
            title: "Terms of Service",
            updated: "Last updated: January 2026 (added video generation & Flow Mode)",
            sections: [
                {
                    title: "1. Acceptance of Terms",
                    content: `By accessing and using ${appName} ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.`
                },
                {
                    title: "2. Description of Service",
                    content: `${appName} is an AI-powered creative platform that provides image generation (Fantasy Mode, Freeform Mode) and video generation (Flow Mode). We offer limited free quotas (e.g., guest trials, daily uses) and optional paid credits. We may adjust model availability, free limits, or pricing in response to infrastructure costs or policy changes.`
                },
                {
                    title: "3. Age Restriction & Content Warning",
                    content: `The Service is strictly intended for users who are 18 years of age or older (or the age of majority in your jurisdiction). By accessing ${appName}, you affirm that you meet this age requirement and consent to viewing AI-generated content, including images and videos, that may include nudity or mature themes (NSFW Content). If such content is prohibited where you live, you must refrain from using the Service.`
                },
                {
                    title: "4. Acceptable Use & Prohibited Content",
                    content: `You agree NOT to generate, upload, or share content that exploits minors (CSAM), depicts non-consensual sexual content or deepfakes of real individuals, contains realistic graphic violence or self-harm, or promotes illegal acts, terrorism, or hate speech. ${appName} maintains a zero-tolerance policy. Violations may result in suspension and the withholding of remaining credits; we will cooperate with relevant authorities when necessary.`
                },
                {
                    title: "5. User Generated Content & Liability",
                    content: `${appName} is provided “AS IS”. You are solely responsible for the prompts and outputs you create. The generation of content does not imply ${appName}’s endorsement. You agree to indemnify, defend, and hold ${appName} harmless from any claims arising from your violation of these Terms or your distribution of generated content.`
                },
                {
                    title: "6. Quotas, Credits, and Payments",
                    content: "Free quotas reset daily and cannot be hoarded, transferred, or re-sold. Guest usage is rate-limited by visitor fingerprint and IP to prevent abuse. Paid credits are sold through Stripe or approved processors, hold no monetary value outside the Service, and all sales are final due to GPU/server costs. Video generation (Flow Mode) requires paid credits only; there is no free tier for video. We may compensate downtime with bonus credits at our discretion but do not offer cash refunds."
                },
                {
                    title: "7. Intellectual Property",
                    content: `You retain ownership of the content you generate, subject to a non-exclusive license granted to ${appName} to host and display such content. All underlying technology and branding remain the property of ${appName}.`
                },
                {
                    title: "8. Limitation of Liability",
                    content: `${appName} shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service.`
                },
                {
                    title: "9. Reporting & Removal",
                    content: `If you believe your rights are being infringed or content violates these Terms, please contact us at ${contactEmail} with relevant details. We will review and respond to takedown notices in accordance with applicable law.`
                },
                {
                    title: "10. Data Retention",
                    content: "Generation history, prompts, and reference uploads may be retained for a limited period (e.g., 48 hours for free tiers) for moderation and support. Guest/IP quota logs are kept for up to 7 days. We may preserve information longer to comply with legal obligations."
                },
                {
                    title: "11. Local Compliance",
                    content: "You are responsible for ensuring the Service is legal in your jurisdiction. We may restrict or terminate access in regions where our offerings conflict with local regulations."
                }
            ],
            copyright: `© 2025 ${appNameUpper}. ALL RIGHTS RESERVED.`
        },
        zh: {
            back: "← 返回首页",
            title: "服务条款",
            updated: "最后更新：2026年1月（新增视频生成与 Flow Mode）",
            sections: [
                {
                    title: "1. 条款接受",
                    content: `访问和使用 ${appName}（'本服务'），即表示您同意受本条款约束。如不同意，请立即停止使用。`
                },
                {
                    title: "2. 服务描述",
                    content: `${appName} 是一个由 AI 驱动的创作平台，提供图像生成（Fantasy Mode、Freeform Mode）和视频生成（Flow Mode）功能。包含访客体验、每日免费次数以及付费积分。我们可根据算力和政策需要随时调整免费额度、模型或价格。`
                },
                {
                    title: "3. 年龄限制与内容提示",
                    content: "本服务仅面向年满 18 岁或已达到当地法定成年年龄的用户。继续使用即表示您符合该条件并同意接触可能包含裸露或成人主题的 AI 生成图像和视频；如所在地禁止该类内容，您须立即停止使用。"
                },
                {
                    title: "4. 可接受使用与禁止内容",
                    content: "严禁生成、上传或分享任何涉及未成年人（CSAM）、未经当事人许可的深度伪造（包括公众人物和私人人士）、逼真暴力/自残、煽动非法行为、恐怖主义或仇恨言论的内容。违反者可能被立即停用账号并扣留剩余额度，我们也会依法配合执法机关。"
                },
                {
                    title: "5. 用户生成内容责任",
                    content: `${appName} 以'原样'提供，您需对所输入的提示和生成的图片/视频自行负责。生成结果并不代表 ${appName} 的立场或背书。若因您分发或使用生成内容而引发索赔，您同意赔偿、为 ${appName} 辩护并使其免受损害。`
                },
                {
                    title: "6. 配额、积分与支付",
                    content: "每日免费次数会自动清零，不可囤积、转让或倒卖。访客体验会基于访客 ID 与 IP 进行限速防滥用。付费积分通过 Stripe 等支付渠道售卖，仅限在服务内消费且不具备现实货币价值。视频生成（Flow Mode）仅限付费积分使用，无免费额度。鉴于 GPU 成本，所有销量一经确认概不退款，如需补偿我们将视情况加发积分而非现金。"
                },
                {
                    title: "7. 知识产权",
                    content: `您保留所生成内容的所有权，但需授予 ${appName} 非独占许可，以托管、显示或执行内容审核。所有底层技术、品牌和算法仍归 ${appName} 所有。`
                },
                {
                    title: "8. 责任限制",
                    content: `在法律允许的最大范围内，${appName} 不对因使用本服务而导致的任何间接、附带、特殊或后果性损失负责。`
                },
                {
                    title: "9. 举报与移除",
                    content: `如您认为自身权益受到侵害，或发现内容违反本条款，请发送邮件至 ${contactEmail} 并附相关信息。我们会依据适用法律审查并处理。`
                },
                {
                    title: "10. 数据保留",
                    content: "为履行审核、技术支持或法规要求，生成记录（如免费模式 48 小时内的历史）与上传图像可能会被临时保存。访客与 IP 配额日志会保留最多 7 天。如需长期留存，将仅在法律义务下执行。"
                },
                {
                    title: "11. 地域合规",
                    content: "您须自行确保在所属地区使用本服务合法。如我们认定服务与当地法规冲突，可能限制或终止对该地区用户的提供。"
                }
            ],
            copyright: `© 2025 ${appNameUpper}. 保留所有权利。`
        }
    };

    const t = content[lang];

    return (
        <div className="min-h-screen bg-lux-bg text-lux-text p-8 md:p-12 lg:p-16 relative overflow-hidden">
            
            <div className="lux-noise-layer fixed inset-0 z-0" />
            <div className="lux-ambient-light" />

            <div className="relative z-10 max-w-3xl mx-auto">
                <header className="mb-12 md:mb-16">
                    <div className="flex justify-between items-start mb-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-xs font-medium tracking-[0.2em] uppercase text-lux-muted hover:text-lux-text transition-colors duration-300"
                        >
                            {t.back}
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

                    <h1 className="text-3xl md:text-4xl font-serif tracking-wider mb-4">{t.title}</h1>
                    <p className="text-lux-muted text-sm tracking-wide">{t.updated}</p>
                </header>

                <div className="space-y-12 text-sm leading-relaxed tracking-wide text-lux-text/90">
                    {t.sections.map((section, index) => (
                        <section key={index}>
                            <h2 className="text-lg font-medium uppercase tracking-[0.15em] mb-4 text-lux-text">{section.title}</h2>
                            <p className="text-lux-muted mb-4">
                                {section.content}
                            </p>
                            {section.list && (
                                <ul className="list-disc pl-5 space-y-2 text-lux-muted">
                                    {section.list.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </div>

                <footer className="mt-20 pt-8 border-t border-lux-text/10">
                    <p className="text-xs text-lux-muted tracking-widest">
                        {t.copyright}
                    </p>
                </footer>
            </div>
        </div>
    );
}