import type {PatchOperations} from 'sanity'

/**
 * The audit trail behind the editorial workflow.
 *
 * Every state change a `post` goes through is appended here, so "who approved
 * this and when" has an answer months later. The three document actions in
 * `sanityStudio/actions/` are the only writers; the field itself is `readOnly`
 * on the schema so the record cannot be quietly edited after the fact.
 */

export const EDITORIAL_ACTION = {
  submitted: 'submitted',
  approved: 'approved',
  sentBack: 'sent-back',
} as const

export type EditorialAction = (typeof EDITORIAL_ACTION)[keyof typeof EDITORIAL_ACTION]

/** How each entry reads in the Studio. */
export const EDITORIAL_ACTION_LABELS: Record<string, string> = {
  [EDITORIAL_ACTION.submitted]: '📤 Submitted for review',
  [EDITORIAL_ACTION.approved]: '✅ Approved & published',
  [EDITORIAL_ACTION.sentBack]: '↩️ Sent back to draft',
}

export type EditorialEvent = {
  _key: string
  _type: 'editorialEvent'
  action: EditorialAction
  byName: string
  byId: string
  at: string
}

/** The shape of `currentUser` that matters here, kept narrow so both the hook
 * and the document-action context satisfy it. */
type HistoryUser = {id?: string; name?: string; email?: string} | null | undefined

/**
 * Array items in Sanity must carry a `_key`, and items without one are a real
 * failure mode in this dataset — `scripts/fix-missing-keys.mjs` exists because
 * of it. `crypto.randomUUID` needs a secure context, which the Studio always has
 * (https, or localhost in dev); the fallback covers anything unexpected rather
 * than letting a keyless item through.
 */
function eventKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function historyEntry(action: EditorialAction, user: HistoryUser): EditorialEvent {
  return {
    _key: eventKey(),
    _type: 'editorialEvent',
    action,
    // Name is what an editor reads; id is what survives a rename. Email is the
    // fallback because a Sanity account can exist without a display name.
    byName: user?.name || user?.email || 'Unknown user',
    byId: user?.id || '',
    at: new Date().toISOString(),
  }
}

/**
 * The patches that append one entry, for spreading into an existing
 * `patch.execute([...])` call.
 *
 * `setIfMissing` first because the field is absent on every article written
 * before this existed — inserting into a field that is not an array is an error,
 * not a no-op. `after: 'editorialHistory[-1]'` then appends, including on the
 * empty array `setIfMissing` has just created.
 */
export function appendHistoryPatch(action: EditorialAction, user: HistoryUser): PatchOperations[] {
  return [
    {setIfMissing: {editorialHistory: []}},
    {insert: {after: 'editorialHistory[-1]', items: [historyEntry(action, user)]}},
  ]
}
