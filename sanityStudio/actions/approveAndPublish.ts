import {CheckmarkCircleIcon} from '@sanity/icons'
import {getDraftId, useCurrentUser, useDocumentOperation, useValidationStatus} from 'sanity'
import type {DocumentActionComponent} from 'sanity'
import {EDITORIAL_STATUS, readStatus} from '../lib/editorialStatus'
import {EDITORIAL_ACTION, appendHistoryPatch} from '../lib/editorialHistory'

/**
 * The editor's approval. Registered for approver roles only — see
 * `sanityStudio/lib/roles.ts`.
 */
const approveAndPublish: DocumentActionComponent = ({id, type, draft, published, onComplete}) => {
  const {patch, publish} = useDocumentOperation(id, type)
  const currentUser = useCurrentUser()

  // Sanity's own Publish button refuses to run while a required field is empty,
  // but this action calls `publish.execute()` directly and would happily bypass
  // that — which is how an article with no byline would reach the site now that
  // `author` is required. `publish.disabled` cannot tell us: its reasons are
  // only LIVE_EDIT_ENABLED / ALREADY_PUBLISHED / NO_CHANGES / NOT_READY.
  //
  // `useValidationStatus` is marked @internal in Sanity's typings, but it is
  // exactly what Sanity's built-in publish action uses, called the same way
  // (validation target = the draft id). There is no public equivalent.
  const {validation} = useValidationStatus(getDraftId(id), type)

  const doc = draft || published
  const status = readStatus(doc?.editorialStatus)

  if (status !== EDITORIAL_STATUS.inReview) return null

  const hasErrors = validation.some((marker) => marker.level === 'error')

  // Beyond validation, only NOT_READY is a real blocker. Deliberately *not*
  // disabling on 'NO_CHANGES': an article sitting in review with no unsaved
  // draft edits would report no changes, and disabling here would make it
  // impossible to ever approve. The patch below creates the change that publish
  // then commits.
  const disabled = hasErrors || publish.disabled === 'NOT_READY'

  return {
    label: 'Approve & publish',
    icon: CheckmarkCircleIcon,
    tone: 'positive',
    disabled,
    title: hasErrors ? 'Fix the highlighted fields before approving' : undefined,
    onHandle: () => {
      // Stamp the approval before publishing, not after. `publish` copies the
      // draft over the published document; a patch applied afterwards would land
      // on a new draft and the live document would still read "in review" — and
      // the site filter would keep hiding the article the editor just approved.
      // The history entry rides along in the same patch for the same reason.
      patch.execute([
        ...appendHistoryPatch(EDITORIAL_ACTION.approved, currentUser),
        {set: {editorialStatus: EDITORIAL_STATUS.published}},
      ])
      publish.execute()
      onComplete()
    },
  }
}

export default approveAndPublish
