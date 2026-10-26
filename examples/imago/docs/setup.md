# Setup Guide

[中文](./setup_zh.md) | **English**

Imago relies on Supabase (Database/Auth), Stripe (Payment), and Cloudflare R2 (Storage) to fully function.

## 1. Basic Environment Variables

Please copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

## 2. Supabase Configuration (Database & Auth)

1.  Log in to [Supabase](https://supabase.com/) and create a new project.
2.  In **Project Settings -> API**, find the `URL` and `anon`/`service_role` keys, and fill them into your `.env.local`:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY` (Used for backend administrative operations)
3.  **Initialize Database**:
    Go to **SQL Editor** in the Supabase menu and run the file `supabase/migrations/20260101000000_consolidated_schema.sql`.
    This is a consolidated schema file that initializes all table structures and functions in one go.
4.  **Configure Auth**:
    In **Authentication -> Providers**, enable `Email`. If you need Google login, configure the Google Provider there as well.

## 3. Stripe Configuration (Payment)

1.  Log in to [Stripe Dashboard](https://dashboard.stripe.com/).
2.  Get API Keys (**Developers -> API keys**):
    *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key
    *   `STRIPE_SECRET_KEY`: Secret key
3.  **Create Products**:
    Create corresponding recharge tiers (e.g., Mini, Starter, Pro), get their Price IDs (e.g., `price_1Pxxxxx`), and fill them into the `STRIPE_PRICE_ID_*` fields in `.env.local`.
4.  **Configure Webhook**:
    *   Go to **Developers -> Webhooks**, add an Endpoint.
    *   URL points to your domain `/api/stripe/webhook` (use stripe cli for local forwarding).
    *   Listening event: `payment_intent.succeeded`.
    *   Get the Signing Secret and fill into `STRIPE_WEBHOOK_SECRET`.

## 4. Cloudflare R2 Configuration (Image Storage)

It is recommended to use R2 for storing generated images, but any S3-compatible storage will work.

1.  Create an R2 Bucket.
2.  Get R2 S3 API Credentials (Access Key ID, Secret Access Key, Endpoint).
3.  Fill in the environment variables:
    *   `R2_ACCOUNT_ID`
    *   `R2_ACCESS_KEY_ID`
    *   `R2_SECRET_ACCESS_KEY`
    *   `R2_BUCKET_NAME`
    *   `R2_PUBLIC_URL`: Your R2 public access domain.

## 5. Model Configuration

The system defaults to the `generic` provider interface. If you have a custom API or use Replicate/Fal.ai, please modify the adapter code in the `providers/` directory or configure the relevant API Tokens in `.env.local`.

## 6. Optional Configuration

### Preview Mode (No Supabase Required)

If you want to preview the UI without configuring Supabase, simply run `npm run dev`. The application will start in **Preview Mode** with auth and history features disabled.

### Age Gate Toggle

By default, an 18+ age verification page is shown on first visit. To disable it:

```bash
NEXT_PUBLIC_AGE_GATE_ENABLED=false
```

### Custom Logo

Replace the default logo by setting:

```bash
NEXT_PUBLIC_LOGO_PATH=/your-logo.svg
```

Place your logo file in the `public/` directory.
