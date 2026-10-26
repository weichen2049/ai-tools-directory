"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CREDIT_PLANS, STRIPE_CURRENCY } from "@lib/creditPlans";
import { UI_TEXT } from "@lib/i18n";
import { emitUsageUpdate } from "@lib/usageEvents";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;
const TAB_ICON_CARD =
  "url(data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2016%27%20fill%3D%27none%27%20stroke%3D%27%2523f1d9ac%27%20stroke-width%3D%271.5%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Crect%20x%3D%271.5%27%20y%3D%272.5%27%20width%3D%2721%27%20height%3D%2711%27%20rx%3D%272%27/%3E%3Cline%20x1%3D%272%27%20y1%3D%276%27%20x2%3D%2722%27%20y2%3D%276%27/%3E%3C/svg%3E)";
const TAB_ICON_WECHAT =
  "url(data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2026%2020%27%20fill%3D%27none%27%20stroke%3D%27%2523f1d9ac%27%20stroke-width%3D%271.3%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%3E%3Cpath%20d%3D%27M6%2015c-2.5-1.2-4-3.3-4-5.5%200-3.3%203.4-6%207.5-6s7.5%202.7%207.5%206c0%20.5-.1%201-.2%201.5%27/%3E%3Cpath%20d%3D%27M8.5%2016.3c1%20.4%202.2.7%203.5.7%201%200%202-.2%202.9-.5l3.3%201.7-.7-3.1c1.7-1%202.8-2.6%202.8-4.4%200-3-3.1-5.5-7-5.5-.7%200-1.4.1-2%20.3%27/%3E%3Ccircle%20cx%3D%277.2%27%20cy%3D%279%27%20r%3D%27.6%27/%3E%3Ccircle%20cx%3D%2711.2%27%20cy%3D%279%27%20r%3D%27.6%27/%3E%3Ccircle%20cx%3D%2715.5%27%20cy%3D%2712%27%20r%3D%27.6%27/%3E%3Ccircle%20cx%3D%2719%27%20cy%3D%2712%27%20r%3D%27.6%27/%3E%3C/svg%3E)";

type RechargeModalProps = {
  open: boolean;
  lang: "zh" | "en";
  onClose: () => void;
  onUsageRefresh: () => void;
};

