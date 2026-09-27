/**
 * XML text-node escaping for the hand-built feeds (`/news-sitemap.xml`).
 *
 * Next's `MetadataRoute.Sitemap` can't express the `news:` namespace, so that
 * document is assembled as a string — which means every interpolated value has
 * to be escaped here. This is not cosmetic: one unescaped `&` in one headline
 * makes the whole document unparseable, and Google drops every article in it,
 * not just the offending one.
 */

/**
 * Removes characters that are illegal in XML 1.0 even when escaped — the C0
 * control range apart from tab, newline and carriage return, plus DEL. These
 * arrive in headlines pasted out of Word or a wire feed.
 */
export function stripInvalidXmlChars(value: string): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isAllowedControl = code === 0x09 || code === 0x0a || code === 0x0d;
    if (code < 0x20 && !isAllowedControl) continue;
    if (code === 0x7f) continue;
    out += char;
  }
  return out;
}

/**
 * Escapes a string for use as XML character data. `&` is replaced first, or the
 * ampersands introduced by the later replacements would be escaped again and
 * `<` would come out as `&amp;lt;`.
 */
export function xmlEscape(value: string): string {
  return stripInvalidXmlChars(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
