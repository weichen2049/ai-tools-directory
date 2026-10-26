"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "../providers/SupabaseProvider";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";
import { useUsageSummary } from "../hooks/useUsageSummary";
import { AuthModal } from "./AuthModal";
import { AccountDropdown } from "./AccountDropdown";
import { RechargeModal } from "./RechargeModal";
import { subscribeOpenRechargeModal } from "@lib/rechargeEvents";

export function AuthControls() {
  const { supabase, user, loading, signInWithGoogle, signOut } = useSupabase();
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const accountAnchorRef = useRef<HTMLDivElement | null>(null);
  const { summary, refresh, loading: usageLoading } = useUsageSummary();

  useEffect(() => {
    if (user) {
      setPanelOpen(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setMessage(null);
      setError(null);
      setAccountOpen(false);
      setAgreed(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "signin") return;
    setPanelOpen(true);
    setMode("signin");
    setMessage(null);
    setError(null);
    params.delete("auth");
    const nextSearch = params.toString();
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [user]);

  useEffect(() => {
    if (accountOpen) {
      refresh();
    }
  }, [accountOpen, refresh]);

  useEffect(() => {
    const unsubscribe = subscribeOpenRechargeModal(() => {
      setAccountOpen(false);
      if (!user) {
        setMode("signin");
        setPanelOpen(true);
        return;
      }
      setRechargeOpen(true);
    });
    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <div className="text-[10px] sm:text-xs tracking-[0.2em] text-lux-muted">
        {t.auth_syncing}
      </div>
    );
  }

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;
    if (mode === "signup" && password !== confirmPassword) {
      setError(t.auth_error_password_mismatch);
      return;
    }
    if (mode === "signup" && !agreed) {
      setError(t.auth_error_terms_required);
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
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          const message =
            signInError.message?.toLowerCase().includes("invalid login credentials")
              ? t.auth_error_invalid_credentials
              : signInError.message;
          setError(message || t.auth_error_generic);
        } else {
          setPanelOpen(false);
          setEmail("");
          setPassword("");
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              accepted_terms_at: new Date().toISOString(),
              accepted_terms_version: process.env.NEXT_PUBLIC_TERMS_VERSION ?? "2025-11-01"
            }
          }
        });
        if (signUpError) {
          setError(signUpError.message || t.auth_error_generic);
        } else {
          setMessage(t.auth_check_inbox);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    if (!supabase) {
      setError(lang === "zh" ? "服务未配置" : "Service not configured");
      setSubmitting(false);
      return;
    }
    try {
      const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
      const redirectOrigin = configuredOrigin ?? window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectOrigin}/auth/callback?next=/auth/reset-password`
      });
      if (resetError) {
        setError(resetError.message || t.auth_error_generic);
      } else {
        setMessage(t.auth_reset_email_sent);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalCredits = summary?.authenticated ? summary.credits.paid : null;

  return (
    <>
      {!user ? (
        <>
          <button
            onClick={() => setPanelOpen(true)}
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-lux-text border border-lux-text/40 px-3 py-1 hover:border-lux-text transition-colors"
          >
            {t.auth_sign_in}
          </button>
          <AuthModal
            open={panelOpen}
            mode={mode}
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            agreed={agreed}
            submitting={submitting}
            message={message}
            error={error}
            t={t}
            onClose={() => {
              setPanelOpen(false);
              setAgreed(false);
              setMode("signin");
            }}
            onSubmit={handleEmailSubmit}
            onResetSubmit={handleResetSubmit}
            onModeToggle={() => {
              setMode((prev) => (prev === "signin" ? "signup" : "signin"));
              setMessage(null);
              setError(null);
              setConfirmPassword("");
              setAgreed(false);
            }}
            onForgotPassword={() => {
              setMode("reset");
              setMessage(null);
              setError(null);
            }}
            onBackToSignin={() => {
              setMode("signin");
              setMessage(null);
              setError(null);
            }}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onAgreementChange={setAgreed}
            onGoogleSignIn={signInWithGoogle}
          />
        </>
      ) : (
        <div className="relative" ref={accountAnchorRef}>
          <button
            type="button"
            onClick={() => setAccountOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-lux-muted hover:text-white transition-colors border border-transparent hover:border-white/20 px-3 py-1 rounded-full"
            title={user.email ?? user.id}
          >
            
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="hidden sm:block max-w-[100px] md:max-w-none truncate">{user.email ?? user.id}</span>
            <span className="text-xs">{accountOpen ? "▴" : "▾"}</span>
          </button>
          <AccountDropdown
            open={accountOpen}
            onClose={() => setAccountOpen(false)}
            anchorRef={accountAnchorRef}
            totalCredits={totalCredits}
            summary={summary}
            lang={lang}
            onSignOut={signOut}
            t={t}
            onRecharge={() => {
              setAccountOpen(false);
              setRechargeOpen(true);
            }}
            onUsageRefresh={refresh}
            usageRefreshing={usageLoading}
          />
        </div>
      )}
      <RechargeModal
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        lang={lang}
        onUsageRefresh={refresh}
      />
    </>
  );
}