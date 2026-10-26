
import { MAX_FILE_SIZE_BYTES, NETWORK_TIMEOUT_MS, ALLOWED_IMAGE_MIME_TYPES, DEFAULT_FILE_EXTENSION } from "@lib/constants";
import { isUrlAllowed } from "./urlValidation";

export type ParsedImage = {
  mimeType: string;
  buffer: Buffer;
};


export function parseDataUrl(dataUrl: string): ParsedImage | null {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  const [, mimeType, base64] = match;
  return {
    mimeType,
    buffer: Buffer.from(base64, "base64")
  };
}


export function inferMimeTypeFromUrl(url: string): string | undefined {
  const match = url.match(/\.(png|jpg|jpeg|webp|gif|bmp)(?:\?|#|$)/i);
  if (!match) return undefined;
  const ext = match[1].toLowerCase();
  if (ext === "jpg") return "image/jpeg";
  return `image/${ext}`;
}


export function getFileExtension(mimeType: string, fallback = DEFAULT_FILE_EXTENSION): string {
  const match = mimeType.match(/\/([a-zA-Z0-9+.-]+)/);
  return match ? match[1] : fallback;
}


export function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File too large: ${size} bytes. Maximum allowed: ${MAX_FILE_SIZE_BYTES} bytes.`);
  }
}


export function validateMimeType(mimeType: string): void {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as any)) {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
}


export async function fetchImageFromUrl(url: string, allowedDomains: string[]): Promise<ParsedImage> {
  if (!isUrlAllowed(url, allowedDomains)) {
    throw new Error(`URL not allowed: ${url}. Only HTTPS URLs from allowed domains are permitted.`);
  }

  const response = await fetch(url, {
    signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    validateFileSize(Number(contentLength));
  }

  const arrayBuffer = await response.arrayBuffer();
  validateFileSize(arrayBuffer.byteLength);

  const mimeType = response.headers.get("content-type")?.split(";")[0] || 
                   inferMimeTypeFromUrl(url) || 
                   "image/png";
  
  validateMimeType(mimeType);

  return {
    mimeType,
    buffer: Buffer.from(arrayBuffer)
  };
}


export function generateUniqueFilename(extension: string, prefix = "references"): string {
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
}
