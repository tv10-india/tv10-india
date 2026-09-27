import { client } from "@/sanityStudio/lib/sanity";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LIVE_POST_FILTER } from "@/lib/posts";
import { xmlEscape } from "@/lib/xml";

// Google News crawls this far more aggressively than the main sitemap, and a
// sitemap that only changes on deploy is worse than none — regenerate it on a
// short cycle instead of freezing it at build time.
export const revalidate = 300;

// Google's two hard limits for a news sitemap: articles from the last two days,
// and at most 1,000 URLs. Older entries are ignored, so shipping them is dead
// weight that pushes real articles out of the 1,000.
const WINDOW_HOURS = 48;
const MAX_URLS = 1000;

// ISO 639-1. Matches `inLanguage: "hi"` on the article JSON-LD.
const NEWS_LANGUAGE = "hi";

// The shared filter already excludes post-dated articles, which matters here for
// its own reason: a publication_date in the future is a validation error in
// Search Console. It also means a scheduled article joins the sitemap within one
// revalidation of its publish time.
const NEWS_QUERY = `*[
  ${LIVE_POST_FILTER}
  && defined(slug.current)
  && defined(title)
  && dateTime(publishedAt) >= dateTime($since)
] | order(publishedAt desc) [0...${MAX_URLS}] {
  "slug": slug.current,
  title,
  publishedAt
}`;

type NewsPost = {
  slug: string;
  title: string;
  publishedAt: string;
};

function urlEntry(post: NewsPost): string | null {
  const publishedAt = new Date(post.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return null;

  return `  <url>
    <loc>${xmlEscape(`${SITE_URL}/news/${post.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(SITE_NAME)}</news:name>
        <news:language>${NEWS_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${publishedAt.toISOString()}</news:publication_date>
      <news:title>${xmlEscape(post.title)}</news:title>
    </news:news>
  </url>`;
}

export async function GET(): Promise<Response> {
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_HOURS * 60 * 60 * 1000);

  let posts: NewsPost[] = [];
  try {
    posts = await client.fetch<NewsPost[]>(NEWS_QUERY, {
      since: since.toISOString(),
    });
  } catch {
    // An empty but well-formed sitemap beats a 500: Google backs off a source
    // that errors repeatedly, and the next revalidation picks the articles up.
    posts = [];
  }

  const entries = (posts || [])
    .map(urlEntry)
    .filter((entry): entry is string => entry !== null)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
