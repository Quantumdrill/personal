import {defineArrayMember, defineField, defineType} from 'sanity'

export const albumType = defineType({
  name: 'album',
  title: 'Album',
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
      name: 'comment',
      title: 'Comment',
      type: 'text',
      rows: 4,
    }),
      
    defineField({
      name: 'sets',
      title: 'Sets',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'set'}],
        }),
      ],
    }),
  ],
})