export function RechargeModal({ open, lang, onClose, onUsageRefresh }: RechargeModalProps) {
  const t = UI_TEXT[lang];
  const [selectedPlan, setSelectedPlan] = useState(CREDIT_PLANS[0]?.id ?? "");
  const [resolvedPlans, setResolvedPlans] = useState<
    { id: string; amount: number; currency: string; credits: number }[] | null
  >(null);
  const plan = useMemo(
    () => CREDIT_PLANS.find((item) => item.id === selectedPlan) ?? CREDIT_PLANS[0],
    [selectedPlan]
  );
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const refreshTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearRefreshTimers = useCallback(() => {
    if (refreshTimers.current.length) {
      refreshTimers.current.forEach(clearTimeout);
      refreshTimers.current = [];
    }
  }, []);

  const triggerUsageRefresh = useCallback(() => {
    clearRefreshTimers();
    onUsageRefresh();
    [2000, 5000, 9000].forEach((delay) => {
      const timer = setTimeout(() => {
        onUsageRefresh();
      }, delay);
      refreshTimers.current.push(timer);
    });
  }, [clearRefreshTimers, onUsageRefresh]);

  useEffect(() => {
    return () => {
      clearRefreshTimers();
    };
  }, [clearRefreshTimers]);

  useEffect(() => {
    if (!open) {
      clearRefreshTimers();
      setClientSecret(null);
      setSuccess(false);
      setError(null);
      return;
    }
    if (!plan) return;
    let cancelled = false;
    const createIntent = async () => {
      setLoadingIntent(true);
      setError(null);
      setClientSecret(null);
      try {
        const res = await fetch("/api/credits/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: plan.id })
        });
        if (!res.ok) {
          throw new Error("intent_failed");
        }
        const data = (await res.json()) as { clientSecret?: string };
        if (!cancelled) {
          setClientSecret(data.clientSecret ?? null);
        }
      } catch (err) {
        console.error("Failed to create payment intent", err);
        if (!cancelled) {
          setError(t.recharge_error_generic);
        }
      } finally {
        if (!cancelled) {
          setLoadingIntent(false);
        }
      }
    };
    void createIntent();
    return () => {
      cancelled = true;
    };
  }, [open, plan, t.recharge_error_generic, clearRefreshTimers]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/credits/plans", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          plans: { id: string; amount: number; currency: string; credits: number }[];
        };
        if (!cancelled) {
          setResolvedPlans(data.plans);
        }
      } catch {
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[6px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-[90dvh] overflow-y-auto space-y-5 rounded-[36px] border border-white/15 bg-[#0b0b0b]/95 p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.65)] no-scrollbar">
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 ml-auto block w-fit text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white z-20 bg-[#0b0b0b]/80 backdrop-blur px-2 py-1 rounded"
        >
          {t.close}
        </button>
        <div className="space-y-2 pr-10">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/80">{t.recharge_title}</p>
          <p className="text-sm text-white/70 leading-relaxed">{t.recharge_subtitle}</p>
        </div>

        
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 sm:overflow-visible no-scrollbar">
          {CREDIT_PLANS.map((item) => {
            const dynamic = resolvedPlans?.find((plan) => plan.id === item.id);
            const amountValue = dynamic?.amount ?? item.amount;
            const currencyValue = dynamic?.currency ?? STRIPE_CURRENCY;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPlan(item.id)}
                className={`min-w-[45%] flex-shrink-0 snap-start rounded-[28px] border px-4 py-4 text-left transition flex flex-col h-full ${selectedPlan === item.id
                  ? "border-[#c2a36d] bg-[#151410] shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
                  : "border-white/12 bg-[#0f0f0f] hover:border-white/25"
                  }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-[0.35em] ${selectedPlan === item.id ? "text-[#f1d9ac]" : "text-white/65"
                    }`}
                >
                  {item.name}
                </p>
                <p className="mt-1 text-2xl font-serif tracking-[0.2em] text-white">{item.credits}</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                  {t.recharge_plan_label}
                </p>
                <p className="mt-3 text-sm text-white/75 leading-relaxed flex-1">{item.description[lang]}</p>
                <p className="pt-4 text-sm font-medium text-white mt-auto">
                  {formatCurrency(amountValue, lang, currencyValue)}
                </p>
              </button>
            );
          })}
        </div>

        {!publishableKey || !stripePromise ? (
          <div className="rounded-2xl border border-rose-300/40 bg-rose-950/40 px-4 py-3 text-sm text-rose-100">
            {t.recharge_missing_key}
          </div>
        ) : success ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-900/20 px-4 py-6 text-center text-sm text-emerald-100">
            <p className="text-base font-serif tracking-[0.2em]">{t.recharge_success_title}</p>
            <p className="mt-2 text-white/80">{t.recharge_success_desc}</p>
            <button
              type="button"
              className="mt-4 rounded-full border border-white/30 px-4 py-2 text-[10px] uppercase tracking-[0.3em]"
              onClick={onClose}
            >
              {t.recharge_close}
            </button>
          </div>
        ) : (
          <div className="rounded-[28px] border border-white/12 bg-[#0f0f0f] p-4 shadow-inner">
            {loadingIntent || !clientSecret ? (
              <p className="text-center text-sm text-white/70">{t.recharge_loading}</p>
            ) : (
              <Elements
                options={{
                  clientSecret,
                  appearance: {
                    theme: "night",
                    variables: {
                      colorPrimary: "#cda96f",
                      colorText: "#fdf6ea",
                      colorTextSecondary: "#c8b8a3",
                      colorBackground: "#11100f",
                      colorDanger: "#ff7676",
                      fontFamily: "var(--font-serif, 'Cormorant Garamond'), 'DM Sans', sans-serif",
                      borderRadius: "16px",
                      spacingGridRow: "16px"
                    },
                    rules: {
                      ".AccordionItem": {
                        border: "1px solid rgba(255,255,255,0.12)",
                        backgroundColor: "#0f0f0f",
                        borderRadius: "12px",
                        color: "#fdf6ea",
                        padding: "16px",
                        marginBottom: "12px",
                        transition: "all 0.2s ease"
                      },
                      ".AccordionItem:hover": {
                        borderColor: "rgba(255,255,255,0.3)"
                      },
                      ".AccordionItem--selected": {
                        borderColor: "#c2a36d",
                        backgroundColor: "rgba(194, 163, 109, 0.12)", // Tinted dark background
                        boxShadow: "0 0 0 1px #c2a36d, 0 8px 30px rgba(194, 163, 109, 0.2)", // Stronger glow + fake borders
                        color: "#fdf6ea"
                      },
                      ".AccordionItem--selected:focus, .AccordionItem--selected:hover": {
                        color: "#fdf6ea",
                        backgroundColor: "rgba(194, 163, 109, 0.15)",
                      },

                      ".AccordionItemIcon": {
                        filter: "invert(81%) sepia(15%) saturate(836%) hue-rotate(352deg) brightness(89%) contrast(93%)"
                      },
                      ".AccordionItem--selected .AccordionItemIcon": {
                        filter: "invert(91%) sepia(10%) saturate(1500%) hue-rotate(350deg) brightness(105%) contrast(100%)"
                      },

                      ".AccordionItemLabel": {
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        fontWeight: "500"
                      },
                      ".AccordionItem--selected .AccordionItemLabel": {
                        color: "#c2a36d" // Gold text for the header label
                      },

                      ".Input": {
                        backgroundColor: "#0b0b0b",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fdf6ea",
                        padding: "16px",
                        marginTop: "8px"
                      },
                      ".Input--focused": {
                        borderColor: "#c2a36d",
                        boxShadow: "0 0 0 1px #c2a36d"
                      },
                      ".Label": {
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontSize: "11px",
                        marginBottom: "4px",
                        marginTop: "8px"
                      },
                      ".AccordionItem--selected .Label": {
                        color: "rgba(24, 18, 12, 0.7)" // Dark text on Gold BG
                      },

                      ".Block": {
                        marginBottom: "0px"
                      }
                    }
                  }
                }}
                stripe={stripePromise}
              >
                <CheckoutForm
                  amountLabel={formatCurrency(
                    resolvedPlans?.find((p) => p.id === plan.id)?.amount ?? plan.amount,
                    lang,
                    resolvedPlans?.find((p) => p.id === plan.id)?.currency
                  )}
                  lang={lang}
                  onError={setError}
                  onSuccess={() => {
                    setSuccess(true);
                    emitUsageUpdate();
                    triggerUsageRefresh();
                  }}
                  t={t}
                />
              </Elements>
            )}
            {error && <p className="mt-3 text-center text-sm text-rose-200">{error}</p>}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

type CheckoutFormProps = {
  amountLabel: string;
  lang: "zh" | "en";
  onError: (message: string | null) => void;
  onSuccess: () => void;
  t: typeof UI_TEXT["zh"];
};

function CheckoutForm({ amountLabel, onError, onSuccess, t }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    onError(null);
    const returnUrl =
      typeof window === "undefined" ? undefined : `${window.location.origin}/recharge/callback`;
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      ...(returnUrl ? { confirmParams: { return_url: returnUrl } } : {}),
      redirect: "if_required"
    });
    if (error) {
      const message = error.message || t.recharge_error_generic;
      onError(message);
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onSuccess();
    } else if (paymentIntent?.status === "processing" || paymentIntent?.status === "requires_action") {
      onError(t.recharge_pending_payment);
    } else {
      onError(t.recharge_cancelled_payment);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PaymentElement
        options={{
          layout: "accordion",
          business: { name: "Imago" },
          wallets: { applePay: "auto", googlePay: "auto" },
          paymentMethodOrder: ["card", "wechat_pay", "alipay"],
          defaultValues: {
            billingDetails: {
              name: "Imago User"
            }
          }
        }}
      />
      <p className="text-center text-[11px] text-white/50 leading-relaxed">
        {t.recharge_redirect_hint}
      </p>
      <button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-full bg-[#c7a874] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#18120c] transition hover:bg-[#d5b885] disabled:opacity-60"
      >
        {t.recharge_submit_label.replace("{0}", amountLabel)}
      </button>
    </form>
  );
}

function formatCurrency(amount: number, lang: "zh" | "en", currencyOverride?: string) {
  const currency = (currencyOverride || STRIPE_CURRENCY || "hkd").toUpperCase();
  const formatter = new Intl.NumberFormat(lang === "zh" ? "zh-HK" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  });
  return formatter.format(amount / 100);
}