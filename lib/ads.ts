import { client } from "@/sanityStudio/lib/sanity";
import type { BodyBlock, SanityImage } from "@/types/content";

/**
 * Ad placements. The keys are the contract between the Studio (the `slots`
 * field on the `advertisement` schema) and the pages that render `<AdSlot />`,
 * so changing one means changing both.
 *
 * `width`/`height` are the box the page reserves. They are used as the image's
 * intrinsic size so the slot occupies its final height before the creative
 * loads — an ad that pops in and shoves the article down is the classic source
 * of layout shift on news sites.
 */
export const AD_SLOTS = {
  "header-leaderboard": { label: "Header Leaderboard", width: 970, height: 90 },
  "hero-below": { label: "Below Hero", width: 970, height: 250 },
  "feed-inline": { label: "In-Feed", width: 728, height: 90 },
  "article-inline": { label: "Article Sidebar", width: 300, height: 250 },
  "article-below": { label: "Below Article", width: 336, height: 280 },
  "category-top": { label: "Category Top", width: 970, height: 90 },
  footer: { label: "Footer", width: 970, height: 90 },
} as const;

export type AdSlotName = keyof typeof AD_SLOTS;

export type Advertisement = {
  _id: string;
  advertiser?: string;
  creative?: SanityImage;
  creativeMobile?: SanityImage;
  altText?: string;
  targetUrl: string;
  slots?: string[];
  categories?: string[];
  startDate?: string;
  endDate?: string;
  weight?: number;
};

// Every bookable ad in one query. Each <AdSlot /> filters this list in memory
// rather than querying per slot: a page has up to three slots, the dataset is
// tiny, and Next dedupes the identical fetch across them.
const ACTIVE_ADS_QUERY = `*[
  _type == "advertisement"
  && isActive == true
  && defined(targetUrl)
  && defined(creative.asset)
]{
  _id, advertiser, creative, creativeMobile, altText, targetUrl,
  slots, categories, startDate, endDate, weight
}`;

export async function getActiveAds(): Promise<Advertisement[]> {
  try {
    return await client.fetch<Advertisement[]>(
      ACTIVE_ADS_QUERY,
      {},
      { next: { revalidate: 60 } },
    );
  } catch {
    // A CMS outage should cost the page its ads, not the article.
    return [];
  }
}

/** True when `now` falls inside the booking's date window. */
export function isWithinFlight(ad: Advertisement, now: number = Date.now()): boolean {
  if (ad.startDate && new Date(ad.startDate).getTime() > now) return false;
  if (ad.endDate && new Date(ad.endDate).getTime() < now) return false;
  return true;
}

function normalisedWeight(ad: Advertisement): number {
  const weight = Math.floor(ad.weight ?? 1);
  return Number.isFinite(weight) && weight > 0 ? weight : 1;
}

export function eligibleAds(
  ads: Advertisement[],
  slot: AdSlotName,
  category?: string,
  now: number = Date.now(),
): Advertisement[] {
  return ads.filter((ad) => {
    if (!ad.slots?.includes(slot)) return false;
    if (!isWithinFlight(ad, now)) return false;
    // No categories set means the booking runs site-wide.
    if (ad.categories?.length) {
      if (!category || !ad.categories.includes(category)) return false;
    }
    return true;
  });
}

/**
 * Weighted random pick among the ads booked for this slot.
 *
 * The choice is made on the server, so it is baked into the cached HTML and
 * rotates when the page revalidates (60s) rather than per visitor. That is
 * accurate enough for a handful of direct bookings; true per-impression
 * rotation would need client-side selection and impression logging.
 */
export function pickAd(
  ads: Advertisement[],
  slot: AdSlotName,
  category?: string,
): Advertisement | null {
  const candidates = eligibleAds(ads, slot, category);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const total = candidates.reduce((sum, ad) => sum + normalisedWeight(ad), 0);
  let roll = Math.random() * total;
  for (const ad of candidates) {
    roll -= normalisedWeight(ad);
    if (roll <= 0) return ad;
  }
  return candidates[candidates.length - 1];
}

/**
 * Shortest article that gets an in-article ad, in body blocks.
 *
 * The article page already carries a sidebar unit and one below the text. On a
 * short story any mid-body split puts a third unit within a screen of those
 * two, which is what Google's "allow for sufficient content in between ads"
 * guidance exists to prevent. Below this length the unit is simply omitted.
 */
export const MIN_BLOCKS_FOR_IN_ARTICLE_AD = 6;

/** A split at index `i` puts blocks[0..i) above the ad and blocks[i..] below. */
function isSplittable(blocks: BodyBlock[], i: number): boolean {
  // Only a boundary with a list item on *both* sides is inside a list, where
  // splitting would render one list as two with an ad wedged between and
  // restart an ordered list's numbering below the break. The first and last
  // edges of a list are clean places to break.
  return !(blocks[i - 1]?.listItem && blocks[i]?.listItem);
}

/**
 * Where to break the article body for the in-article ad, or null to leave the
 * body whole.
 *
 * Aims for the midpoint, then walks outward to the nearest boundary that is not
 * inside a list. Never returns 0 or `blocks.length`, since a "mid-article" ad
 * above the first paragraph or below the last is just another banner.
 */
export function inArticleSplitIndex(
  blocks: BodyBlock[] | undefined,
  minBlocks: number = MIN_BLOCKS_FOR_IN_ARTICLE_AD,
): number | null {
  if (!blocks || blocks.length < minBlocks) return null;

  const midpoint = Math.floor(blocks.length / 2);
  for (let offset = 0; offset < blocks.length; offset++) {
    for (const i of [midpoint - offset, midpoint + offset]) {
      if (i <= 0 || i >= blocks.length) continue;
      if (isSplittable(blocks, i)) return i;
    }
  }
  // Every boundary falls inside one long list.
  return null;
}
