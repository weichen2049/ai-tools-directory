


export function isValidHttpsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:";
  } catch {
    return false;
  }
}


export function isDataUrl(url: string): boolean {
  return url.startsWith("data:");
}


export function isHttpsUrl(url: string): boolean {
  return url.startsWith("https://");
}


export function validateImageUrl(url: string): void {
  if (isDataUrl(url)) {
    return; // data URL is valid
  }

  if (!isHttpsUrl(url)) {
    throw new Error("Only HTTPS URLs are supported");
  }

  if (!isValidHttpsUrl(url)) {
    throw new Error("Invalid URL format");
  }
}


export function isUrlAllowed(url: string, allowedDomains: string[]): boolean {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== "https:") {
      return false;
    }
    if (allowedDomains.length === 0) {
      return true;
    }
    const hostname = urlObj.hostname.toLowerCase();
    return allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}