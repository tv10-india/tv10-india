// One-off repair: removes the duplicate inline image from `body` when it's
// the same asset as `mainImage` (happens when the migration script fell back
// to using the first inline image as mainImage but left a copy in body).
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

async function main() {
  const posts = await client.fetch(
    '*[_type == "post" && defined(mainImage) && defined(body)]{_id, mainImage, body}'
  );
  console.log(`Checking ${posts.length} post(s) for duplicate inline image...`);

  let fixed = 0;
  for (const post of posts) {
    const mainRef = post.mainImage?.asset?._ref;
    if (!mainRef) continue;

    const dupIndex = post.body.findIndex((b) => b._type === "image" && b.asset?._ref === mainRef);
    if (dupIndex === -1) continue;

    const newBody = post.body.slice();
    newBody.splice(dupIndex, 1);
    await client.patch(post._id).set({ body: newBody }).commit();
    fixed += 1;
    console.log(`  fixed ${post._id}`);
  }
  console.log(`Fixed ${fixed} post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
