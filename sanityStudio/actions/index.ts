import type {DocumentActionComponent, DocumentActionsContext} from 'sanity'
import {isAdministrator, isApprover} from '../lib/roles'
import previewArticle from './previewArticle'
import submitForReview from './submitForReview'
import approveAndPublish from './approveAndPublish'
import sendBackToDraft from './sendBackToDraft'

/**
 * Sanity's own actions that only a privileged user should reach.
 * `discardChanges` and `duplicate` are deliberately left alone — discarding your
 * own draft edits and copying a document are both harmless.
 */
const RESTRICTED_BUILT_INS = new Set(['publish', 'unpublish', 'delete'])

/**
 * Which role each document type answers to.
 *
 * Everything with consequences outside the newsroom is here. `advertisement` in
 * particular: these are paid bookings, and until now the resolver returned early
 * for every type except `post`, so anyone who could open the Studio could delete
 * one. `author` is administrator-only because adding or removing a byline is an
 * account-management act rather than an editorial one.
 */
const TYPE_GATE: Record<string, (user: DocumentActionsContext['currentUser']) => boolean> = {
  post: isApprover,
  advertisement: isApprover,
  webStory: isApprover,
  author: isAdministrator,
}

/**
 * The document actions, resolved against the signed-in user's role.
 *
 * This lives in one place because the project has two Sanity configs — the root
 * `sanity.config.ts`, which is what `app/studio/[[...tool]]/page.tsx` actually
 * mounts at `/studio`, and `sanityStudio/sanity.config.ts`, used by the standalone
 * `sanity` CLI. They had already drifted once: `previewArticle` was registered
 * only in the CLI config, so the Studio the editors actually use had no Preview
 * button. Both configs now call this, so that cannot happen again.
 */
export function resolveDocumentActions(
  previousActions: DocumentActionComponent[],
  context: DocumentActionsContext,
): DocumentActionComponent[] {
  const gate = TYPE_GATE[context.schemaType]
  if (!gate) return previousActions

  const permitted = gate(context.currentUser)

  const builtIns = permitted
    ? previousActions
    : previousActions.filter(
        (action) => !action.action || !RESTRICTED_BUILT_INS.has(action.action),
      )

  // The editorial workflow is specific to articles; the other gated types have
  // no review cycle, so they get the built-ins and nothing more.
  if (context.schemaType !== 'post') return builtIns

  return permitted
    ? [...builtIns, previewArticle, submitForReview, approveAndPublish, sendBackToDraft]
    : [...builtIns, previewArticle, submitForReview]
}
