import { NextResponse } from "next/server";
import { CREDIT_PLANS, STRIPE_CURRENCY } from "@lib/creditPlans";
import { getStripe } from "@lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  let stripe: ReturnType<typeof getStripe> | null = null;

  const plans = await Promise.all(
    CREDIT_PLANS.map(async (plan) => {
      let amount = plan.amount;
      let currency = STRIPE_CURRENCY;

      if (plan.priceId) {
        try {
          stripe = stripe ?? getStripe();
          const price = await stripe.prices.retrieve(plan.priceId);
          if (typeof price.unit_amount === "number") {
            amount = price.unit_amount;
          }
          if (price.currency) {
            currency = price.currency;
          }
        } catch (error) {
          console.error("Failed to load Stripe price", plan.priceId, error);
        }
      }

      return {
        id: plan.id,
        name: plan.name,
        credits: plan.credits,
        amount,
        currency,
        description: plan.description
      };
    })
  );

  return NextResponse.json({ plans });
}