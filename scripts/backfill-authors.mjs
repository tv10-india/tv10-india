// Backfills a byline onto every `post` that has none.
//
// The `author` field was added long after the 371-article archive was imported,
// and it is `required()` — so until this runs, every legacy article shows a
// validation error in the Studio and the public byline falls back to the
// masthead. This attributes them all to a single "TV10 India News Desk" profile,
// which is what they were attributed to before staff profiles existed.
//
// Usage:
//   node scripts/backfill-authors.mjs --dry-run
//   SANITY_API_TOKEN=xxxx node scripts/backfill-authors.mjs
//
// Requires (for the real run): SANITY_API_TOKEN with Editor/write access
// (sanity.io/manage -> project -> API -> Tokens -> Add API token).
//
// Idempotent: it only touches posts where `author` is undefined, and the desk
// profile is created at a fixed _id, so re-running is a no-op.

import { createClient } from "@sanity/client";

const projectId = "uh81euwc";
const dataset = "production";
const apiVersion = "2024-01-01";

// Fixed _id so the profile is created once and re-runs reuse it rather than
// creating a second News Desk.
const DESK_ID = "author-news-desk";
const DESK_NAME = "TV10 India News Desk";
const DESK_SLUG = "tv10-india-news-desk";

const BATCH_SIZE = 100;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

// Trimmed, and stripped of quotes someone pasted along with the value. A token
// with a stray quote or newline fails with the same opaque 401 as a token for
// the wrong project, and the two are miserable to tell apart from the error.
const rawToken = process.env.SANITY_API_TOKEN;
const token = rawToken ? rawToken.trim().replace(/^["']|["']$/g, "") : undefined;

if (!dryRun && !token) {
  console.error("Missing SANITY_API_TOKEN env var (needed to write to Sanity). Use --dry-run to test without it.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const POSTS_WITHOUT_AUTHOR = '*[_type == "post" && !defined(author)]{_id}';

/**
 * Turns a 401/403 on the first read into a diagnosis.
 *
 * The dataset is public, so this read succeeds with no credentials at all.
 * If it fails *with* a token, the token is the problem — and re-running it
 * anonymously proves the project id and dataset are fine, which is the half
 * of the question the Sanity error message does not answer.
 */
async function explainAuthFailure() {
  const anon = createClient({projectId, dataset, apiVersion, useCdn: false});
  let reachable = false;
  try {
    await anon.fetch("count(*[_type == \"post\"])");
    reachable = true;
  } catch {
    reachable = false;
  }

  console.error("\nSanity rejected the token.\n");

  if (reachable) {
    console.error(
      `  Project "${projectId}" / dataset "${dataset}" are reachable without any\n` +
        "  credentials, so the project id is right and the dataset is fine. The token\n" +
        "  itself is being refused.\n",
    );
  } else {
    console.error(`  Project "${projectId}" / dataset "${dataset}" could not be reached at all.\n`);
  }

  console.error(
    "  \"Session does not match project host\" (SIO-401-AWH) means the credential is\n" +
      "  valid somewhere, just not here. Almost always one of:\n" +
      "\n" +
      `    1. The token was created in a different Sanity project. Tokens are\n` +
      `       project-scoped. Mint this one from the project's own page:\n` +
      `       https://manage.sanity.io/projects/${projectId}/api\n` +
      "         -> Tokens -> Add API token -> permission: Editor\n" +
      "       (Copy it immediately; Sanity shows the value once.)\n" +
      "\n" +
      "    2. It is a `sanity login` account session token, not a project API token.\n" +
      "       Those look similar and are not interchangeable.\n" +
      "\n" +
      "    3. It was truncated or mangled on paste.\n" +
      `       Length seen: ${token ? token.length : 0} characters` +
      (token && !/^sk[A-Za-z0-9]+$/.test(token)
        ? " - and it does not look like a project token (expected `sk` followed by letters and digits only).\n"
        : ".\n"),
  );

  console.error(
    "  In PowerShell, set it on its own line - there is no inline `VAR=value cmd` form:\n" +
      '    $env:SANITY_API_TOKEN = "sk..."\n' +
      "    node scripts/backfill-authors.mjs\n",
  );
}

async function main() {
  // Drafts are included on purpose. A draft with no author is exactly the
  // document that will block an editor at "Approve & publish", and it is
  // invisible to this query without a token — so the dry run undercounts by
  // however many drafts exist. That is expected, not a bug.
  let posts;
  try {
    posts = await client.fetch(POSTS_WITHOUT_AUTHOR);
  } catch (err) {
    const status = err?.statusCode || err?.response?.statusCode;
    if (status === 401 || status === 403) {
      await explainAuthFailure();
      process.exit(1);
    }
    throw err;
  }

  console.log(`Found ${posts.length} post(s) with no byline.`);

  if (posts.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (dryRun) {
    console.log(`Would create/reuse author "${DESK_NAME}" (_id: ${DESK_ID}, slug: ${DESK_SLUG})`);
    console.log(`Would patch ${posts.length} post(s) to reference it.`);
    console.log("Dry run - nothing written.");
    return;
  }

  await client.createIfNotExists({
    _id: DESK_ID,
    _type: "author",
    name: DESK_NAME,
    slug: { _type: "slug", current: DESK_SLUG },
    designation: "Newsroom",
    bio: "Reporting from the TV10 India newsroom.",
    isActive: true,
  });
  console.log(`Author ready: ${DESK_NAME} (${DESK_ID})`);

  let patched = 0;
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    const tx = batch.reduce(
      (transaction, post) =>
        transaction.patch(post._id, (patch) =>
          // setIfMissing, not set: if a human assigned a real byline between the
          // fetch above and this commit, do not overwrite it with the desk.
          patch.setIfMissing({ author: { _type: "reference", _ref: DESK_ID } }),
        ),
      client.transaction(),
    );
    await tx.commit();
    patched += batch.length;
    console.log(`  patched ${patched}/${posts.length}`);
  }

  console.log(`Done. ${patched} post(s) now credited to ${DESK_NAME}.`);
}

main().catch(async (err) => {
  // Sanity's ClientError stringifies as a 60-line object with the useful part
  // buried in `response.body`. Pull it out, then fall back to the raw error so
  // nothing is hidden.
  const status = err?.statusCode || err?.response?.statusCode;
  const body = err?.response?.body;

  console.error("\nBackfill failed.");
  if (status) console.error(`  HTTP ${status}`);
  const detail = body?.error?.description || body?.message || err?.message;
  if (detail) console.error(`  ${detail}`);

  // A 401/403 here means the writes were refused even though the read went
  // through — a token that can read but not write, i.e. Viewer rather than
  // Editor. Different cause from the read failing, so a different message.
  if (status === 401 || status === 403) {
    console.error(
      "\n  The read succeeded but the write was refused, which is what a Viewer token\n" +
        `  does. Re-mint it with Editor permission:\n` +
        `  https://manage.sanity.io/projects/${projectId}/api -> Tokens -> Add API token\n`,
    );
  }

  if (!status && !detail) console.error(err);
  process.exit(1);
});
