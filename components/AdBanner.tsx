"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// The AdSense loader in app/layout.tsx creates this queue; pushing to it is how
// a slot asks to be filled. Declared here so the push below needs no `any`.
declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

// How long to wait for AdSense to claim the slot before assuming it never will.
// Covers the cases that never set data-ad-status at all: script blocked, the
// site not yet approved, or no network.
const FILL_TIMEOUT_MS = 3000;

// Same variable the loader in app/layout.tsx reads, so the publisher ID can
// never drift between the script tag and the units it is meant to fill.
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-8748522674365627";

/**
 * AdSense ad units, as created in the AdSense dashboard.
 *
 * `slot` is a `data-ad-slot` value and has nothing to do with the placement
 * names in `AD_SLOTS` (lib/ads.ts) — one is Google's inventory, the other is
 * ours. `format` is what distinguishes the products:
 *
 * - `auto`      responsive display banner. Sizes to its container, so one unit
 *               can back several placements at different widths.
 * - `fluid`     native. Inherits the surrounding typography. The variant is set
 *               by `layout` ("in-article") or `layoutKey` (in-feed) — a fluid
 *               unit with neither is not a complete unit.
 * - `autorelaxed` Multiplex: a self-sizing grid of recommended content.
 *
 * `style` is Google's own snippet style for the unit, kept verbatim per unit
 * rather than derived, because the formats agree on nothing but `display`.
 */
type AdUnitSpec = {
  slot: string;
  format: "auto" | "fluid" | "autorelaxed";
  /** In-article native units only. */
  layout?: "in-article";
  /** In-feed native units only; generated with the unit in the AdSense UI. */
  layoutKey?: string;
  /** Display units only — AdSense ignores it on the native and multiplex ones. */
  fullWidthResponsive?: boolean;
  style: CSSProperties;
};

export type AdUnitName = "article" | "all" | "inArticle" | "inFeed" | "multiplex";

const DISPLAY_STYLE: CSSProperties = { display: "block", width: "100%" };

export const AD_UNITS: Record<AdUnitName, AdUnitSpec> = {
  article: {
    slot: "5172933029",
    format: "auto",
    fullWidthResponsive: true,
    style: DISPLAY_STYLE,
  },
  all: {
    slot: "5318828795",
    format: "auto",
    fullWidthResponsive: true,
    style: DISPLAY_STYLE,
  },
  inArticle: {
    slot: "5306386352",
    format: "fluid",
    layout: "in-article",
    style: { display: "block", textAlign: "center" },
  },
  inFeed: {
    slot: "4826802372",
    format: "fluid",
    layoutKey: "-fb+5w+4e-db+86",
    // No width or text-align: an in-feed unit lays itself out to look like the
    // cards around it, and overriding either is what makes it look wrong.
    style: { display: "block" },
  },
  multiplex: {
    slot: "5948312353",
    format: "autorelaxed",
    style: { display: "block" },
  },
};

type Props = {
  /** Which AdSense unit to request. Defaults to the article unit already live. */
  unit?: AdUnitName;
};

export default function AdBanner({ unit = "article" }: Props) {
  const spec = AD_UNITS[unit];
  const containerRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    const ins = insRef.current;
    if (!el || !ins || el.offsetWidth === 0) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }

    // AdSense stamps data-ad-status="unfilled" when it has nothing to serve.
    // Left alone the slot keeps its reserved height, which renders as a tall
    // block of empty page rather than as an absent ad.
    const observer = new MutationObserver(() => {
      if (ins.getAttribute("data-ad-status") === "unfilled") setUnfilled(true);
    });
    observer.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });

    const timer = setTimeout(() => {
      if (!ins.getAttribute("data-ad-status") && ins.clientHeight === 0) setUnfilled(true);
    }, FILL_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (unfilled) return null;

  // Display banners get centred in the column and clipped if the creative
  // overshoots its container, which is what kept wide units from causing a
  // horizontal scrollbar on mobile. The native and multiplex formats get
  // neither: they lay themselves out to match their surroundings, and Google
  // warns that constraining them — a fixed height especially, but inherited
  // alignment too — is what produces distorted ads. The wrapper's height stays
  // free to grow in every case.
  const isDisplay = spec.format === "auto";

  return (
    // No background tint: until AdSense fills the slot this element is visible,
    // and a coloured box is indistinguishable from a broken image.
    <div
      ref={containerRef}
      className={`my-6 w-full${isDisplay ? " overflow-hidden text-center" : ""}`}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={spec.style}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={spec.slot}
        data-ad-format={spec.format}
        data-ad-layout={spec.layout}
        data-ad-layout-key={spec.layoutKey}
        data-full-width-responsive={spec.fullWidthResponsive ? "true" : undefined}
      ></ins>
    </div>
  );
}
