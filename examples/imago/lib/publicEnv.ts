const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Imago";
const APP_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME || APP_NAME;
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "http://localhost:3000";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "support@example.com";
const STORAGE_PREFIX = process.env.NEXT_PUBLIC_STORAGE_PREFIX || "imago";
const EVENT_PREFIX = process.env.NEXT_PUBLIC_EVENT_PREFIX || STORAGE_PREFIX;
const DOWNLOAD_PREFIX = process.env.NEXT_PUBLIC_DOWNLOAD_PREFIX || STORAGE_PREFIX;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const OG_IMAGE_PATH = process.env.NEXT_PUBLIC_OG_IMAGE_PATH || "/og-image.png";
const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Imago is a powerful AI creative studio for generating images and videos. Customize styles, poses, and scenes instantly.";

const FALLBACK_KEYWORDS = [
  "AI generator",
  "Text to Image",
  "Text to Video",
  "AI Art",
  "Creative Tool",
  APP_NAME
];

const SITE_KEYWORDS = process.env.NEXT_PUBLIC_SITE_KEYWORDS
  ? process.env.NEXT_PUBLIC_SITE_KEYWORDS.split(",").map((keyword) => keyword.trim()).filter(Boolean)
  : FALLBACK_KEYWORDS;

export const PUBLIC_CONFIG = {
  appName: APP_NAME,
  appShortName: APP_SHORT_NAME,
  appUrl: APP_URL,
  contactEmail: CONTACT_EMAIL,
  storagePrefix: STORAGE_PREFIX,
  eventPrefix: EVENT_PREFIX,
  downloadPrefix: DOWNLOAD_PREFIX,
  gaMeasurementId: GA_MEASUREMENT_ID,
  ogImagePath: OG_IMAGE_PATH,
  siteDescription: SITE_DESCRIPTION,
  siteKeywords: SITE_KEYWORDS,
  ageGateEnabled: process.env.NEXT_PUBLIC_AGE_GATE_ENABLED !== "false",
  logoPath: process.env.NEXT_PUBLIC_LOGO_PATH || "/favicon.svg"
};

export const STORAGE_KEYS = {
  language: `${STORAGE_PREFIX}_lang`,
  model: `${STORAGE_PREFIX}_model`,
  ageVerified: `${STORAGE_PREFIX}_age_verified`,
  genderSelected: `${STORAGE_PREFIX}_gender_selected`,
  announcements: `${STORAGE_PREFIX}_dismissed_announcements`
};

export const EVENT_NAMES = {
  historyUpdated: `${EVENT_PREFIX}:history-updated`,
  usageUpdated: `${EVENT_PREFIX}:usage-updated`,
  openRechargeModal: `${EVENT_PREFIX}:open-recharge-modal`
};