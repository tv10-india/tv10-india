import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing URL", { status: 400 });

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Access-Control-Allow-Origin": "*", // This unlocks the image for your tool
        "Cache-Control": "public, max-age=31536000, immutable"
      },
    });
  } catch (error) {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}