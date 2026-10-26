# Imago

[中文](./README_zh.md) | **English**

[![License](https://img.shields.io/github/license/tenngoxars/imago?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)




**Imago** is an open-source full-stack AI image generation application architecture, designed for building high-performance, modern generative AI products.

Born from a mature commercial project, it provides a complete solution from **User System**, **Credit Payment** to **Prompt Building**, and **Image/Video Generation**.

The prompt module has been open-sourced separately as [Imago Portrait Prompt](https://github.com/tenngoxars/imago-portrait-prompt).

![Imago Preview](public/demo.png)

## Key Features

- **🎨 Multi-Mode Capability**: Supports three core modes: Fantasy (Styled Presets), Freeform (Open Canvas), and Flow (Video Generation).
- **🔐 Complete User System**: Powered by Supabase Auth, supporting email and social logins.
- **💰 Credits & Payment**: Integrated Stripe payment flow, including full recharge modal, webhook callbacks, and credit deduction logic.
- **🧠 Smart Prompting**: Built-in complex prompt construction and cleaning logic (Humanizer), supporting autocomplete for preset words and negative prompts.
- **⚡️ High-Performance Architecture**: Next.js App Router + Tailwind CSS + Supabase, optimized for production.
- **📱 Responsive Design**: Polished experience for both mobile and desktop, with a premium dark mode UI.

## Tech Stack

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions)
- **Payment**: [Stripe](https://stripe.com/)
- **State Management**: React Hooks + URL State
- **Types**: 100% TypeScript Coverage

## Quick Start

### 1. Clone the Project

```bash
git clone https://github.com/tenngoxars/imago.git
cd imago
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy `.env.local.example` to `.env.local` and fill in the configuration. For detailed instructions, please refer to the [Setup Guide](docs/setup.md).

```bash
cp .env.local.example .env.local
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Documentation

- [Deploy Guide](docs/deploy.md): Step-by-step instructions to deploy Imago to production.
- [Setup Guide](docs/setup.md): Detailed instructions on configuring Supabase, Stripe, and R2 Storage.
- [Architecture](docs/architecture.md): Insights into Prompt flow, Payment callbacks, and Core data flow.

## Contributing

Welcome to submit Pull Requests or Issues! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

[MIT License](LICENSE)
