import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { getCreditPlan, STRIPE_CURRENCY } from "@lib/creditPlans";
import { getStripe } from "@lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "auth_disabled" }, { status: 503 });
    }
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const planId = typeof body?.planId === "string" ? body.planId : null;
    const plan = getCreditPlan(planId);

    if (!plan) {
      return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
    }

    const stripe = getStripe();
    let amount = plan.amount;
    let currency = STRIPE_CURRENCY;

    if (plan.priceId) {
      const price = await stripe.prices.retrieve(plan.priceId);
      if (!price.unit_amount || !price.currency) {
        throw new Error("Invalid price configuration");
      }
      amount = price.unit_amount;
      currency = price.currency;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      description: `Imago credits · ${plan.credits}`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        credits: String(plan.credits),
        planName: plan.name,
        priceId: plan.priceId ?? ""
      },
      receipt_email: user.email ?? undefined
    });

    if (!paymentIntent.client_secret) {
      throw new Error("Failed to create client secret");
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Failed to create payment intent", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}