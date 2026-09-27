import { NextRequest, NextResponse } from "next/server";

<<<<<<< HEAD
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
=======
// SVG is deliberately absent. It is an executable document format — it can
// carry <script> — and this route replays whatever it fetches from the site's
// own origin, so allowing it would turn any SVG reachable on the Sanity CDN
// into stored XSS against tv10india.com. Everything this route is actually
// asked for is a photograph, so nothing legitimate is lost.
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
>>>>>>> 176d453 (Update V1.5)

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
<<<<<<< HEAD
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tv10-india.vercel.app";
=======
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tv10india.com";
>>>>>>> 176d453 (Update V1.5)
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
