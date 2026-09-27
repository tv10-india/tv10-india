import {defineField, defineType} from 'sanity'
import {EDITORIAL_ACTION_LABELS} from '../lib/editorialHistory'

/**
 * One entry in an article's editorial history. Written only by the workflow
 * actions in `sanityStudio/actions/` — see `lib/editorialHistory.ts`.
 */
export default defineType({
  name: 'editorialEvent',
  title: 'Editorial Event',
  type: 'object',
  fields: [
    defineField({name: 'action', title: 'Action', type: 'string'}),
    defineField({name: 'byName', title: 'By', type: 'string'}),
    defineField({name: 'byId', title: 'User ID', type: 'string'}),
    defineField({name: 'at', title: 'At', type: 'datetime'}),
  ],
  preview: {
    select: {action: 'action', byName: 'byName', at: 'at'},
    prepare({action, byName, at}) {
      const label = EDITORIAL_ACTION_LABELS[action] || action || 'Unknown action'
      // en-IN so the timestamp reads the way the newsroom writes dates.
      const when = at
        ? new Date(at).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'unknown time'

      return {
        title: label,
        subtitle: `${byName || 'Unknown user'} · ${when}`,
      }
    },
  },
})
