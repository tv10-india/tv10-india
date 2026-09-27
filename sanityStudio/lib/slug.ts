import {slugify} from 'transliteration'

/**
 * The project's one slug rule.
 *
 * Transliteration rather than a plain lowercase/replace: headlines and staff
 * names are written in Devanagari, and a naive slugifier would strip them to
 * nothing. `slugify` from `transliteration` romanises first, so
 * "रवि कुमार" becomes "ravi-kumar" instead of an empty string.
 *
 * Shared by `post` and `author` because the two must agree — `/author/...` and
 * `/news/...` are built the same way, and a second implementation that drifted
 * would produce URLs that resolve on one route and 404 on the other.
 */
export function createSlug(input: unknown): string {
  const source = typeof input === 'string' ? input.trim() : ''
  if (!source) return ''

  return slugify(source, {lowercase: true, separator: '-'})
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    // Re-trim: the 96-character cut can land mid-word and leave a trailing dash.
    .replace(/-+$/g, '')
}
