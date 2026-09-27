// One-off repair: regenerates English (romanized) slugs for posts that were
// migrated with Devanagari slugs, to match the site-wide English-slug convention.
import { createClient } from "@sanity/client";
import { slugify as transliterationSlugify } from "transliteration";

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error("Missing SANITY_API_TOKEN env var.");
  process.exit(1);
}

const client = createClient({
  projectId: "uh81euwc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

function slugify(title) {
  return transliterationSlugify(title || "", { lowercase: true, separator: "-" })
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

// Matches Devanagari Unicode block.
const hasDevanagari = (s) => /[\u0900-\u097F]/.test(s || "");

async function main() {
  const posts = await client.fetch('*[_type == "post" && defined(slug.current)]{_id, title, "slug": slug.current}');
  const toFix = posts.filter((p) => hasDevanagari(p.slug));
  console.log(`Found ${toFix.length} post(s) with Devanagari slugs.`);

  let fixed = 0;
  for (const post of toFix) {
    let newSlug = slugify(post.title);
    if (!newSlug) continue;

    // Ensure uniqueness in case of duplicate romanized titles.
    let candidate = newSlug;
    let suffix = 1;
    while (await client.fetch('*[_type == "post" && slug.current == $s && _id != $id][0]{_id}', { s: candidate, id: post._id })) {
      suffix += 1;
      candidate = `${newSlug}-${suffix}`;
    }

    await client.patch(post._id).set({ slug: { _type: "slug", current: candidate } }).commit();
    fixed += 1;
    console.log(`  ${post.slug} -> ${candidate}`);
  }
  console.log(`Fixed ${fixed} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
