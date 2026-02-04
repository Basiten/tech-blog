import { test as base } from '@playwright/test';

export const test = base.extend({
  // Add custom test helpers if needed
});

export const languages = [
  { code: 'en', name: 'English', url: '/' },
  { code: 'zh', name: '中文', url: '/zh/' },
  { code: 'fr', name: 'Français', url: '/fr/' },
];
