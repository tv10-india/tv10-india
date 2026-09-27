// Repairs already-migrated posts that ended up with no mainImage/body images
// because the old parser didn't descend into WP wrapper tags (e.g.
// <div class="wp-block-image"><figure><img/></figure></div>).
// Re-fetches each affected post from the live WordPress API by slug and
// reprocesses it with the fixed parser, then patches body + mainImage.
//
// Usage:
//   $env:SANITY_API_TOKEN="..."
//   node scripts/fix-missing-images.mjs --resolve=www.tv10india.com:62.72.28.167

import { createClient } from "@sanity/client";
import * as cheerio from "cheerio";
import { lookup as dnsLookup } from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";

const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error("Missing SANITY_API_TOKEN env var.");
  process.exit(1);
}

const args = process.argv.slice(2);
const getFlag = (name) => {
  const index = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (index === -1) return undefined;
  const arg = args[index];
  return arg.includes("=") ? arg.split("=")[1] : true;
};

const apiBase = getFlag("api") || "https://www.tv10india.com";
const limit = getFlag("limit") ? Number(getFlag("limit")) : Infinity;
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
  projectId: "uh81euwc",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

let keyCounter = 0;
function newKey() {
  keyCounter += 1;
  return `${Date.now().toString(36)}${keyCounter.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const imageAssetCache = new Map();
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
    const childEls = (el.children || []).filter((c) => c.type === "tag");
    if (childEls.length) {
      for (const child of childEls) await processElement(child);
      return;
    }
    const text = $(el).text().trim();
    if (text) blocks.push({ _type: "block", _key: newKey(), style: "normal", children: [{ _type: "span", _key: newKey(), text, marks: [] }], markDefs: [] });
  }

  const children = $("body").children().length ? $("body").children().toArray() : $.root().children().toArray();
  for (const el of children) await processElement(el);
  return blocks;
}

async function fetchWpPostByTitle(title) {
  const root = apiBase.replace(/\/$/, "");
  const res = await fetch(`${root}/wp-json/wp/v2/posts?search=${encodeURIComponent(title)}&per_page=5&_embed`);
  if (!res.ok) return null;
  const list = await res.json();
  // WP search can return close matches; only accept an exact title match.
  return list.find((p) => p.title?.rendered?.trim() === title.trim()) || null;
}

async function main() {
  const posts = await client.fetch('*[_type == "post" && !defined(mainImage)]{_id, title, "slug": slug.current}');
  console.log(`Found ${posts.length} post(s) with no mainImage. Processing up to ${limit === Infinity ? posts.length : limit}...`);

  let fixed = 0;
  for (const post of posts.slice(0, limit)) {
    const wpPost = await fetchWpPostByTitle(post.title);
    if (!wpPost) {
      console.log(`  - ${post.slug}: not found on WordPress, skipping`);
      continue;
    }

    const body = await htmlToPortableText(wpPost.content?.rendered);
    const featuredUrl = wpPost._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
    const usedInlineImageIndex = featuredUrl ? -1 : body.findIndex((b) => b._type === "image");
    const mainImageRaw = featuredUrl ? await uploadImageFromUrl(featuredUrl) : body[usedInlineImageIndex];
    if (!mainImageRaw) {
      console.log(`  - ${post.slug}: still no image available, skipping`);
      continue;
    }
    const mainImage = (({ _key, ...rest }) => rest)(mainImageRaw);
    if (usedInlineImageIndex !== -1) body.splice(usedInlineImageIndex, 1); // avoid showing it twice (mainImage + inline)

    await client.patch(post._id).set({ body, mainImage }).commit();
    fixed += 1;
    console.log(`  fixed ${post.slug}`);
  }
  console.log(`Fixed ${fixed} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
