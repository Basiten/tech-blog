import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  timeout: 10000,
  // Start dev server before running tests
  webServer: {
    command: 'npm run build && npx serve dist -l 4321',
    port: 4321,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    // baseURL must match the base path used in Astro build
    baseURL: 'http://localhost:4321/tech-blog',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
