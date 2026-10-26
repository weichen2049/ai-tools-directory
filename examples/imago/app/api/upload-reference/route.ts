import { NextRequest, NextResponse } from "next/server";
import { uploadToR2 } from "@lib/r2";
import {
  parseDataUrl,
  fetchImageFromUrl,
  getFileExtension,
  generateUniqueFilename,
  validateFileSize,
  type ParsedImage
} from "@lib/utils/imageProcessing";
import { isHttpsUrl, isValidHttpsUrl, isDataUrl } from "@lib/utils/urlValidation";
import { getAllowedImageDomains } from "@lib/utils/remoteImageDomains";


function hasR2Configuration(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
}


function handleHttpsUrl(url: string): NextResponse {
  if (isValidHttpsUrl(url)) {
    return NextResponse.json({ url });
  }
  throw new Error("Invalid HTTPS URL format");
}


function handleDataUrl(dataUrl: string): ParsedImage {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    throw new Error("Invalid data URL format");
  }
  validateFileSize(parsed.buffer.length);
  return parsed;
}


async function handleExternalHttpsUrl(url: string) {
  return await fetchImageFromUrl(url, getAllowedImageDomains());
}


async function uploadImageToR2(parsedImage: ParsedImage): Promise<string> {
  if (!hasR2Configuration()) {
    throw new Error("R2 storage not configured. Please configure R2 environment variables or use a direct HTTPS image URL.");
  }

  const extension = getFileExtension(parsedImage.mimeType);
  const filename = generateUniqueFilename(extension);
  return await uploadToR2(filename, parsedImage.buffer, parsedImage.mimeType);
}

export async function POST(req: NextRequest) {
  try {
    const { imageData } = await req.json();

    if (typeof imageData !== "string" || imageData.trim().length === 0) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const trimmed = imageData.trim();

    if (isHttpsUrl(trimmed)) {
      try {
        return handleHttpsUrl(trimmed);
      } catch {
      }
    }

    let parsedImage: ParsedImage;

    if (isDataUrl(trimmed)) {
      parsedImage = handleDataUrl(trimmed);
    } else if (isHttpsUrl(trimmed)) {
      parsedImage = await handleExternalHttpsUrl(trimmed);
    } else {
      return NextResponse.json(
        { error: "Unsupported image format. Only data URLs and HTTPS URLs are allowed." },
        { status: 400 }
      );
    }

    const url = await uploadImageToR2(parsedImage);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error("Upload failed:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}