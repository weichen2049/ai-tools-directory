import { PUBLIC_CONFIG } from "@lib/publicEnv";

const RAW_BASE_URL = PUBLIC_CONFIG.appUrl;
const BASE_URL = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL;
const OG_IMAGE_PATH = PUBLIC_CONFIG.ogImagePath;
const DEFAULT_TITLE =
  process.env.NEXT_PUBLIC_DEFAULT_TITLE || `${PUBLIC_CONFIG.appName} · AI Image & Video Generator`;
const OG_IMAGE_DIMENSIONS = {
  width: 1200,
  height: 630
} as const;

export const SEO_CONFIG = {
  baseUrl: BASE_URL,
  siteName: PUBLIC_CONFIG.appName,
  defaultTitle: DEFAULT_TITLE,
  descriptionEn: PUBLIC_CONFIG.siteDescription,
  keywords: [...PUBLIC_CONFIG.siteKeywords],
  ogImagePath: OG_IMAGE_PATH
} as const;

export const getAbsoluteOgImageUrl = () => `${BASE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_SIZE = OG_IMAGE_DIMENSIONS;