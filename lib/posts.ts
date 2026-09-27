import {
  APPROVED_CLAUSE,
  PUBLISH_TIME_REACHED_CLAUSE,
} from "@/sanityStudio/lib/editorialStatus";

/**
 * The single definition of "this article should be visible to the public".
 *
 * Every `*[_type == "post"]` query on the site composes this. That is the whole
 * point — a review workflow that only some queries honour is not a workflow, it
 * is a leak. If you add a new post query, start it with this filter.
 *
 * Two clauses, for two different reasons:
 *
 * - **Status.** An *absent* `editorialStatus` counts as approved. The field was
 *   added long after the archive was, so the several hundred existing articles
 *   have no value; treating that as "not approved" would empty the site. New
 *   articles get `draft` from the schema's `initialValue`, so they are gated.
 * - **Date.** `publishedAt` in the future means not yet. Before this, post-dating
 *   an article published it immediately, so scheduling silently did nothing.
 *
 * GROQ's `now()` is used rather than an interpolated JS timestamp on purpose: a
 * timestamp would make the query string unique per request, so Next's fetch
 * cache would never hit and the `revalidate: 60` on these calls would be dead
 * weight. As a constant string it caches normally and Sanity evaluates the clock.
 */
export const LIVE_POST_FILTER = `_type == "post"
  && ${APPROVED_CLAUSE}
  && ${PUBLISH_TIME_REACHED_CLAUSE}`;

/**
 * Feed ordering for the home page, category pages and the headline ticker.
 *
 * `coalesce(priority, 0)` rather than bare `priority`: almost every article has
 * no priority set, and relying on how GROQ sorts nulls would put the entire
 * archive either above or below the handful of stories an editor has actually
 * ranked. Coalescing makes "untouched" mean 0 explicitly, so the fallback is
 * plain reverse-chronological — exactly the behaviour before priority existed.
 */
export const LIVE_POST_ORDER = `order(coalesce(priority, 0) desc, publishedAt desc)`;

/** Reverse-chronological only. For search, related stories and the sitemaps,
 * where an editor's front-page ranking is not the relevant sort. */
export const LIVE_POST_ORDER_BY_DATE = `order(publishedAt desc)`;

/**
 * The fields an article card needs. The home page alone repeats this projection
 * a dozen times, so it lives here — adding a field to cards should not mean
 * twelve chances to miss one.
 */
export const POST_CARD_PROJECTION = `_id, title, slug, category, mainImage, youtubeUrl, publishedAt, isBreaking`;

/**
 * The byline, dereferenced.
 *
 * Deliberately *not* part of `POST_CARD_PROJECTION`. That projection is used a
 * dozen times on the home page alone, and a join on every card would multiply
 * the query cost for a byline the card design has no room to show. Only the
 * article page and the author archive need this.
 */
export const AUTHOR_PROJECTION = `author->{_id, name, slug, designation, photo, bio, socialLinks}`;

/**
 * Articles by one staff member, for `/author/[slug]`.
 *
 * `isActive` is not tested here on purpose: a journalist leaving should not
 * unpublish their back catalogue or break links to it. The flag only governs
 * whether they appear as an option for new work.
 */
export const AUTHOR_POST_FILTER = `${LIVE_POST_FILTER}
  && author->slug.current == $authorSlug`;
