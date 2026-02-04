import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schema } from './sanity/schemas'
import { SANITY_CONFIG } from './src/lib/sanityConfig'

export default defineConfig({
  ...SANITY_CONFIG,
  title: 'Tech Blog',
  basePath: '/studio',
  plugins: [structureTool()],
  schema: {
    types: schema.types,
  },
})
