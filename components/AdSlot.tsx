import { getAdCreativeUrl } from "@/sanityStudio/lib/sanity";
import AdBanner, { type AdUnitName } from "./AdBanner";
import { AD_SLOTS, getActiveAds, pickAd, type AdSlotName } from "@/lib/ads";

type Props = {
  slot: AdSlotName;
  /**
   * Category code of the surrounding page (e.g. "up"). Bookings that target
   * specific categories only render when this matches.
   */
  category?: string;
  className?: string;
  /**
   * Whether to fall through to the AdSense unit when nothing is booked.
   * Set false for slots that should simply collapse when empty.
   */
  fallback?: boolean;
  /** Which AdSense unit backs this placement when nothing is booked. */
  adUnit?: AdUnitName;
};

/**
 * Renders the direct booking for a placement, falling back to the AdSense unit
 * when none is running. Direct-sold inventory takes precedence because it is
 * paid for by the slot rather than by impression.
 */
export default async function AdSlot({
  slot,
  category,
  className = "",
  fallback = true,
  adUnit,
}: Props) {
  const spec = AD_SLOTS[slot];
  const ad = pickAd(await getActiveAds(), slot, category);
  const desktopSrc = ad ? getAdCreativeUrl(ad.creative, spec.width) : null;

  if (!ad || !desktopSrc) {
    return fallback ? <AdBanner unit={adUnit} /> : null;
  }

  const mobileSrc = getAdCreativeUrl(ad.creativeMobile, 640);

  return (
    <aside
      className={`my-6 flex flex-col items-center ${className}`}
      aria-label={`${spec.label} advertisement`}
    >
      <span className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-400">
        Advertisement
      </span>
      <a
        href={ad.targetUrl}
        target="_blank"
        // "sponsored" keeps paid links from passing ranking signals, which
        // Google requires of news publishers.
        rel="sponsored noopener noreferrer"
        className="block w-full"
        style={{ maxWidth: spec.width }}
      >
        <picture>
          {/* 639.98px, not 639px: at a fractional viewport width (browser zoom,
              fractional DPR) neither `max-width: 639px` nor Tailwind's `sm:`
              breakpoint at 640px matches, and the slot would serve the desktop
              creative while the page around it is still laid out for mobile. */}
          {mobileSrc && <source media="(max-width: 639.98px)" srcSet={mobileSrc} />}
          {/* A plain <img> rather than next/image: the latter cannot express
              art-directed <source> switching, and these URLs are already sized
              by the Sanity CDN. width/height reserve the box so the ad does not
              shove the page down when it loads. */}
          <img
            src={desktopSrc}
            alt={ad.altText || `Advertisement${ad.advertiser ? ` from ${ad.advertiser}` : ""}`}
            width={spec.width}
            height={spec.height}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-md"
          />
        </picture>
      </a>
    </aside>
  );
}
