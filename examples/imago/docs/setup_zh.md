# 环境配置指南 (Setup Guide)

[English](./setup.md) | **中文**

Imago 依赖 Supabase (数据库/Auth)、Stripe (支付) 和 Cloudflare R2 (存储) 才能完整运行。

## 1. 基础环境变量

请复制 `.env.local.example` 到 `.env.local`：

```bash
cp .env.local.example .env.local
```

## 2. Supabase 配置 (数据库 & Auth)

1.  登录 [Supabase](https://supabase.com/) 创建一个新项目。
2.  在 Project Settings -> API 中找到 `URL` 和 `anon` key，分别填入：
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY` (用于后端管理操作)
3.  **初始化数据库**：
    在 Supabase 左侧菜单进入 **SQL Editor**，运行 `supabase/migrations/20260101000000_consolidated_schema.sql`。
    这是一个合并后的完整架构文件，一次执行即可初始化所有表结构和函数。
4.  **配置 Auth**：
    在 Authentication -> Providers 中启用 `Email`，如果需要 Google 登录则配置 Google Provider。

## 3. Stripe 配置 (支付)

1.  登录 [Stripe Dashboard](https://dashboard.stripe.com/)。
2.  获取 API Keys (Developers -> API keys):
    *   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key
    *   `STRIPE_SECRET_KEY`: Secret key
3.  **创建产品 (Products)**：
    创建对应的充值套餐（如 Mini, Starter, Pro），获取它们的 Price ID (如 `price_1Pxxxxx`)，填入 `.env.local` 的 `STRIPE_PRICE_ID_*` 字段。
4.  **配置 Webhook**：
    *   进入 Developers -> Webhooks，添加 Endpoint。
    *   URL 指向你的域名 `/api/stripe/webhook` (本地开发使用 stripe cli 转发)。
    *   监听事件：`payment_intent.succeeded`。
    *   获取 Signing Secret 填入 `STRIPE_WEBHOOK_SECRET`。

## 4. Cloudflare R2 配置 (图片存储)

建议使用 R2 存储生成的图片，也可以使用兼容 S3 的其他存储。

1.  创建 R2 Bucket。
2.  获取 R2 的 S3 API 凭证 (Access Key ID, Secret Access Key, Endpoint)。
3.  填入环境变量：
    *   `R2_ACCOUNT_ID`
    *   `R2_ACCESS_KEY_ID`
    *   `R2_SECRET_ACCESS_KEY`
    *   `R2_BUCKET_NAME`
    *   `R2_PUBLIC_URL`: 你的 R2 绑定的公开访问域名。

## 5. 模型配置

默认对接 `generic` provider 接口，如有自建 API 或使用 Replicate/Fal.ai，请修改 `providers/` 目录下的适配代码或配置相关 API Token。

## 6. 可选配置

### 预览模式（无需 Supabase）

如果只想预览 UI 而暂不配置 Supabase，直接运行 `npm run dev` 即可。应用会以**预览模式**启动，认证和历史记录功能将被禁用。

### 年龄限制开关

默认首次访问会显示 18+ 年龄验证页面。如需关闭：

```bash
NEXT_PUBLIC_AGE_GATE_ENABLED=false
```

### 自定义 Logo

通过以下配置替换默认 Logo：

```bash
NEXT_PUBLIC_LOGO_PATH=/your-logo.svg
```

将你的 Logo 文件放入 `public/` 目录即可。
