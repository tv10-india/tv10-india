<<<<<<< HEAD
import {defineField, defineType} from 'sanity'
import {slugify} from 'transliteration'

const createSlug = (input: unknown) => {
  const title = typeof input === 'string' ? input.trim() : ''
  if (!title) return ''

  return slugify(title, {lowercase: true, separator: '-'})
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
    .replace(/-+$/g, '')
}

export default defineType({
  name: 'post',
  title: 'News Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'styledTitle',
      title: 'Styled Article Heading',
      description: 'Optional. Use this to color selected words in the article heading. Keep Headline filled for cards, search, and URL generation.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [],
          marks: {
            annotations: [
              {
                name: 'color',
                title: 'Text Color',
                type: 'object',
                fields: [
                  {
                    name: 'value',
                    title: 'Color',
                    type: 'string',
                    options: {
                      list: [
                        {title: 'Red', value: '#D32F2F'},
                        {title: 'Gold', value: '#FFC107'},
                        {title: 'Blue', value: '#1565C0'},
                        {title: 'Green', value: '#2E7D32'},
                        {title: 'Black', value: '#000000'},
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: createSlug,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isBreaking',
      title: '🔴 Breaking News?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Uttar Pradesh', value: 'up'},
          {title: 'Uttarakhand', value: 'uk'},
          {title: 'Delhi', value: 'delhi'},
          {title: 'National', value: 'national'},
          {title: 'World', value: 'world'},
          {title: 'Dharma', value: 'dharma'},
          {title: 'Business', value: 'business'},
          {title: 'Sports', value: 'sports'},
          {title: 'Videos', value: 'videos'},
          { title: 'Mystery (Adbhut)', value: 'mystery' },
          { title: 'Lifestyle', value: 'lifestyle' },
          { title: 'Web Stories', value: 'web-stories' },
=======
  import {defineField, defineType} from 'sanity'
  import {
    EDITORIAL_STATUS,
    EDITORIAL_STATUS_BADGES,
    EDITORIAL_STATUS_OPTIONS,
    readStatus,
  } from '../lib/editorialStatus'
  import {createSlug} from '../lib/slug'

  export default defineType({
    name: 'post',
    title: 'News Article',
    type: 'document',
    fields: [
      defineField({
        name: 'title',
        title: 'Headline',
        type: 'string',
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'styledTitle',
        title: 'Styled Article Heading',
        description: 'Optional. Use this to color selected words in the article heading. Keep Headline filled for cards, search, and URL generation.',
        type: 'array',
        of: [
          {
            type: 'block',
            styles: [],
            marks: {
              annotations: [
                {
                  name: 'color',
                  title: 'Text Color',
                  type: 'object',
                  fields: [
                    {
                      name: 'value',
                      title: 'Color',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Red', value: '#D32F2F'},
                          {title: 'Gold', value: '#FFC107'},
                          {title: 'Blue', value: '#1565C0'},
                          {title: 'Green', value: '#2E7D32'},
                          {title: 'Black', value: '#000000'},
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },
>>>>>>> 176d453 (Update V1.5)
        ],
      }),
      defineField({
        name: 'slug',
        title: 'URL Slug',
        type: 'slug',
        options: {
          source: 'title',
          maxLength: 96,
          slugify: createSlug,
        },
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'editorialStatus',
        title: 'Editorial Status',
        description:
          'Where this article is in the review process. Only "Approved" articles appear on the site. Use the buttons at the bottom of the editor rather than changing this by hand.',
        type: 'string',
        options: {list: EDITORIAL_STATUS_OPTIONS, layout: 'radio'},
        initialValue: EDITORIAL_STATUS.draft,
      }),
      defineField({
        name: 'priority',
        title: 'Priority',
        description:
          'Pushes the story up the home page and its category page. 0 is normal — leave it there unless you want this above newer stories. 10 is the top of the page.',
        type: 'number',
        initialValue: 0,
        validation: (rule) => rule.min(0).max(10).integer(),
      }),
      defineField({
        name: 'isBreaking',
        title: '🔴 Breaking News?',
        type: 'boolean',
        initialValue: false,
      }),
      defineField({
        name: 'category',
        title: 'Category',
        type: 'string',
        options: {
          list: [
            {title: 'Uttar Pradesh', value: 'up'},
            {title: 'Uttarakhand', value: 'uk'},
            {title: 'Delhi', value: 'delhi'},
            {title: 'National', value: 'national'},
            {title: 'World', value: 'world'},
            {title: 'Dharma', value: 'dharma'},
            {title: 'Business', value: 'business'},
            {title: 'Sports', value: 'sports'},
            {title: 'Videos', value: 'videos'},
            { title: 'Mystery (Adbhut)', value: 'mystery' },
            { title: 'Lifestyle', value: 'lifestyle' },
            { title: 'Entertainment', value: 'entertainment' },
            { title: 'Web Stories', value: 'web-stories' },
          ],
        },
      }),
      defineField({
        name: 'author',
        title: 'Byline',
        description:
          'Who wrote this. Shown on the article and links to their profile page. Add new staff under "Staff & Authors".',
        type: 'reference',
        to: [{type: 'author'}],
        // Required so nothing new goes out unattributed — search engines rank
        // news on named authorship. The archive was backfilled to the News Desk
        // profile (scripts/backfill-authors.mjs), so this is satisfiable
        // everywhere; "Approve & publish" refuses to run while it is not.
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'seoDescription',
        title: 'SEO Description',
        description: 'Optional search description. This appears in search metadata, not in the article body. Keep it under 160 characters.',
        type: 'text',
        rows: 3,
        validation: (rule) => rule.max(160),
      }),
      defineField({
        name: 'tags',
        title: 'SEO Tags',
        description: 'Optional topic tags. They are used as metadata and stay hidden from the public article page.',
        type: 'array',
        of: [{type: 'string'}],
        options: {layout: 'tags'},
      }),
      defineField({
        name: 'mainImage',
        title: 'Main Image',
        type: 'image',
        options: { hotspot: true },
      }),
      defineField({
        name: 'gallery',
        title: 'Article Gallery',
        description: 'Upload or drag multiple images here. They appear together below the article; Main Image remains the single cover image.',
        type: 'array',
        of: [{ type: 'image', options: { hotspot: true } }],
        options: { layout: 'grid' },
      }),
      defineField({
        name: 'youtubeUrl',
        title: 'YouTube Video URL',
        type: 'url',
      }),
      defineField({
        name: 'body',
        title: 'Article Content',
        type: 'array',
        of: [
          {
            type: 'block',
            marks: {
              annotations: [
                {
                  name: 'color',
                  title: 'Text Color',
                  type: 'object',
                  fields: [
                    {
                      name: 'value',
                      title: 'Color',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Red', value: '#D32F2F'},
                          {title: 'Gold', value: '#FFC107'},
                          {title: 'Blue', value: '#1565C0'},
                          {title: 'Green', value: '#2E7D32'},
                          {title: 'Black', value: '#000000'},
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },
          {type: 'image', options: {hotspot: true}},
        ],
      }),
      defineField({
        name: 'publishedAt',
        title: 'Published at',
        description:
          'Set this in the future to schedule the article — it stays off the site until this time, then appears within a minute. Required: an article with no date cannot be shown.',
        type: 'datetime',
        initialValue: (new Date()).toISOString(),
        validation: (rule) => rule.required(),
      }),
      defineField({
        name: 'editorialHistory',
        title: 'Editorial History',
        description:
          'Who moved this article through review, and when. Written automatically by the workflow buttons below — it cannot be edited by hand.',
        type: 'array',
        of: [{type: 'editorialEvent'}],
        readOnly: true,
      }),
    ],
    preview: {
      select: {
        title: 'title',
        media: 'mainImage',
        category: 'category',
        editorialStatus: 'editorialStatus',
        priority: 'priority',
        publishedAt: 'publishedAt',
      },
<<<<<<< HEAD
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Article Gallery',
      description: 'Upload or drag multiple images here. They appear together below the article; Main Image remains the single cover image.',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Video URL',
      type: 'url',
    }),
    defineField({
      name: 'body',
      title: 'Article Content',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'color',
                title: 'Text Color',
                type: 'object',
                fields: [
                  {
                    name: 'value',
                    title: 'Color',
                    type: 'string',
                    options: {
                      list: [
                        {title: 'Red', value: '#D32F2F'},
                        {title: 'Gold', value: '#FFC107'},
                        {title: 'Blue', value: '#1565C0'},
                        {title: 'Green', value: '#2E7D32'},
                        {title: 'Black', value: '#000000'},
                      ],
                    },
                  },
                ],
              },
            ],
          },
        },
        {type: 'image', options: {hotspot: true}},
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
    }),
  ],
})
=======
      prepare({title, media, category, editorialStatus, priority, publishedAt}) {
        // Same shape as the advertisement schema's preview: the status an editor
        // needs to act on, first, before the descriptive detail.
        const status = readStatus(editorialStatus)
        let badge = EDITORIAL_STATUS_BADGES[status]
        if (
          status === EDITORIAL_STATUS.published &&
          publishedAt &&
          new Date(publishedAt).getTime() > Date.now()
        ) {
          badge = '🕒 Scheduled'
        }

        const rank = typeof priority === 'number' && priority > 0 ? ` · ⭐ ${priority}` : ''

        return {
          title,
          subtitle: `${badge}${rank}${category ? ` · ${category}` : ''}`,
          media,
        }
      },
    },
  })
>>>>>>> 176d453 (Update V1.5)
