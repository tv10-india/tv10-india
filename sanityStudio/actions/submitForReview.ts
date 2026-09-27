import {ClipboardIcon} from '@sanity/icons'
import {useCurrentUser, useDocumentOperation} from 'sanity'
import type {DocumentActionComponent} from 'sanity'
import {EDITORIAL_STATUS, readStatus} from '../lib/editorialStatus'
import {EDITORIAL_ACTION, appendHistoryPatch} from '../lib/editorialHistory'

/**
 * Hands a finished draft to an editor. Available to everyone — writers need it,
 * and an editor writing their own copy should be able to use the same route.
 */
const submitForReview: DocumentActionComponent = ({id, type, draft, published, onComplete}) => {
  const {patch} = useDocumentOperation(id, type)
  const currentUser = useCurrentUser()

  const doc = draft || published
  const status = readStatus(doc?.editorialStatus)

  // Only a story still being written can be submitted. Articles from before this
  // field existed have no status and read as approved, so this never clutters
  // the menu on the existing archive.
  if (status !== EDITORIAL_STATUS.draft) return null

  return {
    label: 'Submit for review',
    icon: ClipboardIcon,
    onHandle: () => {
      patch.execute([
        ...appendHistoryPatch(EDITORIAL_ACTION.submitted, currentUser),
        {set: {editorialStatus: EDITORIAL_STATUS.inReview}},
      ])
      onComplete()
    },
  }
}

export default submitForReview
