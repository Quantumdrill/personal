import {defineField, defineType} from 'sanity'

export const itemType = defineType({
  name: 'item',
  title: 'Item',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
    }),
    defineField({
      name: 'image',
      type: 'image',
    }),
    defineField({
      name: 'set',
      type: 'reference',
      to: [{ type: 'set'}],
    }),
  ],
})