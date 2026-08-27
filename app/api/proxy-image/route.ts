import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing URL", { status: 400 });

  try {
    const requestedUrl = new URL(url);
    if (requestedUrl.protocol !== "https:" || requestedUrl.hostname !== "cdn.sanity.io") {
      return new NextResponse("Image host not allowed", { status: 403 });
    }

    const response = await fetch(requestedUrl, { redirect: "manual" });
    if (!response.ok) {
      return new NextResponse("Image fetch failed", { status: response.status });
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
