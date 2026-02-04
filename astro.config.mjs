// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';
import { supportedLanguages, defaultLanguage } from './src/i18n/config.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://basiten.github.io',
  base: '/tech-blog',
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    sanity({
      projectId: import.meta.env.SANITY_PROJECT_ID || 'fukvvqkf',
      dataset: 'production',
    }),
  ],
  vite: {
    build: {
      // Improve build performance
      chunkSizeWarningLimit: 1000,
    },
  },
  // Configure i18n routing
  i18n: {
    defaultLocale: defaultLanguage,
    locales: [...supportedLanguages],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});