import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const projectId = 'uh81euwc'
export const dataset = 'production'
export const apiVersion = '2024-01-01'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

// 3. HELPER FOR IMAGES
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  if (!source || (!source.asset && !source._ref)) {
    return { url: () => '' }
  }
  try {
      return builder.image(source).auto('format').quality(75)
  } catch {
    return { url: () => '' }
  }
}
<<<<<<< HEAD
=======

// Falls back to the site logo when a post has no image, so cards/thumbnails
// never render blank.
export function getImageUrl(source: any, fallback = '/logo.png') {
  if (!source || (!source.asset && !source._ref)) return fallback
  const url = urlFor(source).url()
  return url || fallback
}

// Social share previews (WhatsApp/Facebook/Twitter) silently drop oversized
// images. This produces a compressed, standard-size (1200x630) JPEG crop so
// og:image always loads reliably — forcing jpg (rather than auto-format)
// guarantees real compression even for crawlers that send no Accept header.
export function getOgImageUrl(source: any, fallback = '/logo.png') {
  if (!source || (!source.asset && !source._ref)) return fallback
  try {
    const url = builder.image(source).width(1200).height(630).fit('crop').format('jpg').quality(70).url()
    return url || fallback
  } catch {
    return fallback
  }
}

// Ad creatives are supplied by the advertiser at a fixed size, so they are
// scaled to fit rather than cropped — losing a phone number or logo off the
// edge of a paid booking is worse than letterboxing. Requested at 2x for
// retina. Returns null (not a placeholder) so the caller can fall back to
// house/network inventory instead of rendering a broken slot.
export function getAdCreativeUrl(source: any, width: number): string | null {
  if (!source || (!source.asset && !source._ref)) return null
  try {
    return builder.image(source).width(width * 2).fit('max').auto('format').quality(80).url() || null
  } catch {
    return null
  }
}

// Staff photographs. Always a square centre-crop, requested at 2x for retina —
// bylines and profile headers are the only places a person's face appears, and a
// stretched or letterboxed portrait looks worse than no photo. Returns null (not
// the site logo) so the caller can fall back to initials instead of putting a
// TV10 badge where a face should be.
//
// Typed rather than `any` like its neighbours above: this one is called from the
// app with values already typed as `SanityImage`, so there is nothing to gain
// from widening it. The cast is the untyped-GROQ boundary, narrowed by the guard
// on the line before it.
type ImageRef = {asset?: {_ref?: string}; _ref?: string} | null | undefined

export function getAvatarUrl(source: ImageRef, size: number): string | null {
  if (!source || (!source.asset && !source._ref)) return null
  try {
    return (
      builder
        .image(source as SanityImageSource)
        .width(size * 2)
        .height(size * 2)
        .fit('crop')
        .auto('format')
        .quality(80)
        .url() || null
    )
  } catch {
    return null
  }
}

// Structured-data images. Google picks whichever crop suits the surface it is
// rendering (Search, Discover, Top Stories), so supply 16:9, 4:3 and 1:1.
// URLs must be absolute — pass an absolute fallback.
export function getJsonLdImages(source: any, fallback?: string): string[] {
  const fallbackList = fallback ? [fallback] : []
  if (!source || (!source.asset && !source._ref)) return fallbackList
  try {
    const ratios: Array<[number, number]> = [
      [1200, 675],
      [1200, 900],
      [1200, 1200],
    ]
    const urls = ratios
      .map(([width, height]) =>
        builder.image(source).width(width).height(height).fit('crop').format('jpg').quality(75).url(),
      )
      .filter(Boolean)
    return urls.length ? urls : fallbackList
  } catch {
    return fallbackList
  }
}
>>>>>>> 176d453 (Update V1.5)
