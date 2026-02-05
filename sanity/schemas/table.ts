import type { Rule } from 'sanity'

export default {
  name: 'table',
  title: 'Table',
  type: 'object',
  fields: [
    {
      name: 'html',
      title: 'HTML',
      type: 'text',
      description: 'HTML table content'
    }
  ],
  preview: {
    select: {
      html: 'html'
    },
    prepare(selection: any) {
      return {
        title: 'Table'
      }
    }
  }
}
