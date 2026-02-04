import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests/e2e',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  timeout: 10000,
  // Start dev server before running tests
  // Use astro preview which handles base path correctly
  webServer: {
    command: 'npm run build && npx astro preview --port 4321 --host localhost',
    port: 4321,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    // baseURL: astro preview serves from dist with correct base path handling
    baseURL: 'http://localhost:4321',
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
