// Migrates WordPress posts into Sanity `post` documents.
//
// Usage:
//   From a WXR export file (WP Admin -> Tools -> Export -> All content):
//     SANITY_API_TOKEN=xxxx node scripts/migrate-wordpress.mjs --xml ./wordpress-export.xml
//
//   From a live WordPress REST API:
//     SANITY_API_TOKEN=xxxx node scripts/migrate-wordpress.mjs --api https://old-site.example.com
//
// Optional flags:
//   --dry-run        Parse and print what would be created, without writing to Sanity.
//   --limit=20       Only process the first N posts (useful for testing).
//   --resolve=host:ip Force a hostname to resolve to a specific IP (bypasses DNS/cache issues
//                     that can occur once the domain has been migrated to a new host).
//
// Requires: SANITY_API_TOKEN env var with Editor/write access
// (sanity.io/manage -> project -> API -> Tokens -> Add API token).

import { createClient } from "@sanity/client";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import { lookup as dnsLookup } from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { slugify as transliterationSlugify } from "transliteration";

const projectId = "uh81euwc";
const dataset = "production";
const apiVersion = "2024-01-01";

const args = process.argv.slice(2);
const getFlag = (name) => {
  const index = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (index === -1) return undefined;
  const arg = args[index];
  if (arg.includes("=")) return arg.split("=")[1];
  const next = args[index + 1];
  return next && !next.startsWith("--") ? next : true;
};

const xmlPath = getFlag("xml");
const apiBase = getFlag("api");
const dryRun = Boolean(getFlag("dry-run"));
const limit = getFlag("limit") ? Number(getFlag("limit")) : Infinity;

const token = process.env.SANITY_API_TOKEN;
if (!dryRun && !token) {
  console.error("Missing SANITY_API_TOKEN env var (needed to write to Sanity). Use --dry-run to test without it.");
  process.exit(1);
}
if (!xmlPath && !apiBase) {
  console.error("Provide either --xml <path-to-wxr-export.xml> or --api <https://old-site.com>");
  process.exit(1);
}

