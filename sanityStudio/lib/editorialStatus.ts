/**
 * The editorial states a `post` moves through, shared by the schema, the
 * workflow document actions, the Studio dashboard and the front-end visibility
 * filter in `lib/posts.ts`.
 *
 * These strings are stored in the dataset, so they are effectively permanent —
 * changing a value here without a migration orphans every document holding the
 * old one.
 */

export const EDITORIAL_STATUS = {
  draft: 'draft',
  inReview: 'in-review',
  published: 'published',
} as const

export type EditorialStatus = (typeof EDITORIAL_STATUS)[keyof typeof EDITORIAL_STATUS]

/** The dropdown on the post schema. */
export const EDITORIAL_STATUS_OPTIONS = [
  {title: '✍️ Draft — still being written', value: EDITORIAL_STATUS.draft},
  {title: '👀 In review — waiting on an editor', value: EDITORIAL_STATUS.inReview},
  {title: '✅ Approved — may go live', value: EDITORIAL_STATUS.published},
]

/** Short badges for document previews and pane subtitles. */
export const EDITORIAL_STATUS_BADGES: Record<string, string> = {
  [EDITORIAL_STATUS.draft]: '✍️ Draft',
  [EDITORIAL_STATUS.inReview]: '👀 In review',
  [EDITORIAL_STATUS.published]: '✅ Approved',
}

/**
 * Articles created before this field existed have no value at all. They are the
 * bulk of the dataset and they are all legitimately live, so an absent status
 * has to read as approved — everywhere, or the site loses its archive.
 */
export function readStatus(value: unknown): EditorialStatus {
  return value === EDITORIAL_STATUS.draft || value === EDITORIAL_STATUS.inReview
    ? value
    : EDITORIAL_STATUS.published
}

/**
 * GROQ clauses, kept here so the Studio dashboard panes and the public site
 * filter (`LIVE_POST_FILTER` in `lib/posts.ts`) are provably the same test. A
 * dashboard that disagrees with the site about what is live is worse than no
 * dashboard — it is an editor confidently looking at the wrong answer.
 *
 * Plain strings with no import aliases, because this module is compiled both by
 * Next and by the standalone `sanity` CLI.
 */

/** Approved for the site — or old enough to predate the field. */
export const APPROVED_CLAUSE = `(!defined(editorialStatus) || editorialStatus == "${EDITORIAL_STATUS.published}")`

/** The publish time has arrived. */
export const PUBLISH_TIME_REACHED_CLAUSE = `defined(publishedAt) && dateTime(publishedAt) <= dateTime(now())`

/** Approved, but dated in the future — waiting to appear. */
export const SCHEDULED_CLAUSE = `defined(publishedAt) && dateTime(publishedAt) > dateTime(now())`

