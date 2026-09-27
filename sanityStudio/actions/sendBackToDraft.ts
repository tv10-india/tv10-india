import {UndoIcon} from '@sanity/icons'
import {useCurrentUser, useDocumentOperation} from 'sanity'
import type {DocumentActionComponent} from 'sanity'
import {EDITORIAL_STATUS, readStatus} from '../lib/editorialStatus'
import {EDITORIAL_ACTION, appendHistoryPatch} from '../lib/editorialHistory'

/**
 * Bounces a submission back to the writer. Approver roles only.
 *
 * This patches the draft and nothing else. If the document also happens to be
 * published while sitting in review, it is already invisible to the public —
 * `LIVE_POST_FILTER` in `lib/posts.ts` only lets approved articles through — so
 * there is nothing further to undo here. Taking a genuinely live article down is
 * Sanity's own Unpublish action, which is likewise restricted to approvers.
 */
const sendBackToDraft: DocumentActionComponent = ({id, type, draft, published, onComplete}) => {
  const {patch} = useDocumentOperation(id, type)
  const currentUser = useCurrentUser()

  const doc = draft || published
  const status = readStatus(doc?.editorialStatus)

  if (status !== EDITORIAL_STATUS.inReview) return null

  return {
    label: 'Send back to draft',
    icon: UndoIcon,
    tone: 'caution',
    onHandle: () => {
      patch.execute([
        ...appendHistoryPatch(EDITORIAL_ACTION.sentBack, currentUser),
        {set: {editorialStatus: EDITORIAL_STATUS.draft}},
      ])
      onComplete()
    },
  }
}

export default sendBackToDraft
