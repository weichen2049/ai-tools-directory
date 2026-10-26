# 快速部署指南

[English](./deploy.md) | **中文**

按顺序完成以下步骤即可成功部署 Imago 到生产环境。

---

## 前置准备

- Node.js 18+
- [Supabase](https://supabase.com/) 账号（免费套餐即可）
- [Vercel](https://vercel.com/) 账号（推荐）或任何 Node.js 托管平台
- （可选）[Stripe](https://stripe.com/) 账号用于支付功能
- （可选）[Cloudflare R2](https://www.cloudflare.com/r2/) 用于参考图上传存储

---

## 第 1 步：克隆并安装

```bash
git clone https://github.com/tenngoxars/imago.git
cd imago
npm install
```

> 📝 如需 Fork 后部署，请替换为你的仓库地址。

---

## 第 2 步：创建 Supabase 项目

1. 打开 [supabase.com/dashboard](https://supabase.com/dashboard)
2. 点击 **New Project**，输入项目名称和密码
3. 等待项目创建完成（约 2 分钟）

---

## 第 3 步：初始化数据库

1. 在 Supabase 项目中，点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制 `supabase/migrations/20260101000000_consolidated_schema.sql` 的全部内容
4. 粘贴到编辑器中，点击 **Run**
5. ✅ 看到 "Success. No rows returned" 表示成功

---

## 第 4 步：配置 Supabase Auth

### 4.1 获取 API 密钥

1. 点击 **Project Settings** → **API**
2. 复制以下值：

| 设置项 | 环境变量 |
|--------|----------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role secret | `SUPABASE_SERVICE_ROLE_KEY` |

### 4.2 启用登录方式

1. 点击 **Authentication** → **Providers**
2. 启用 **Email**（默认开启）
3. （可选）启用 **Google**：
   - 需先在 [Google Cloud Console](https://console.cloud.google.com/) 创建 OAuth 客户端
   - 填入 Client ID 和 Client Secret
   - 在 Authorized redirect URIs 添加：`https://<project-ref>.supabase.co/auth/v1/callback`（project-ref 可在 Supabase Project Settings → API 查看，例如 URL 为 `https://abcxyz.supabase.co` 则 project-ref 为 `abcxyz`）

### 4.3 配置回调地址

1. 点击 **Authentication** → **URL Configuration**
2. **Site URL**：填入 `http://localhost:3000`（本地开发）
3. **Redirect URLs** 添加：
   - `http://localhost:3000/auth/callback`（本地开发）
   - `https://your-domain.com/auth/callback`（生产环境，部署后补充）

---

## 第 5 步：配置环境变量

### 5.0 最小可跑配置说明

| 能力级别 | 需要的环境变量 |
|----------|----------------|
| 最低可运行（仅登录/界面） | `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、`NEXT_PUBLIC_APP_URL`、`NEXT_PUBLIC_APP_NAME` |
| 可用生成（图/视频） | 在上面基础上新增 `IMAGE_API_TOKEN`、`IMAGE_API_URL`、`VIDEO_API_TOKEN`、`VIDEO_API_URL` |
| 参考图上传 | 额外配置 `R2_*`（否则图生图/图生视频不可用） |
| 支付充值 | 额外配置 `STRIPE_*`（否则充值/支付相关功能不可用） |

### 5.0.1 环境变量速查表

| 类别 | 变量 | 是否必填 | 影响范围 |
|------|------|---------|----------|
| 核心 | `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 连接 |
| 核心 | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 是 | Supabase 公开客户端 |
| 核心 | `SUPABASE_SERVICE_ROLE_KEY` | 是 | 服务端管理操作 |
| 核心 | `NEXT_PUBLIC_APP_URL` | 是 | sitemap/robots/OG 绝对地址 |
| 核心 | `NEXT_PUBLIC_APP_NAME` | 是 | 站点名称展示 |
| 生成 | `IMAGE_API_TOKEN` | 是（启用生成） | 图像生成 API |
| 生成 | `IMAGE_API_URL` | 是（启用生成） | 图像生成 API |
| 生成 | `VIDEO_API_TOKEN` | 是（启用生成） | 视频生成 API |
| 生成 | `VIDEO_API_URL` | 是（启用生成） | 视频生成 API |
| 上传 | `R2_*` | 否 | 参考图上传 / 图生图 / 图生视频 |
| 支付 | `STRIPE_*` | 否 | 充值与支付 |
| SEO | `NEXT_PUBLIC_DEFAULT_TITLE` | 否 | 默认标题 |
| SEO | `NEXT_PUBLIC_SITE_DESCRIPTION` | 否 | 站点描述 |
| SEO | `NEXT_PUBLIC_SITE_KEYWORDS` | 否 | 关键词 |
| 品牌 | `NEXT_PUBLIC_APP_SHORT_NAME` | 否 | PWA/短名称 |
| 联系 | `NEXT_PUBLIC_CONTACT_EMAIL` | 否 | 联系邮箱 |
| 统计 | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 否 | Google Analytics |

```bash
cp .env.local.example .env.local
```

### 5.1 必填配置

```bash
# Supabase（第 4 步获取）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 应用基础信息（影响 sitemap/robots/OG）
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Imago
NEXT_PUBLIC_APP_SHORT_NAME=Imago
```

### 5.2 强烈建议配置

```bash
# SEO 相关
NEXT_PUBLIC_DEFAULT_TITLE="Imago · AI Image & Video Generator"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description here"
NEXT_PUBLIC_SITE_KEYWORDS="AI, Image Generator, Video"
NEXT_PUBLIC_CONTACT_EMAIL=hello@example.com

# Google Analytics（可选）
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 第 6 步：配置图片/视频生成 API

Imago 需要对接外部的 AI 图片/视频生成 API。系统默认兼容类似 z-image 和 Wan 2.6 的异步任务接口。

### 图片生成 API

```bash
# API 密钥和基础地址（必填）
IMAGE_API_TOKEN=你的API密钥
IMAGE_API_URL=https://你的API地址.com

# API 路径（有默认值，通常不需要改）
IMAGE_CREATE_TASK_PATH=/api/v1/jobs/createTask
IMAGE_QUERY_TASK_PATH=/api/v1/jobs/recordInfo
```

### 视频生成 API

```bash
# API 密钥和基础地址（必填）
VIDEO_API_TOKEN=你的视频API密钥
VIDEO_API_URL=https://你的视频API地址.com

# API 路径（有默认值，通常不需要改）
VIDEO_CREATE_TASK_PATH=/api/v1/jobs/createTask
VIDEO_QUERY_TASK_PATH=/api/v1/jobs/recordInfo
```

### API 接口规范

系统期望的 API 接口格式：

**创建任务** `POST {BASE_URL}{CREATE_TASK_PATH}`
```json
{
  "model": "z-image",
  "input": { "prompt": "...", "aspect_ratio": "3:4" }
}
```
响应：`{ "code": 200, "data": { "taskId": "xxx" } }`

**查询任务** `GET {BASE_URL}{QUERY_TASK_PATH}?taskId=xxx`

响应：`{ "code": 200, "data": { "state": "success", "resultJson": "{\"url\":\"...\"}" } }`

> 💡 如果你的 API 格式不同，需要修改 `providers/image.ts` 或 `providers/video.ts` 中的适配逻辑。

> ⚠️ 如果暂时没有 API，界面仍可正常运行，但生成功能会失败。

---

## 第 7 步：（可选）配置 R2 存储

如需支持**参考图上传**功能，必须配置 S3 兼容存储（推荐 Cloudflare R2）：

```bash
R2_ACCOUNT_ID=你的账户ID
R2_ACCESS_KEY_ID=你的AccessKey
R2_SECRET_ACCESS_KEY=你的SecretKey
R2_BUCKET_NAME=imago-uploads
R2_PUBLIC_URL=https://your-r2-domain.com
```

### R2 公网访问设置

配置 R2 后还需要确保图片可被公开访问：

1. 在 Cloudflare Dashboard → R2 → 你的 Bucket → **Settings**
2. 启用 **Public Access**（或绑定自定义域名）
3. 如果使用自定义域名，确保 `R2_PUBLIC_URL` 与域名一致
4. （可选）配置 CORS 规则允许前端直接访问：
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

> ⚠️ **不配置 R2 的影响**：用户将无法上传参考图，"图生图"和"图生视频"功能不可用。纯文生图/视频不受影响。

---

## 第 8 步：本地测试

```bash
npm run dev
```

打开 http://localhost:3000 — 应该能看到应用正常运行。

✅ **验证点**：
- 页面正常加载，无报错
- 可以注册/登录账户
- 进入生成页面能看到界面

---

## 第 9 步：部署到 Vercel

### ⚠️ 重要：跳过 OG 图片生成

`postbuild` 脚本会使用 Playwright 截图生成 OG 图片，在 Vercel 等无头环境会失败。

**解决方案 A**：在 Vercel 环境变量中添加：

```bash
SKIP_OG_CAPTURE=true
```

**解决方案 B**：如需生成 OG 图片，在本地先安装 Playwright 浏览器再构建：

```bash
npx playwright install chromium
npm run build
```

然后将生成的 `public/og-image.png` 一起提交部署。

> 💡 如果本地构建时遇到 Playwright 相关错误，说明缺少浏览器依赖，请运行上述 `npx playwright install chromium` 命令。

### 方式 A：命令行部署（推荐）

```bash
npm i -g vercel
vercel
```

按提示操作，然后在 Vercel 控制台添加环境变量：
1. 进入项目 → **Settings** → **Environment Variables**
2. 添加 `.env.local` 中的所有变量
3. **务必添加** `SKIP_OG_CAPTURE=true`
4. 将 `NEXT_PUBLIC_APP_URL` 改为你的生产域名

### 方式 B：一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tenngoxars/imago&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL,SKIP_OG_CAPTURE)

> 点击后需要手动填入所有环境变量。

---

## 第 10 步：更新生产环境配置

部署成功后，务必完成以下更新：

### 10.1 更新 Supabase Auth

1. 打开 Supabase → **Authentication** → **URL Configuration**
2. 将 **Site URL** 改为你的生产域名（如 `https://your-app.vercel.app`）
3. 在 **Redirect URLs** 添加：`https://your-app.vercel.app/auth/callback`

### 10.2 更新环境变量

在 Vercel 控制台确保以下变量已更新：

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

> 💡 **Preview 部署提示**：如果使用 Vercel Preview 环境，sitemap/robots/OG 会使用 `NEXT_PUBLIC_APP_URL` 的值。建议在 Vercel 中为 Preview 环境单独配置该变量（Environment: Preview），或在正式上线前再更新为生产域名。

---

## 第 11 步：（可选）配置 Stripe 支付

如需支付功能，需要完整配置：

### 11.1 获取 API 密钥

从 [Stripe Dashboard](https://dashboard.stripe.com/apikeys) 获取：

```bash
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### 11.2 创建产品和价格

1. 在 Stripe → **Products** 创建 4 个套餐（Mini, Starter, Creator, Pro）
2. 获取每个价格的 Price ID（格式如 `price_1Pxxxxx`）
3. 填入环境变量：

```bash
STRIPE_PRICE_ID_MINI=price_xxx
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_CREATOR=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_CURRENCY=usd  # 或 hkd, cny 等
```

### 11.3 配置 Webhook

1. 在 **Developers** → **Webhooks** 添加 Endpoint
2. URL: `https://your-app.vercel.app/api/stripe/webhook`
3. 监听事件: `payment_intent.succeeded`
4. 复制 Signing Secret 到：

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 🎉 部署完成！

你的 Imago 实例现在应该已经上线了。

---

## 常见问题

| 问题 | 解决方案 |
|------|----------|
| Vercel 构建失败，Playwright 相关 | 添加 `SKIP_OG_CAPTURE=true` 环境变量 |
| "Supabase not configured" | 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否正确 |
| 认证回调失败 / 无法登录 | 检查 Supabase Auth 的 Site URL 和 Redirect URLs |
| 生成失败 | 检查 `IMAGE_API_TOKEN` 和 `IMAGE_API_URL` |
| 无法上传参考图 | 需要配置 R2 存储 |
| 支付不工作 | 确认 Stripe Price ID 和 webhook secret 配置正确 |
| 金额显示错误 | 检查 `STRIPE_CURRENCY` 是否与 Stripe 产品设置一致 |

---

## 后续优化

- 替换 `/public/favicon.svg` 为你的 Logo（或设置 `NEXT_PUBLIC_LOGO_PATH`）
- 设置 `NEXT_PUBLIC_APP_NAME` 为你的品牌名
- 设置 `NEXT_PUBLIC_AGE_GATE_ENABLED=false` 关闭年龄验证（如不需要）
- 配置 Google Analytics（`NEXT_PUBLIC_GA_MEASUREMENT_ID`）

---

## 附录：其他平台部署

如果不使用 Vercel，可以部署到任何支持 Node.js 的平台（如 Railway、Render、自建服务器）。

### 构建生产版本

```bash
# 跳过 OG 截图（除非已安装 Playwright）
SKIP_OG_CAPTURE=true npm run build
```

### 启动生产服务器

```bash
npm run start
```

默认监听 3000 端口。如需更改：

```bash
PORT=8080 npm run start
```

### 环境变量注入

根据平台不同，环境变量注入方式各异：

**Docker / 自建服务器**：
```bash
export NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
# ... 其他变量
npm run start
```

**或使用 .env 文件**：
```bash
cp .env.local.example .env.production
# 编辑 .env.production 填入生产配置
# 必须设置 NODE_ENV=production，否则不会读取 .env.production
NODE_ENV=production npm run start
```

**Railway / Render**：在平台控制台的 Environment Variables 中添加。

### 反向代理（Nginx）

如使用 Nginx 反向代理：

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

### PM2 进程管理

推荐使用 PM2 保持服务常驻：

```bash
npm install -g pm2
pm2 start npm --name "imago" -- run start
pm2 save
pm2 startup
```