// Optional forced host->IP override, e.g. --resolve=www.tv10india.com:62.72.28.167
const resolveFlag = getFlag("resolve");
if (resolveFlag && typeof resolveFlag === "string") {
  const [forcedHost, forcedIp] = resolveFlag.split(":");
  setGlobalDispatcher(
    new Agent({
      connect: {
        lookup: (hostname, options, callback) => {
          if (hostname === forcedHost) return callback(null, [{ address: forcedIp, family: 4 }]);
          dnsLookup(hostname, options, callback);
        },
      },
    })
  );
  console.log(`Forcing ${forcedHost} -> ${forcedIp}`);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// Map WordPress category/tag names to this site's fixed category values.
const CATEGORY_MAP = [
  { match: /uttar\s*pradesh|\bup\b/i, value: "up" },
  { match: /uttarakhand|\buk\b/i, value: "uk" },
  { match: /delhi|ncr/i, value: "delhi" },
  { match: /national|india/i, value: "national" },
  { match: /world|international/i, value: "world" },
  { match: /dharma|religion|spiritual/i, value: "dharma" },
  { match: /business|economy|finance/i, value: "business" },
  { match: /sports?/i, value: "sports" },
  { match: /videos?/i, value: "videos" },
  { match: /mystery|adbhut/i, value: "mystery" },
  { match: /lifestyle/i, value: "lifestyle" },
];

function mapCategory(names = []) {
  for (const name of names) {
    const hit = CATEGORY_MAP.find((c) => c.match.test(name));
    if (hit) return hit.value;
  }
  return "national";
}

function slugify(title) {
  return transliterationSlugify(title || "", { lowercase: true, separator: "-" })
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

// WordPress's title.rendered field keeps raw HTML entities (e.g. &#8217;)
// unlike content.rendered, which we already parse through cheerio.
function decodeHtml(str) {
  if (!str) return str;
  return cheerio.load(`<div>${str}</div>`)("div").text();
}

const imageAssetCache = new Map();

let keyCounter = 0;
function newKey() {
  keyCounter += 1;
  return `${Date.now().toString(36)}${keyCounter.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

async function uploadImageFromUrl(url) {
  if (!url) return null;
  if (imageAssetCache.has(url)) return { ...imageAssetCache.get(url), _key: newKey() };
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = url.split("/").pop()?.split("?")[0] || "image.jpg";
    const asset = await client.assets.upload("image", buffer, { filename });
    const ref = { _type: "image", asset: { _type: "reference", _ref: asset._id }, options: { hotspot: true } };
    imageAssetCache.set(url, ref);
    return { ...ref, _key: newKey() };
  } catch (err) {
    console.warn(`  ! Failed to upload image ${url}: ${err.message}`);
    return null;
  }
}

// Converts a chunk of WordPress post HTML into Sanity Portable Text blocks + inline image blocks.
async function htmlToPortableText(html) {
  const $ = cheerio.load(html || "", { decodeEntities: true });
  const blocks = [];

  const inlineToSpans = (el) => {
    const spans = [];
    const walk = (node, marks = []) => {
      if (node.type === "text") {
        const text = $(node).text();
        if (text) spans.push({ _type: "span", _key: newKey(), text, marks: [...marks] });
        return;
      }
      if (node.type === "tag") {
        const tag = node.tagName?.toLowerCase();
        const nextMarks = [...marks];
        if (tag === "strong" || tag === "b") nextMarks.push("strong");
        if (tag === "em" || tag === "i") nextMarks.push("em");
        (node.children || []).forEach((child) => walk(child, nextMarks));
      }
    };
    (el.children || []).forEach((child) => walk(child));
    return spans.length ? spans : [{ _type: "span", _key: newKey(), text: $(el).text() || "", marks: [] }];
  };

  const children = $("body").children().length ? $("body").children().toArray() : $.root().children().toArray();

  // Recursively processes an element: handles known block tags directly, and
  // descends into wrapper tags (div, figure, section, etc. - common in WP
  // Gutenberg block markup) so nested images/text aren't silently dropped.
  async function processElement(el) {
    const tag = el.tagName?.toLowerCase();
    if (tag === "img") {
      const imageBlock = await uploadImageFromUrl($(el).attr("src"));
      if (imageBlock) blocks.push(imageBlock);
      return;
    }
    if (tag === "p" || /^h[1-6]$/.test(tag || "") || tag === "blockquote") {
      const imgs = $(el).find("img");
      for (const img of imgs.toArray()) {
        const imageBlock = await uploadImageFromUrl($(img).attr("src"));
        if (imageBlock) blocks.push(imageBlock);
      }
      const style = tag === "blockquote" ? "blockquote" : /^h[1-6]$/.test(tag) ? tag : "normal";
      const spans = inlineToSpans(el);
      if (spans.some((s) => s.text.trim())) {
        blocks.push({ _type: "block", _key: newKey(), style, children: spans, markDefs: [] });
      }
      return;
    }
    if (tag === "ul" || tag === "ol") {
      $(el)
        .find("li")
        .each((_, li) => {
          blocks.push({
            _type: "block",
            _key: newKey(),
            style: "normal",
            listItem: tag === "ul" ? "bullet" : "number",
            level: 1,
            children: inlineToSpans(li),
            markDefs: [],
          });
        });
      return;
    }
    // Wrapper/unknown container (e.g. WP's <div class="wp-block-image"><figure><img/></figure></div>):
    // descend into children instead of dropping them.
    const childEls = (el.children || []).filter((c) => c.type === "tag");
    if (childEls.length) {
      for (const child of childEls) await processElement(child);
      return;
    }
    const text = $(el).text().trim();
    if (text) blocks.push({ _type: "block", _key: newKey(), style: "normal", children: [{ _type: "span", _key: newKey(), text, marks: [] }], markDefs: [] });
  }

  for (const el of children) {
    await processElement(el);
  }

  return blocks;
}

async function loadFromXml(path) {
  const xml = await fs.readFile(path, "utf-8");
  const parser = new XMLParser({ ignoreAttributes: false, textNodeName: "#text" });
  const doc = parser.parse(xml);
  const items = [].concat(doc?.rss?.channel?.item || []);
  return items
    .filter((item) => item["wp:post_type"] === "post" && item["wp:status"] === "publish")
    .map((item) => {
      const categories = [].concat(item.category || []).map((c) => (typeof c === "string" ? c : c["#text"]));
      return {
        title: decodeHtml(item.title),
        html: item["content:encoded"],
        date: item["wp:post_date"],
        categories,
        featuredImage: null, // WXR doesn't include a direct featured image URL; handled via attachments if needed.
      };
    });
}

async function loadFromApi(base) {
  const root = base.replace(/\/$/, "");
  const posts = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${root}/wp-json/wp/v2/posts?per_page=50&page=${page}&_embed`);
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    posts.push(...batch);
    if (batch.length < 50) break;
    page += 1;
  }
  return posts.map((p) => ({
    title: decodeHtml(p.title?.rendered),
    html: p.content?.rendered,
    date: p.date,
    categories: (p._embedded?.["wp:term"]?.[0] || []).map((t) => t.name),
    featuredImage: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
  }));
}

async function main() {
  const posts = xmlPath ? await loadFromXml(xmlPath) : await loadFromApi(apiBase);
  console.log(`Found ${posts.length} post(s). Processing up to ${limit === Infinity ? posts.length : limit}...`);

  let created = 0;
  for (const post of posts.slice(0, limit)) {
    const title = (post.title || "").trim();
    if (!title) continue;
    const slug = slugify(title);
    console.log(`- ${title} (${slug})`);

    if (dryRun) {
      created += 1;
      continue;
    }

    const existing = await client.fetch(`*[_type == "post" && slug.current == $slug][0]{_id}`, { slug });
    if (existing) {
      console.log("  already exists, skipping");
      continue;
    }

    const body = await htmlToPortableText(post.html);
    const usedInlineImageIndex = post.featuredImage ? -1 : body.findIndex((b) => b._type === "image");
    const mainImageRaw = post.featuredImage
      ? await uploadImageFromUrl(post.featuredImage)
      : body[usedInlineImageIndex]; // fall back to first inline image when WP has no featured image set
    const mainImage = mainImageRaw ? (({ _key, ...rest }) => rest)(mainImageRaw) : undefined;
    if (usedInlineImageIndex !== -1) body.splice(usedInlineImageIndex, 1); // avoid showing it twice (mainImage + inline)

    await client.create({
      _type: "post",
      title,
      slug: { _type: "slug", current: slug },
      category: mapCategory(post.categories),
      body,
      ...(mainImage ? { mainImage } : {}),
      publishedAt: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
    });
    created += 1;
  }

  console.log(`${dryRun ? "Would create" : "Created"} ${created} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
