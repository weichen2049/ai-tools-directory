import { isUrlAllowed } from "./urlValidation";

function parseEnvDomains() {
  const raw = process.env.ALLOWED_IMAGE_DOMAINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function getAllowedImageDomains(): string[] {
  return parseEnvDomains();
}

export function ensureRemoteUrlAllowed(url: string) {
  const domains = getAllowedImageDomains();
  if (!isUrlAllowed(url, domains)) {
    throw new Error(`URL not allowed: ${url}. Only HTTPS URLs from allowed domains are permitted.`);
  }
}