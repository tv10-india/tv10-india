// One-off repair: decodes leftover HTML entities (e.g. &#8217;) in post titles
// that were migrated before the migration script decoded them, and regenerates
// the slug from the clean title (old slugs could contain stray entity digits
// like "...dehradun8217s...").
import { createClient } from "@sanity/client";
import * as cheerio from "cheerio";
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

function decodeHtml(str) {
  if (!str) return str;
  return cheerio.load(`<div>${str}</div>`)("div").text();
}

function slugify(title) {
  return transliterationSlugify(title || "", { lowercase: true, separator: "-" })
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

async function main() {
  const posts = await client.fetch('*[_type == "post" && defined(title)]{_id, title, "slug": slug.current}');
  console.log(`Checking ${posts.length} post(s) for HTML entities in title...`);

  let fixed = 0;
  for (const post of posts) {
    const cleanTitle = decodeHtml(post.title);
    if (cleanTitle === post.title) continue;

    let candidate = slugify(cleanTitle);
    let suffix = 1;
    while (
      candidate &&
      (await client.fetch('*[_type == "post" && slug.current == $s && _id != $id][0]{_id}', { s: candidate, id: post._id }))
    ) {
      suffix += 1;
      candidate = `${slugify(cleanTitle)}-${suffix}`;
    }

    const patch = { title: cleanTitle };
    if (candidate) patch.slug = { _type: "slug", current: candidate };

    await client.patch(post._id).set(patch).commit();
    fixed += 1;
    console.log(`  "${post.title}" -> "${cleanTitle}" (${post.slug} -> ${candidate})`);
  }
  console.log(`Fixed ${fixed} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
