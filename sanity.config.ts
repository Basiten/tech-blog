import { defineConfig } from '@sanity/client'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  projectId: 'tech-blog',
  dataset: 'production',
  title: 'Tech Blog',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
})
