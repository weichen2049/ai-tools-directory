import { useUsageSummary } from "../hooks/useUsageSummary";
import { useLanguage } from "../providers/LanguageProvider";
import { UI_TEXT } from "@lib/i18n";

function formatRemaining(limit: number, used: number) {
  const remaining = Math.max(limit - used, 0);
  return `${remaining}/${limit}`;
}

function formatDate(input: string | null, locale: "zh" | "en") {
  if (!input) return null;
  const date = new Date(input);
  return locale === "zh"
    ? date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function UsageBanner() {
  const { summary } = useUsageSummary();
  const { lang } = useLanguage();
  const t = UI_TEXT[lang];

  if (!summary) return null;

  const nanoLabel = `${t.usage_label_nano}: ${formatRemaining(summary.nano.limit, summary.nano.used)}`;
  const proLabel = `${t.usage_label_pro}: ${formatRemaining(summary.pro.limit, summary.pro.used)}`;
  const creditTotal = summary.credits.paid;

  if (!summary.authenticated && summary.guest) {
    const remaining = Math.max(summary.guest.limit - summary.guest.used, 0);
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-white/10 via-transparent to-transparent px-6 py-5 text-white">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,#ffffff33,transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.45em] uppercase text-white/80">{t.usage_guest_title}</p>
            <p className="mt-1 text-2xl font-serif tracking-[0.3em]">
              {t.usage_guest_remaining.replace("{0}", String(remaining)).replace("{1}", String(summary.guest.limit))}
            </p>
          </div>
          <div className="rounded-full border border-white/20 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/90">
            {t.usage_guest_cta}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/15 bg-white/5 px-5 py-4 text-[11px] uppercase tracking-[0.25em] text-white/80 flex flex-col gap-3">
      <div className="flex flex-wrap gap-4">
        <span className="text-white">{nanoLabel}</span>
        <span className="text-white">{proLabel}</span>
        <span className="text-white">
          {t.usage_label_credits}: {creditTotal}
        </span>
      </div>
      <div className="flex flex-wrap gap-4 text-[10px] text-lux-muted/90">
        <span>
          {t.usage_cost_nano.replace("{0}", String(summary.costs.nano))}
        </span>
        <span>
          {t.usage_cost_pro.replace("{0}", String(summary.costs.pro))}
        </span>
        {!summary.signupBonus.claimed && summary.signupBonus.amount > 0 && (
          <span>
            {t.usage_signup_hint
              .replace("{0}", String(summary.signupBonus.amount))
              .replace("{1}", String(summary.signupBonus.expiresInDays))}
          </span>
        )}
      </div>
    </div>
  );
}