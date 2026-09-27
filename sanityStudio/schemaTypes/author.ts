import {defineField, defineType} from 'sanity'
import {createSlug} from '../lib/slug'

/**
 * A member of newsroom staff.
 *
 * This is the public half of user management: the byline a reader sees and the
 * profile page Google reads. It is deliberately *not* the same thing as a Sanity
 * login — Sanity owns accounts and roles, this document owns identity. `email`
 * is what links the two (see the "My articles" pane in `structure.ts`).
 */
export default defineType({
  name: 'author',
  title: 'Staff & Authors',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      description: 'As it should appear in the byline, e.g. "रवि कुमार" or "Ravi Kumar".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Profile URL',
      description: 'The address of this journalist’s profile page, e.g. /author/ravi-kumar.',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: createSlug,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'designation',
      title: 'Designation',
      description: 'Job title shown under the byline, e.g. "Senior Correspondent".',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      title: 'Photograph',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      title: 'Short Biography',
      description:
        'Shown on the profile page. Two or three sentences on what this journalist covers — search engines read this as a signal of subject expertise.',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(500),
    }),
    defineField({
      name: 'email',
      title: 'Work Email',
      description:
        'Doubles as the link to this person’s Studio login: set it to the address they sign in with and the "My articles" pane will find their work.',
      type: 'string',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address'
        }),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Profiles',
      description:
        'Full URLs to this journalist’s public profiles. Published as schema.org sameAs, which is how search engines tie the byline to a real person.',
      type: 'array',
      of: [{type: 'url'}],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'isActive',
      title: 'Currently on staff',
      description:
        'Switch off when someone leaves. Their existing bylines and profile page stay published — only new assignments stop.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      designation: 'designation',
      media: 'photo',
      isActive: 'isActive',
    },
    // Status first, then descriptive detail — the same shape as the post and
    // advertisement previews, so the lists read consistently.
    prepare({title, designation, media, isActive}) {
      const status = isActive === false ? '⚪ Former staff' : '\u{1f7e2} On staff'

      return {
        title: title || 'Unnamed staff member',
        subtitle: designation ? `${status} · ${designation}` : status,
        media,
      }
    },
  },
})
