import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {apiVersion} from './env'
import {
  APPROVED_CLAUSE,
  EDITORIAL_STATUS,
  PUBLISH_TIME_REACHED_CLAUSE,
  SCHEDULED_CLAUSE,
} from './lib/editorialStatus'
import TeamAccessPane from './components/TeamAccessPane'
import AnalyticsPane from './components/AnalyticsPane'

/**
 * The newsroom dashboard.
 *
 * This replaces the stock `S.documentTypeListItems()`, which was a single
 * undifferentiated list of every article ever published — no way to see what was
 * waiting on an editor, what was scheduled, or what had been ranked.
 *
 * The "Live now" and "Scheduled" panes reuse the same GROQ clauses as the public
 * site filter, so what an editor sees here is what the site is actually doing.
 */

type PostPane = {
  title: string
  filter: string
  params?: Record<string, unknown>
  orderField?: string
  orderDirection?: 'asc' | 'desc'
}

const POST_PANES: PostPane[] = [
  {
    title: '👀 Needs review',
    filter: `_type == "post" && editorialStatus == "${EDITORIAL_STATUS.inReview}"`,
    orderField: '_updatedAt',
  },
  {
    // Only articles explicitly marked draft. Deliberately not
    // `!defined(editorialStatus)` — that would sweep in the whole pre-workflow
    // archive, which is live and approved.
    title: '✍️ In progress',
    filter: `_type == "post" && editorialStatus == "${EDITORIAL_STATUS.draft}"`,
    orderField: '_updatedAt',
  },
  {
    title: '🕒 Scheduled',
    filter: `_type == "post" && ${APPROVED_CLAUSE} && ${SCHEDULED_CLAUSE}`,
    orderField: 'publishedAt',
    orderDirection: 'asc',
  },
  {
    // The one failure mode this workflow introduces: someone hits Sanity's own
    // Publish while the status is still draft or in review. The document is
    // published, but the site correctly refuses to show it. Without this pane
    // the story would simply never appear and nobody would know why.
    title: '⚠️ Published but blocked',
    filter: `_type == "post" && !(_id in path("drafts.**")) && defined(editorialStatus) && editorialStatus != "${EDITORIAL_STATUS.published}"`,
    orderField: '_updatedAt',
  },
  {
    title: '⭐ Priority stories',
    filter: `_type == "post" && coalesce(priority, 0) > 0`,
    orderField: 'priority',
  },
  {
    title: '🟢 Live now',
    filter: `_type == "post" && ${APPROVED_CLAUSE} && ${PUBLISH_TIME_REACHED_CLAUSE}`,
    orderField: 'publishedAt',
  },
  {
    title: '📰 All articles',
    filter: `_type == "post"`,
    orderField: 'publishedAt',
  },
]

/**
 * The signed-in journalist's own work.
 *
 * Sanity owns logins, this dataset owns bylines, and `author.email` is the only
 * thing joining them — so this pane is as accurate as that field is. It is built
 * separately from POST_PANES because it needs the current user, and omitted
 * entirely when there is nobody to match on rather than showing an empty list
 * that looks like "you have written nothing".
 */
function myArticlesPane(email: string): PostPane {
  return {
    title: '✍️ My articles',
    filter: '_type == "post" && author->email == $email',
    params: {email},
    orderField: '_updatedAt',
  }
}

function postPane(S: StructureBuilder, pane: PostPane) {
  const list = S.documentTypeList('post')
    .title(pane.title)
    // `now()` and `coalesce()` need a modern GROQ; without pinning this the
    // list falls back to an older API version and the pane errors out.
    .apiVersion(apiVersion)
    .filter(pane.filter)
    .defaultOrdering([
      {field: pane.orderField || 'publishedAt', direction: pane.orderDirection || 'desc'},
    ])

  return S.listItem()
    .title(pane.title)
    .child(pane.params ? list.params(pane.params) : list)
}

export const structure: StructureResolver = (S, context) => {
  const email = context.currentUser?.email

  return S.list()
    .title('Newsroom')
    .items([
      ...POST_PANES.map((pane) => postPane(S, pane)),
      ...(email ? [postPane(S, myArticlesPane(email))] : []),
      S.divider(),
      S.documentTypeListItem('advertisement').title('Advertisements'),
      S.documentTypeListItem('webStory').title('Web Stories'),
      S.divider(),
      S.documentTypeListItem('author').title('👥 Staff & Authors'),
      S.listItem()
        .title('🔑 Team & Access')
        .child(S.component(TeamAccessPane).title('Team & Access')),
      S.listItem()
        .title('📊 Analytics')
        .child(S.component(AnalyticsPane).title('Site Analytics')),
    ])
}
