import { test, expect } from '@playwright/test';
import { languages } from '../fixtures/test-helpers';

test.describe('Navigation', () => {
  languages.forEach(({ code, name, url }) => {
    test.describe(`${name} navigation`, () => {
      test(`should load ${name} home page`, async ({ page }) => {
        await page.goto(url);
        // Home page URL matches the language path
        await expect(page).toHaveURL(new RegExp(url.replace('/', '/+')));
        // Check for page heading or main content
        await expect(page.locator('h1, h2').first()).toBeVisible();
      });

      test(`should navigate to About page from ${name} home`, async ({ page }) => {
        await page.goto(url);

        // Click About link
        const aboutLink = page.locator('a[href*="/about" i]').first();
        await aboutLink.click();

        // Verify navigation - About page uses h2, not h1
        await expect(page).toHaveURL(/\/about/);
        await expect(page.locator('h2#about')).toBeVisible();
      });

      test(`should navigate to Search page from ${name} home`, async ({ page }) => {
        await page.goto(url);

        // Click Search link
        const searchLink = page.locator('a[href*="/search" i]').first();
        await searchLink.click();

        // Verify navigation - Search page has h1
        await expect(page).toHaveURL(/\/search/);
        await expect(page.locator('h1')).toBeVisible();
      });

      test(`should return to home page from About page`, async ({ page }) => {
        await page.goto(`${url}about`);

        // Click logo/home link
        const homeLink = page.locator('a[href*="/" i]').first();
        await homeLink.click();

        // Verify back on home
        const expectedPattern = url === '/' ? /\/tech-blog\/?$/ : new RegExp(url.replace(/\/$/, '/?$'));
        await expect(page).toHaveURL(expectedPattern);
      });
    });
  });
});
