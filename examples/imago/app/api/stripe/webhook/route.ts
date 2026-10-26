import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@lib/stripe";
import { getAdminClient } from "../../../../utils/supabase/admin";

export const runtime = "nodejs";

async function handlePaymentSuccess(intent: Stripe.PaymentIntent) {
  const userId = intent.metadata?.userId;
  const creditsRaw = intent.metadata?.credits;
  const credits = typeof creditsRaw === "string" ? Number(creditsRaw) : Number(creditsRaw ?? 0);
  if (!userId || !Number.isFinite(credits) || credits <= 0) {
    console.warn("Missing metadata for payment intent", intent.id);
    return;
  }

  const admin = getAdminClient();
  const metadata = {
    planId: intent.metadata?.planId ?? null,
    paymentIntentId: intent.id,
    amount: intent.amount_received,
    currency: intent.currency,
    status: intent.status
  };

  const topupPayload = {
    p_user_id: userId,
    p_amount: credits,
    p_reason: intent.metadata?.planName ?? "topup",
    p_metadata: metadata
  };

  const { error } = await admin.rpc("apply_credit_topup", topupPayload as never);

  if (error) {
    console.error("Failed to record credit topup", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const stripeSignature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSignature || !webhookSecret) {
    console.error("Stripe webhook secret is not configured");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
  } catch (error) {
    console.error("Stripe signature verification failed", error);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
    } else {
    }
  } catch (error) {
    console.error(`[Webhook] Error processing event ${event.id}:`, error);
    return NextResponse.json({ error: "webhook_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}