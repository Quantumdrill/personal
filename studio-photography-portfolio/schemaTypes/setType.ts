import {defineField, defineType} from 'sanity'

export const setType = defineType({
  name: 'set',
  title: 'Set',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'date',
      type: 'date',
    }),
    defineField({
      name: 'collection',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{type: 'collection'}],
      }]
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'image',
      type: 'array',
      of: [{
        type: 'image'
      }],
    })
  ],
})