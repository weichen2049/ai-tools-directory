import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_DOWNLOAD_FILENAME } from "@lib/constants";
import { fetchImageFromUrl } from "@lib/utils/imageProcessing";
import { getAllowedImageDomains } from "@lib/utils/remoteImageDomains";

function resolveStatus(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("url not allowed") || lower.includes("only https")) {
    return 400;
  }
  if (lower.startsWith("failed to fetch image")) {
    return 502;
  }
  return 500;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }
  try {
    const { buffer, mimeType } = await fetchImageFromUrl(url, getAllowedImageDomains());
    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache",
        "Content-Disposition": `attachment; filename="${DEFAULT_DOWNLOAD_FILENAME}"`
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch failed";
    return new NextResponse(message, { status: resolveStatus(message) });
  }
}