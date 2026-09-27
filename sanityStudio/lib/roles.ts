import {userHasRole} from 'sanity'

// Derived from the helper rather than written out, because the `currentUser`
// handed to a document-action resolver is a slightly narrowed `CurrentUser` and
// the two have drifted between Sanity versions.
type RoleBearingUser = Parameters<typeof userHasRole>[0]

/**
 * Who may put a story on the site.
 *
 * These are Sanity's built-in role ids. `administrator` is included because on
 * most plans every project member is one by default — if that is true of this
 * project, this check passes for everybody and gates nothing until writers are
 * demoted to a lower role in manage.sanity.io.
 *
 * Worth being plain about: this is a Studio-side guardrail. It stops a writer
 * clicking Publish by mistake. It does not stop anyone holding an API token
 * writing to the dataset directly — genuine server-enforced roles are a Sanity
 * plan feature, not something the Studio can implement.
 */
export const APPROVER_ROLES = ['administrator', 'editor'] as const

export function isApprover(user: RoleBearingUser | undefined): boolean {
  if (!user) return false
  return APPROVER_ROLES.some((role) => userHasRole(user, role))
}

/**
 * Who may manage staff profiles.
 *
 * Narrower than `isApprover` on purpose: an editor approves copy, but adding or
 * removing a byline is an account-management act. Same caveat as above — it
 * gates nothing while everyone is an `administrator`.
 */
export function isAdministrator(user: RoleBearingUser | undefined): boolean {
  if (!user) return false
  return userHasRole(user, 'administrator')
}
