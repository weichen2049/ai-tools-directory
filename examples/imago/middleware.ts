import { NextResponse, type NextRequest } from "next/server";

const CDN_HOST = process.env.CDN_HOST || process.env.NEXT_PUBLIC_CDN_HOST;

export function middleware(request: NextRequest) {
  if (!CDN_HOST) return NextResponse.next();
  const host = request.headers.get("host");

  if (host === CDN_HOST) {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*"
};