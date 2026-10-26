"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";
import { completePasswordReset } from "@lib/auth/resetFlow";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [linkValid, setLinkValid] = useState<boolean | null>(null);
    const router = useRouter();
    const { lang } = useLanguage();
    const t = UI_TEXT[lang];
    const supabase = createClient();

    useEffect(() => {
        if (!supabase) {
            setLinkValid(false);
            return;
        }
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setLinkValid(Boolean(session));
            } catch {
                setLinkValid(false);
            }
        };
        checkSession();
    }, [supabase, router]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!password) return;
        if (password !== confirmPassword) {
            setError(t.auth_error_password_mismatch);
            return;
        }
        if (password.length < 6) {
            setError(lang === "zh" ? "密码至少需要 6 位字符" : "Password must be at least 6 characters");
            return;
        }

        setSubmitting(true);
        setError(null);
        setMessage(null);

        if (!supabase) {
            setError(lang === "zh" ? "服务未配置" : "Service not configured");
            setSubmitting(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
                setError(updateError.message || t.auth_error_generic);
            } else {
                setMessage(t.auth_reset_success);
                void completePasswordReset({ supabase, router, redirectPath: "/?auth=signin" });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (linkValid === null) {
        return (
            <div className="min-h-screen bg-lux-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-lux-bg/95 p-6 text-[12px] shadow-2xl space-y-4">
                    <h1 className="text-lg font-medium tracking-wide text-center text-lux-text">
                        {t.auth_reset_password}
                    </h1>
                    <p className="text-xs text-lux-muted text-center">{t.auth_syncing}</p>
                </div>
            </div>
        );
    }

    if (!linkValid) {
        return (
            <div className="min-h-screen bg-lux-bg flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-lux-bg/95 p-6 text-[12px] shadow-2xl space-y-4 text-center">
                    <h1 className="text-lg font-medium tracking-wide text-lux-text">
                        {t.auth_reset_password}
                    </h1>
                    <p className="text-xs text-red-400">{t.auth_reset_link_invalid}</p>
                    <button
                        type="button"
                        onClick={() => router.push("/?auth=signin")}
                        className="w-full border border-white/40 py-2 text-[11px] uppercase tracking-[0.25em] hover:border-white transition rounded-lux"
                    >
                        {t.auth_back_to_signin}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lux-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-[32px] border border-white/20 bg-lux-bg/95 p-6 text-[12px] shadow-2xl space-y-4">
                <h1 className="text-lg font-medium tracking-wide text-center text-lux-text mb-4">
                    {t.auth_reset_password}
                </h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="text-[10px] tracking-[0.2em] text-lux-muted uppercase">
                            {t.auth_new_password_label}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.auth_password_placeholder}
                            className="w-full border border-lux-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lux-accent rounded-lux"
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] tracking-[0.2em] text-lux-muted uppercase">
                            {t.auth_password_confirm_label}
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t.auth_password_confirm_placeholder}
                            className="w-full border border-lux-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lux-accent rounded-lux"
                            required
                            minLength={6}
                        />
                    </div>
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    {message && <p className="text-xs text-emerald-300">{message}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full border border-white/40 py-2 text-[11px] uppercase tracking-[0.25em] hover:border-white transition disabled:opacity-60 rounded-lux"
                    >
                        {t.auth_reset_password}
                    </button>
                </form>
            </div>
        </div>
    );
}