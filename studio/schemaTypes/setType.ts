import {defineArrayMember, defineField, defineType} from 'sanity'

export const setType = defineType({
  name: 'set',
  title: 'Set',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'time',
      title: 'Time',
      type: 'date',
    }),

    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),

    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      rows: 4,
    }),

    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'photo',
        }),
      ],
    }),

    defineField({
        name: 'tags',
        title: 'Tags',
        type: 'array',
        of: [
            defineArrayMember({
            type: 'reference',
            to: [{type: 'tag'}],
            }),
        ],
    }),
  ],
})