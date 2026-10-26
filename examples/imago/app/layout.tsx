import "./globals.css";
import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import { LanguageProvider } from "./providers/LanguageProvider";
import { SupabaseProvider } from "./providers/SupabaseProvider";
import { SEO_CONFIG, getAbsoluteOgImageUrl, OG_IMAGE_SIZE } from "./config/seo";
import { PUBLIC_CONFIG, STORAGE_KEYS } from "@lib/publicEnv";

const OG_IMAGE_URL = getAbsoluteOgImageUrl();
const GA_MEASUREMENT_ID = PUBLIC_CONFIG.gaMeasurementId;

export const metadata: Metadata = {
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | ${SEO_CONFIG.siteName}`
  },
  description: SEO_CONFIG.descriptionEn,
  keywords: [...SEO_CONFIG.keywords],
  authors: [{ name: `${SEO_CONFIG.siteName} Team` }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.siteName,
  metadataBase: new URL(SEO_CONFIG.baseUrl),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.descriptionEn,
    url: SEO_CONFIG.baseUrl,
    siteName: SEO_CONFIG.siteName,
    images: [
      {
        url: OG_IMAGE_URL,
        width: OG_IMAGE_SIZE.width,
        height: OG_IMAGE_SIZE.height,
        alt: `${SEO_CONFIG.siteName} Preview`
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.descriptionEn,
    images: [OG_IMAGE_URL]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/apple-touch-icon.png" } // Assuming we might add this later or it exists
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

async function detectPreferredLanguage() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get(STORAGE_KEYS.language)?.value;
  if (langCookie === "zh" || langCookie === "en") return langCookie;

  const headerStore = await headers();
  const acceptLang = headerStore.get("accept-language") || "";
  const lower = acceptLang.toLowerCase();
  if (lower.includes("zh")) return "zh";
  return "en";
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialLang = await detectPreferredLanguage();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO_CONFIG.siteName,
    alternateName: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.descriptionEn,
    url: SEO_CONFIG.baseUrl,
    image: OG_IMAGE_URL,
    keywords: SEO_CONFIG.keywords.join(", "),
    inLanguage: ["zh-CN", "en-US"],
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    isAccessibleForFree: true,
    isRelatedTo: {
      "@type": "Product",
      name: "Nano Banana Pro"
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/OnlineOnly",
      price: "0",
      priceCurrency: "USD"
    },
    author: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName
    },
    publisher: {
      "@type": "Organization",
      name: SEO_CONFIG.siteName
    }
  };

  return (
    <html lang={initialLang}>
      <body className="relative min-h-screen bg-lux-bg text-lux-text antialiased">
        <div className="lux-noise-layer fixed inset-0 z-0" />
        <div className="lux-ambient-light" />
        <div className="relative z-10">
          <LanguageProvider initialLang={initialLang as "zh" | "en"}>
            <SupabaseProvider>
              {children}
            </SupabaseProvider>
          </LanguageProvider>
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}