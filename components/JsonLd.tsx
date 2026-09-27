type JsonLdData = Record<string, unknown>;

/**
 * Renders a schema.org JSON-LD block.
 *
 * "<" is escaped because article titles and descriptions come from the CMS —
 * an unescaped "</script>" in that text would break out of the tag.
 */
export default function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
