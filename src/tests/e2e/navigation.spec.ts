import { test, expect } from '@playwright/test';
import { languages } from '../fixtures/test-helpers';

test.describe('Navigation', () => {
  languages.forEach(({ code, name, url }) => {
    test.describe(`${name} navigation`, () => {
      test(`should load ${name} home page`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        // Home page URL matches the language path
        await expect(page).toHaveURL(new RegExp(url.replace('/', '/+')));
        // Check for page heading or main content
        await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
      });

      test(`should navigate to About page from ${name} home`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Click About link
        const aboutLink = page.locator('a[href*="/about" i]').first();
        await aboutLink.click();

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation - About page uses h2, not h1
        await expect(page).toHaveURL(/\/about/);
        await expect(page.locator('h2#about')).toBeVisible({ timeout: 5000 });
      });

      test(`should navigate to Search page from ${name} home`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Click Search link
        const searchLink = page.locator('a[href*="/search" i]').first();
        await searchLink.click();

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation - Search page has h1
        await expect(page).toHaveURL(/\/search/);
        await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      });

      test(`should return to home page from About page`, async ({ page }) => {
        await page.goto(`${url}about`, { waitUntil: 'domcontentloaded' });

        // Click logo/home link
        const homeLink = page.locator('a[href*="/" i]').first();
        await homeLink.click();

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Verify back on home
        const expectedPattern = url === '/' ? /\/tech-blog\/?$/ : new RegExp(url.replace(/\/$/, '/?$'));
        await expect(page).toHaveURL(expectedPattern);
      });
    });
  });
});
