import { NextRequest, NextResponse } from "next/server";
import { fetchImageFromUrl } from "@lib/utils/imageProcessing";
import { getAllowedImageDomains } from "@lib/utils/remoteImageDomains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl || typeof imageUrl !== "string") {
    return NextResponse.json({ error: "Missing or invalid url parameter" }, { status: 400 });
  }

  try {
    const { buffer, mimeType } = await fetchImageFromUrl(imageUrl, getAllowedImageDomains());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET"
      }
    });
  } catch (error: unknown) {
    console.error("Image proxy error:", error);
    const message = error instanceof Error ? error.message : "Proxy failed";
    const status = /url not allowed|https/.test(message.toLowerCase()) ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}