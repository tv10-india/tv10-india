import {defineField, defineType} from 'sanity'

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
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
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
          {title: 'Dharma', value: 'dharma'},
          {title: 'Business', value: 'business'},
          {title: 'Sports', value: 'sports'},
          {title: 'Videos', value: 'videos'},
          { title: 'Mystery (Adbhut)', value: 'mystery' },
          { title: 'Lifestyle', value: 'lifestyle' },
        ],
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
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
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
    }),
  ],
})