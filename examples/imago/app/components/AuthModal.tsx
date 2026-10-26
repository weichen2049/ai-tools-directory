"use client";

import { UI_TEXT } from "@lib/i18n";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type AuthModalProps = {
  open: boolean;
  mode: "signin" | "signup" | "reset";
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
  submitting: boolean;
  message: string | null;
  error: string | null;
  t: typeof UI_TEXT["zh"];
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onResetSubmit: (event: FormEvent) => void;
  onModeToggle: () => void;
  onForgotPassword: () => void;
  onBackToSignin: () => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onAgreementChange: (value: boolean) => void;
  onGoogleSignIn: () => Promise<void>;
};

export function AuthModal({
  open,
  mode,
  email,
  password,
  confirmPassword,
  agreed,
  submitting,
  message,
  error,
  t,
  onClose,
  onSubmit,
  onResetSubmit,
  onModeToggle,
  onForgotPassword,
  onBackToSignin,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onAgreementChange,
  onGoogleSignIn
}: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  if (mode === "reset") {
    return createPortal(
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-lux-bg/95 p-6 text-[12px] shadow-2xl space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-xs tracking-[0.2em] text-lux-muted hover:text-white"
            aria-label={t.close}
          >
            ✕
          </button>
          <h2 className="text-sm font-medium tracking-wide text-center mb-2">{t.auth_reset_password}</h2>
          <form className="space-y-3" onSubmit={onResetSubmit}>
            <InputBlock
              label={t.auth_email_label}
              type="email"
              value={email}
              placeholder={t.auth_email_placeholder}
              onChange={onEmailChange}
            />
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
          <button
            onClick={onBackToSignin}
            className="w-full text-[11px] tracking-[0.2em] text-lux-muted hover:text-white transition"
          >
            {t.auth_back_to_signin}
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      
      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-lux-bg/95 p-6 text-[12px] shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xs tracking-[0.2em] text-lux-muted hover:text-white"
          aria-label={t.close}
        >
          ✕
        </button>
        <form className="space-y-3" onSubmit={onSubmit}>
          <InputBlock
            label={t.auth_email_label}
            type="email"
            value={email}
            placeholder={t.auth_email_placeholder}
            onChange={onEmailChange}
          />
          <InputBlock
            label={t.auth_password_label}
            type="password"
            value={password}
            placeholder={t.auth_password_placeholder}
            onChange={onPasswordChange}
          />
          {mode === "signin" && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] tracking-[0.1em] text-lux-muted hover:text-white transition"
            >
              {t.auth_forgot_password}
            </button>
          )}
          {mode === "signup" && (
            <InputBlock
              label={t.auth_password_confirm_label}
              type="password"
              value={confirmPassword}
              placeholder={t.auth_password_confirm_placeholder}
              onChange={onConfirmPasswordChange}
            />
          )}
          {mode === "signup" && (
            <label className="flex items-start gap-3 text-[11px] text-lux-muted leading-relaxed">
              <span className="relative flex h-4 w-4 items-center justify-center">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => onAgreementChange(event.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-4 w-4 rounded-sm border border-white/30 bg-transparent transition-all duration-200 peer-checked:border-white peer-checked:bg-white/90" />
                <svg
                  viewBox="0 0 16 16"
                  className="pointer-events-none absolute h-3 w-3 text-lux-bg opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l3 3 7-7" />
                </svg>
              </span>
              <span>
                {t.auth_consent_label}{" "}
                <a href="/terms" target="_blank" rel="noreferrer" className="text-white underline underline-offset-4">
                  {t.auth_terms_link}
                </a>{" "}
                {t.auth_consent_and}{" "}
                <a href="/privacy" target="_blank" rel="noreferrer" className="text-white underline underline-offset-4">
                  {t.auth_privacy_link}
                </a>
              </span>
            </label>
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          {message && <p className="text-xs text-emerald-300">{message}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-white/40 py-2 text-[11px] uppercase tracking-[0.25em] hover:border-white transition disabled:opacity-60 rounded-lux"
          >
            {mode === "signin" ? t.auth_email_sign_in : t.auth_email_sign_up}
          </button>
        </form>
        <div className="space-y-2">
          <button
            onClick={onGoogleSignIn}
            className="w-full border border-white/20 py-2 text-[11px] uppercase tracking-[0.2em] text-lux-muted hover:text-white hover:border-white/50 transition rounded-lux"
          >
            {t.auth_google_action}
          </button>
          <button
            onClick={onModeToggle}
            className="w-full text-[11px] tracking-[0.2em] text-lux-muted hover:text-white transition"
          >
            {mode === "signin" ? t.auth_toggle_to_sign_up : t.auth_toggle_to_sign_in}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

type InputBlockProps = {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function InputBlock({ label, type, value, placeholder, onChange }: InputBlockProps) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] tracking-[0.2em] text-lux-muted uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-lux-line bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-lux-accent rounded-lux"
        required
      />
    </div>
  );
}