"use client";

import Link from "next/link";
import { useLanguage } from "../providers/LanguageProvider";
import { PUBLIC_CONFIG } from "@lib/publicEnv";

export default function PrivacyContent() {
    const { lang, setLang } = useLanguage();
    const appName = PUBLIC_CONFIG.appName;
    const appNameUpper = appName.toUpperCase();
    const contactEmail = PUBLIC_CONFIG.contactEmail;

    const content = {
        en: {
            back: "← Back to Home",
            title: "Privacy Policy",
            updated: "Last updated: January 2026 (added video generation coverage)",
            sections: [
                {
                    title: "1. Information We Collect",
                    content: "We record your prompts, parameter settings, generation outputs (images and videos), and limited guest/IP quota fingerprints to provide the Service, enforce abuse protections, and maintain your history. For payments, we rely on third-party processors (e.g., Stripe) and do not store full credit-card numbers; those providers operate under PCI-DSS standards."
                },
                {
                    title: "2. Use of Information",
                    content: "We use the information we collect to provide, maintain, and improve our services, including generating personalized content and analyzing usage patterns."
                },
                {
                    title: "3. Data Security",
                    content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction."
                },
                {
                    title: "4. Sharing of Information",
                    content: "We do not share your personal information with third parties except as described in this policy or with your consent, such as with service providers who assist our operations."
                },
                {
                    title: "5. Your Rights",
                    content: "You have the right to access, correct, or delete your personal information. You may also object to the processing of your data or request data portability."
                },
                {
                    title: "6. Visibility of Generated Content",
                    content: "Images and videos are private to your account by default unless you opt to share them. We may review prompts and outputs if they are flagged for Acceptable Use violations or if required to comply with lawful requests."
                },
                {
                    title: "7. Age & Sensitive Information",
                    content: "Our services target users 18+. We do not knowingly collect data from minors and will delete it if discovered. Please avoid uploading IDs, medical records, or other sensitive data unrelated to creative use."
                },
                {
                    title: "8. Uploaded & Generated Content",
                    content: "Images and videos you upload or generate may be temporarily stored to fulfill requests, detect abuse, and improve our systems. We may rely on vetted third-party storage or moderation vendors who are contractually obligated to protect your information."
                },
                {
                    title: "9. Retention & Deletion",
                    content: `Free-tier generation history is typically retained up to 48 hours, while guest/IP quota logs are cleared within approximately 7 days unless required for security investigations. We retain other data only as long as needed to provide the Service or comply with legal obligations. You can request deletion of your account or specific assets by contacting ${contactEmail}.`
                },
                {
                    title: "10. Security & Incident Response",
                    content: "We employ encryption, access controls, and monitoring to safeguard your information. If a breach affecting your data occurs, we will notify you and relevant authorities in accordance with applicable law."
                }
            ],
            copyright: `© 2025 ${appNameUpper}. ALL RIGHTS RESERVED.`
        },
        zh: {
            back: "← 返回首页",
            title: "隐私政策",
            updated: "最后更新：2026年1月（新增视频生成相关说明）",
            sections: [
                {
                    title: "1. 信息收集",
                    content: "我们会记录您在服务中的提示词、参数、生成结果（图像和视频），以及用于防滥用的访客 ID/IP 配额指纹，以便提供历史记录与配额管理。支付流程由第三方（如 Stripe）处理，我们不会保存完整的银行卡号；这些提供商遵循 PCI-DSS 标准。"
                },
                {
                    title: "2. 信息使用",
                    content: "我们使用收集的信息来提供、维护和改进我们的服务，包括生成个性化内容和分析使用模式。"
                },
                {
                    title: "3. 数据安全",
                    content: "我们采取合理的措施来帮助保护您的信息免受丢失、盗窃、滥用以及未经授权的访问、披露、更改和破坏。"
                },
                {
                    title: "4. 信息共享",
                    content: "除非本政策中描述或征得您的同意，否则我们不会与第三方共享您的个人信息，例如与协助我们运营的服务提供商共享。"
                },
                {
                    title: "5. 您的权利",
                    content: "您有权访问、更正或删除您的个人信息。您还可以反对处理您的数据或请求数据可移植性。"
                },
                {
                    title: "6. 生成内容可见性",
                    content: "默认情况下，您生成的图像和视频仅对您本人可见，除非您主动分享。若内容被举报或为履行法律义务，我们可能审核相关提示词与内容。"
                },
                {
                    title: "7. 年龄与敏感信息",
                    content: "本服务面向 18 岁以上用户，不会主动收集未成年人数据，如发现将立即删除。请勿上传与创作无关的敏感资料（如身份证件或医疗记录）。"
                },
                {
                    title: "8. 上传与生成内容",
                    content: "为满足请求、检测滥用或改进模型，您上传/生成的图像和视频可能会被临时存储。我们可能使用受合同约束的第三方存储或审核服务商。"
                },
                {
                    title: "9. 保留与删除",
                    content: `免费生成历史通常会在 48 小时内保留；访客/IP 配额日志会在约 7 天内清理，除非为调查滥用而保留更久。其他数据仅在提供服务或符合法律要求的期限内存储。可发送邮件至 ${contactEmail} 申请删除账号或特定内容。`
                },
                {
                    title: "10. 安全与事件响应",
                    content: "我们采用加密、访问控制、监控等措施保护您的信息。如发生影响您数据的安全事件，将依照法律要求通知您及相关监管机构。"
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