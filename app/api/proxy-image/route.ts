import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing URL", { status: 400 });

  try {
    const requestedUrl = new URL(url);
    if (requestedUrl.protocol !== "https:" || requestedUrl.hostname !== "cdn.sanity.io") {
      return new NextResponse("Image host not allowed", { status: 403 });
    }

    const response = await fetch(requestedUrl, { redirect: "error" });
    if (!response.ok) {
      return new NextResponse("Image fetch failed", { status: response.status });
    }

    const contentType = response.headers.get("Content-Type")?.split(";")[0].trim() || "";
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return new NextResponse("Invalid content type", { status: 403 });
    }

    const blob = await response.blob();

    const origin = req.headers.get("Origin") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tv10-india.vercel.app";
    const allowedOrigin = origin && new URL(siteUrl).origin === origin ? origin : new URL(siteUrl).origin;

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": allowedOrigin,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
