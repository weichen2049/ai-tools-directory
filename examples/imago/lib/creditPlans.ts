export type CreditPlan = {
  id: string;
  name: string;
  credits: number;
  amount: number;
  priceId?: string;
  description: { zh: string; en: string };
};

const currency = process.env.STRIPE_CURRENCY || "hkd";
const priceEnv = {
  mini: process.env.STRIPE_PRICE_ID_MINI,
  starter: process.env.STRIPE_PRICE_ID_STARTER,
  creator: process.env.STRIPE_PRICE_ID_CREATOR,
  pro: process.env.STRIPE_PRICE_ID_PRO
} as const;

export const CREDIT_PLANS: readonly CreditPlan[] = [
  {
    id: "mini",
    name: "Mini",
    credits: 400,
    amount: 500,
    priceId: priceEnv.mini,
    description: {
      zh: "短期体验包，适合小额试水",
      en: "Quick starter for light usage"
    }
  },
  {
    id: "starter",
    name: "Starter",
    credits: 1000,
    amount: 1500,
    priceId: priceEnv.starter,
    description: {
      zh: "适合首次体验或小批量生成",
      en: "Great for quick experiments"
    }
  },
  {
    id: "creator",
    name: "Creator",
    credits: 5000,
    amount: 5500,
    priceId: priceEnv.creator,
    description: {
      zh: "每日高频创作推荐",
      en: "For regular creators"
    }
  },
  {
    id: "pro",
    name: "Pro",
    credits: 10000,
    amount: 10000,
    priceId: priceEnv.pro,
    description: {
      zh: "专业或团队使用，高性价比",
      en: "Best value for power users"
    }
  }
] as const;

export function getCreditPlan(planId: string | undefined | null) {
  if (!planId) return undefined;
  return CREDIT_PLANS.find((plan) => plan.id === planId);
}

export const STRIPE_CURRENCY = currency;