/**
 * Sanity's CDN already handles resizing and format conversion, so images are
 * served straight from it instead of going through the Next.js optimizer.
 *
 * This also sidesteps the optimizer's SSRF guard: on networks that use
 * DNS64/NAT64, cdn.sanity.io resolves to a 64:ff9b::/96 address, which
 * Next.js classifies as private and rejects with a 400.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.startsWith("https://cdn.sanity.io/")) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
