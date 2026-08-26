import {defineField, defineType} from 'sanity'

const createSlug = (input: string) => {
  const asciiSlug = input
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[a-z0-9]+/g, (word) => `-${word}`)
    .replace(/[^a-z0-9]+/g, (characters) => Array.from(characters)
      .filter((character) => !/\s/.test(character))
      .map((character) => `-${character.codePointAt(0)?.toString(36)}`)
      .join(''))
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return asciiSlug.slice(0, 96);
};

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
