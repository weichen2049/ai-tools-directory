# Quick Deploy Guide

[中文](./deploy_zh.md) | **English**

Follow these steps in order to deploy Imago to production.

---

## Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com/) account (free tier works)
- [Vercel](https://vercel.com/) account (recommended) or any Node.js hosting
- (Optional) [Stripe](https://stripe.com/) account for payments
- (Optional) [Cloudflare R2](https://www.cloudflare.com/r2/) for reference image uploads

---

## Step 1: Clone & Install

```bash
git clone https://github.com/tenngoxars/imago.git
cd imago
npm install
```

> 📝 If deploying from a fork, replace with your repository URL.

---

## Step 2: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**, enter name and password
3. Wait for project to be ready (~2 minutes)

---

## Step 3: Initialize Database

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire content from `supabase/migrations/20260101000000_consolidated_schema.sql`
4. Paste into the editor and click **Run**
5. ✅ You should see "Success. No rows returned"

---

## Step 4: Configure Supabase Auth

### 4.1 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:

| Setting | Environment Variable |
|---------|---------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role secret | `SUPABASE_SERVICE_ROLE_KEY` |

### 4.2 Enable Login Providers

1. Go to **Authentication** → **Providers**
2. Enable **Email** (on by default)
3. (Optional) Enable **Google**:
   - First create OAuth client at [Google Cloud Console](https://console.cloud.google.com/)
   - Enter Client ID and Client Secret
   - Add Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback` (project-ref is in Supabase Project Settings → API, e.g. `https://abcxyz.supabase.co` → `abcxyz`)

### 4.3 Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. **Site URL**: Set to `http://localhost:3000` (for local dev)
3. Add to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (local dev)
   - `https://your-domain.com/auth/callback` (production, add after deploy)

---

## Step 5: Configure Environment Variables

### 5.0 Minimal viable configuration

| Capability | Required environment variables |
|------------|--------------------------------|
| Minimum (UI/auth only) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME` |
| Generation enabled | Add `IMAGE_API_TOKEN`, `IMAGE_API_URL`, `VIDEO_API_TOKEN`, `VIDEO_API_URL` |
| Reference uploads | Add `R2_*` (image-to-image/video will be unavailable without these) |
| Payments | Add `STRIPE_*` (recharge/payment flows will be unavailable without these) |

### 5.0.1 Environment variable quick reference

| Category | Variable | Required | Impact |
|----------|----------|----------|--------|
| Core | `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase connection |
| Core | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public client |
| Core | `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side admin operations |
| Core | `NEXT_PUBLIC_APP_URL` | Yes | Absolute URLs for sitemap/robots/OG |
| Core | `NEXT_PUBLIC_APP_NAME` | Yes | Site name display |
| Generation | `IMAGE_API_TOKEN` | Yes (if generation enabled) | Image generation API |
| Generation | `IMAGE_API_URL` | Yes (if generation enabled) | Image generation API |
| Generation | `VIDEO_API_TOKEN` | Yes (if generation enabled) | Video generation API |
| Generation | `VIDEO_API_URL` | Yes (if generation enabled) | Video generation API |
| Uploads | `R2_*` | No | Reference uploads / image-to-image / image-to-video |
| Payments | `STRIPE_*` | No | Recharge & payments |
| SEO | `NEXT_PUBLIC_DEFAULT_TITLE` | No | Default title |
| SEO | `NEXT_PUBLIC_SITE_DESCRIPTION` | No | Site description |
| SEO | `NEXT_PUBLIC_SITE_KEYWORDS` | No | Keywords |
| Branding | `NEXT_PUBLIC_APP_SHORT_NAME` | No | PWA/short name |
| Contact | `NEXT_PUBLIC_CONTACT_EMAIL` | No | Contact email |
| Analytics | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | No | Google Analytics |

```bash
cp .env.local.example .env.local
```

### 5.1 Required Configuration

```bash
# Supabase (from Step 4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# App basics (affects sitemap/robots/OG)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Imago
NEXT_PUBLIC_APP_SHORT_NAME=Imago
```

### 5.2 Strongly Recommended

```bash
# SEO
NEXT_PUBLIC_DEFAULT_TITLE="Imago · AI Image & Video Generator"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description here"
NEXT_PUBLIC_SITE_KEYWORDS="AI, Image Generator, Video"
NEXT_PUBLIC_CONTACT_EMAIL=hello@example.com

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Step 6: Configure Image/Video API

Imago requires external AI image/video generation APIs. The system is compatible with async task-based APIs similar to z-image and Wan 2.6.

### Image Generation API

```bash
# API key and base URL (required)
IMAGE_API_TOKEN=your-api-token
IMAGE_API_URL=https://your-api-endpoint.com

# API paths (have defaults, usually no need to change)
IMAGE_CREATE_TASK_PATH=/api/v1/jobs/createTask
IMAGE_QUERY_TASK_PATH=/api/v1/jobs/recordInfo
```

### Video Generation API

```bash
# API key and base URL (required)
VIDEO_API_TOKEN=your-video-api-token
VIDEO_API_URL=https://your-video-api-endpoint.com

# API paths (have defaults, usually no need to change)
VIDEO_CREATE_TASK_PATH=/api/v1/jobs/createTask
VIDEO_QUERY_TASK_PATH=/api/v1/jobs/recordInfo
```

### API Interface Specification

Expected API format:

**Create Task** `POST {BASE_URL}{CREATE_TASK_PATH}`
```json
{
  "model": "z-image",
  "input": { "prompt": "...", "aspect_ratio": "3:4" }
}
```
Response: `{ "code": 200, "data": { "taskId": "xxx" } }`

**Query Task** `GET {BASE_URL}{QUERY_TASK_PATH}?taskId=xxx`

Response: `{ "code": 200, "data": { "state": "success", "resultJson": "{\"url\":\"...\"}" } }`

> 💡 If your API has a different format, modify the adapter logic in `providers/image.ts` or `providers/video.ts`.

> ⚠️ If you don't have an API yet, the UI will still work but generation will fail.

---

## Step 7: (Optional) Configure R2 Storage

To enable **reference image uploads**, you must configure S3-compatible storage (Cloudflare R2 recommended):

```bash
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=imago-uploads
R2_PUBLIC_URL=https://your-r2-domain.com
```

### R2 Public Access Setup

After configuring R2, ensure images are publicly accessible:

1. In Cloudflare Dashboard → R2 → Your Bucket → **Settings**
2. Enable **Public Access** (or bind a custom domain)
3. If using a custom domain, ensure `R2_PUBLIC_URL` matches
4. (Optional) Configure CORS rules for frontend access:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

> ⚠️ **Impact of not configuring R2**: Users cannot upload reference images. Image-to-image and image-to-video features will be unavailable. Text-to-image/video still works.

---

## Step 8: Test Locally

```bash
npm run dev
```

Open http://localhost:3000 — you should see the app running.

✅ **Checklist**:
- Page loads without errors
- Can register/login
- Generation interface displays correctly

---

## Step 9: Deploy to Vercel

### ⚠️ Important: Skip OG Image Generation

The `postbuild` script uses Playwright to capture OG images, which fails in headless environments like Vercel.

**Solution A**: Add this environment variable in Vercel:

```bash
SKIP_OG_CAPTURE=true
```

**Solution B**: If you need OG images, install Playwright browser locally first:

```bash
npx playwright install chromium
npm run build
```

Then commit the generated `public/og-image.png` with your deployment.

> 💡 If you encounter Playwright errors during local build, it means browser dependencies are missing. Run `npx playwright install chromium` to fix.

### Option A: CLI Deploy (Recommended)

```bash
npm i -g vercel
vercel
```

Follow prompts, then add environment variables in Vercel dashboard:
1. Go to project → **Settings** → **Environment Variables**
2. Add all variables from your `.env.local`
3. **Must add** `SKIP_OG_CAPTURE=true`
4. Change `NEXT_PUBLIC_APP_URL` to your production domain

### Option B: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tenngoxars/imago&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL,SKIP_OG_CAPTURE)

> You'll need to manually enter all environment variables after clicking.

---

## Step 10: Update Production Configuration

After successful deployment, complete these updates:

### 10.1 Update Supabase Auth

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Change **Site URL** to your production domain (e.g., `https://your-app.vercel.app`)
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

### 10.2 Update Environment Variables

In Vercel dashboard, ensure this is updated:

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

> 💡 **Preview Deployment Note**: If using Vercel Preview environments, sitemap/robots/OG will use the `NEXT_PUBLIC_APP_URL` value. Consider configuring this variable separately for the Preview environment in Vercel (Environment: Preview), or update it to production domain before going live.

---

## Step 11: (Optional) Configure Stripe Payments

For payment functionality, complete configuration is required:

### 11.1 Get API Keys

From [Stripe Dashboard](https://dashboard.stripe.com/apikeys):

```bash
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 11.2 Create Products and Prices

1. In Stripe → **Products**, create 4 plans (Mini, Starter, Creator, Pro)
2. Get the Price ID for each (format: `price_1Pxxxxx`)
3. Add to environment variables:

```bash
STRIPE_PRICE_ID_MINI=price_xxx
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_CREATOR=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_CURRENCY=usd  # or hkd, cny, etc.
```

### 11.3 Configure Webhook

1. Go to **Developers** → **Webhooks**, add Endpoint
2. URL: `https://your-app.vercel.app/api/stripe/webhook`
3. Events: `payment_intent.succeeded`
4. Copy Signing Secret to:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 🎉 Done!

Your Imago instance should now be live.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Vercel build fails, Playwright error | Add `SKIP_OG_CAPTURE=true` environment variable |
| "Supabase not configured" | Check `NEXT_PUBLIC_SUPABASE_URL` is correct |
| Auth redirect fails / can't login | Check Supabase Auth Site URL and Redirect URLs |
| Generation fails | Check `IMAGE_API_TOKEN` and `IMAGE_API_URL` |
| Can't upload reference images | Need to configure R2 storage |
| Payment not working | Verify Stripe Price IDs and webhook secret |
| Wrong currency displayed | Check `STRIPE_CURRENCY` matches your Stripe product |

---

## Next Steps

- Replace `/public/favicon.svg` with your logo (or set `NEXT_PUBLIC_LOGO_PATH`)
- Set `NEXT_PUBLIC_APP_NAME` to your brand name
- Set `NEXT_PUBLIC_AGE_GATE_ENABLED=false` to disable age verification (if not needed)
- Configure Google Analytics (`NEXT_PUBLIC_GA_MEASUREMENT_ID`)

---

## Appendix: Deploying to Other Platforms

If not using Vercel, you can deploy to any Node.js hosting platform (Railway, Render, self-hosted server, etc.).

### Build for Production

```bash
# Skip OG capture (unless Playwright is installed)
SKIP_OG_CAPTURE=true npm run build
```

### Start Production Server

```bash
npm run start
```

Default port is 3000. To change:

```bash
PORT=8080 npm run start
```

### Environment Variable Injection

Depending on your platform:

**Docker / Self-hosted**:
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
# ... other variables
npm run start
```

**Or use .env file**:
```bash
cp .env.local.example .env.production
# Edit .env.production with production values
# Ensure NODE_ENV=production or .env.production won't be loaded
NODE_ENV=production npm run start
```

**Railway / Render**: Add variables in the platform's Environment Variables dashboard.

### Reverse Proxy (Nginx)

If using Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 Process Manager

Recommended for keeping the service running:

```bash
npm install -g pm2
pm2 start npm --name "imago" -- run start
pm2 save
pm2 startup
```
