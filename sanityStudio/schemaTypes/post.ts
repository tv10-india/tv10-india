import {defineField, defineType} from 'sanity'
import {slugify} from 'transliteration'

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
      options: {
        source: 'title',
        maxLength: 96,
        slugify: (input) => slugify(input, {lowercase: true, separator: '-'}).slice(0, 96),
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
