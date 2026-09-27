// Single source of truth for categories. Sanity stores a short code on the post
// (e.g. "up"); the public route uses a readable slug (e.g. "/uttar-pradesh").

export const CATEGORY_SLUG_TO_CODE: Record<string, string> = {
  "uttar-pradesh": "up",
  uttarakhand: "uk",
  delhi: "delhi",
  national: "national",
  world: "world",
  dharma: "dharma",
  business: "business",
  sports: "sports",
  lifestyle: "lifestyle",
  entertainment: "entertainment",
  videos: "videos",
  "web-stories": "web-stories",
};

export const CATEGORY_CODE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_TO_CODE).map(([slug, code]) => [code, slug]),
);

const CATEGORY_LABELS: Record<string, string> = {
  up: "Uttar Pradesh",
  uk: "Uttarakhand",
  delhi: "Delhi",
  national: "National",
  world: "World",
  dharma: "Dharma",
  business: "Business",
  sports: "Sports",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  videos: "Videos",
  mystery: "Mystery",
  "web-stories": "Web Stories",
};

export function categoryLabel(code?: string): string {
  if (!code) return "News";
  return CATEGORY_LABELS[code] ?? code.replace(/-/g, " ");
}

// Categories that describe a content format rather than a news beat. "Sports
// News" reads fine; "Entertainment News", "Videos News" and "Web Stories News"
// do not, so these render their label on its own.
const NOT_A_NEWS_BEAT = new Set(["entertainment", "videos", "web-stories"]);

// Heading and <title> for a category page.
export function categoryHeading(code?: string): string {
  const label = categoryLabel(code);
  if (!code || NOT_A_NEWS_BEAT.has(code)) return label;
  return `${label} News`;
}

// Public path for a category code, or null when that code has no category page
// (mystery is a valid post category but isn't routed).
export function categoryPath(code?: string): string | null {
  if (!code) return null;
  const slug = CATEGORY_CODE_TO_SLUG[code];
  return slug ? `/${slug}` : null;
}
