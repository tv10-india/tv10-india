import { NextResponse } from "next/server";
import { client } from "@/sanityStudio/lib/sanity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RawHeadline {
  title?: string;
  slug?: string;
}

export async function GET() {
  try {
    const headlines = await client.fetch<RawHeadline[]>(
      `*[_type == "post" && defined(title) && defined(slug.current)] | order(publishedAt desc)[0...15]{
        title,
        "slug": slug.current
      }`,
      {},
      { cache: "no-store" }
    );

    const cleaned = (headlines || [])
      .map((h) => ({
        title: h.title,
        slug: (h.slug || "").toString().trim().replace(/^\/+|\/+$/g, ""),
      }))
      .filter((h): h is { title: string; slug: string } => Boolean(h.title && h.slug));

    return NextResponse.json(
      { headlines: cleaned },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching headlines:", error);
    return NextResponse.json({ headlines: [] }, { status: 200 });
  }
}
