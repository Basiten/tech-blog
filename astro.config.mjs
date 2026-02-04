// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://sunqizhen.github.io',
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    sanity({
      projectId: 'tech-blog',
      dataset: 'production',
    }),
  ],
});