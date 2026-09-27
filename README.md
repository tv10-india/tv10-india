This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Hindi Audio

The article audio player uses a free Google Translate speech endpoint for Hindi audio, so no API key or billing setup is required. The browser's built-in speech voice remains the fallback if the free endpoint is unavailable or rate-limited.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Newsroom roles

The Studio at `/studio` recognises three roles. They are Sanity's built-in roles — the site does not maintain its own user table.

| Role | Can do | Cannot do |
| --- | --- | --- |
| **Viewer / Contributor** (writer) | Write and edit articles, save drafts, preview, **Submit for review** | Publish, unpublish or delete anything; manage staff profiles |
| **Editor** (approver) | Everything above, plus **Approve & publish** and **Send back to draft**; publish/unpublish/delete articles, advertisements and web stories | Add, edit or remove staff profiles |
| **Administrator** | Everything, including adding and removing staff profiles under **👥 Staff & Authors** | — |

Every writer's own work is listed under the **✍️ My articles** pane, which matches the `email` on their staff profile to their Sanity login. Set that field or the pane will be empty for them.

Every move through review is recorded on the article itself, under **Editorial History** — who submitted it, who approved it, and when. The field is read-only; it is written by the workflow buttons.

### Assigning a role

New members join as **administrator** by default, which means they can publish. To make the roles above take effect, demote writers after inviting them:

1. Open [manage.sanity.io](https://manage.sanity.io) and pick the TV10 India project.
2. Go to **Members**.
3. Click the member, then change **Role** — `Editor` for a desk editor who approves copy, `Viewer` (or `Contributor`, if the plan offers it) for a reporter who only files drafts.
4. The member signs out of `/studio` and back in. The Publish button disappears for them.

The signed-in user can check what their own account is allowed to do at any time under **🔑 Team & Access** in the Studio sidebar.

### What this is, and is not

This is a **guardrail, not a security boundary.** The role check runs in the Studio, in the browser. It stops a reporter publishing an unfinished story by mistake, which is the actual day-to-day risk. It does *not* stop someone with a Sanity API token writing to the dataset directly, because server-enforced custom roles are a paid Sanity plan feature and cannot be implemented from the Studio.

Treat API tokens accordingly: issue write tokens only to people who would be allowed to publish anyway, and revoke them in **manage.sanity.io → API → Tokens** when they are no longer needed.

## Maintenance scripts

One-off scripts live in `scripts/`. They all read `SANITY_API_TOKEN` from the environment and most accept `--dry-run`:

```powershell
# Windows / PowerShell
node scripts/backfill-authors.mjs --dry-run     # report only, writes nothing

$env:SANITY_API_TOKEN = "sk..."
node scripts/backfill-authors.mjs               # credit unattributed articles to the News Desk
```

```bash
# macOS / Linux
node scripts/backfill-authors.mjs --dry-run
SANITY_API_TOKEN=sk... node scripts/backfill-authors.mjs
```

PowerShell has no inline `VAR=value command` prefix — `SANITY_API_TOKEN=sk... node ...` is a parse error there, not a missing-token error. Set `$env:SANITY_API_TOKEN` on its own line first.

Generate the token at **manage.sanity.io → API → Tokens → Add API token** with **Editor** permissions — a Viewer token authenticates fine and then fails the first write with a 403. The website itself needs no write token — do not add one to `.env.local`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
