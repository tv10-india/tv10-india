// One-off repair: adds missing `_key` to body blocks/spans on existing `post` documents
// created before the migration script generated keys. Safe to re-run (idempotent).
import { createClient } from "@sanity/client";

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

let keyCounter = 0;
function newKey() {
  keyCounter += 1;
  return `${Date.now().toString(36)}${keyCounter.toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function fixBody(body) {
  if (!Array.isArray(body)) return { body, changed: false };
  let changed = false;
  const fixed = body.map((item) => {
    const next = { ...item };
    if (!next._key) {
      next._key = newKey();
      changed = true;
    }
    if (Array.isArray(next.children)) {
      next.children = next.children.map((child) => {
        if (!child._key) {
          changed = true;
          return { ...child, _key: newKey() };
        }
        return child;
      });
    }
    return next;
  });
  return { body: fixed, changed };
}

async function main() {
  const posts = await client.fetch('*[_type == "post"]{_id, body}');
  console.log(`Checking ${posts.length} post(s) for missing _key...`);

  let patched = 0;
  for (const post of posts) {
    const { body, changed } = fixBody(post.body);
    if (!changed) continue;
    await client.patch(post._id).set({ body }).commit();
    patched += 1;
    console.log(`  fixed ${post._id}`);
  }
  console.log(`Patched ${patched} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
