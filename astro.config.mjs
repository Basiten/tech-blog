// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://sunqizhen.github.io',
  base: '/technical-blog',
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    sanity({
      projectId: import.meta.env.SANITY_PROJECT_ID || 'tech-blog',
      dataset: 'production',
    }),
  ],
  vite: {
    build: {
      // Improve build performance
      chunkSizeWarningLimit: 1000,
    },
  },
});