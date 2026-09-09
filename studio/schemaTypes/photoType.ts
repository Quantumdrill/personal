import {defineField, defineType} from 'sanity'

export const photoType = defineType({
  name: 'photo',
  title: 'Photo',
  type: 'image',

  options: {
    metadata: [
      'lqip',
      'palette',
      'exif',
      'image',
    ],
  },

  fields: [
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'isThumbnail',
      title: 'Use as thumbnail',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})