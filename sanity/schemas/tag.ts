import type { Rule } from 'sanity'

export default {
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule: Rule) => Rule.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (Rule: Rule) => Rule.required() },
    { name: 'description', title: 'Description', type: 'text' },
  ],
}
