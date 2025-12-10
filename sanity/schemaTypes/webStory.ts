import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'webStory',
  title: 'Visual Web Story',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Story Title',
      type: 'string',
    }),
    defineField({
      name: 'slides',
      title: 'Story Slides',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption Text',
            }
          ]
        }
      ],
    }),
  ],
})