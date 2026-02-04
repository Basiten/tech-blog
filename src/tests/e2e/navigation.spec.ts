import { test, expect } from '@playwright/test';
import { languages } from '../fixtures/test-helpers';

test.describe('Navigation', () => {
  languages.forEach(({ code, name, url }) => {
    test.describe(`${name} navigation`, () => {
      test(`should load ${name} home page`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Debug: log page content
        const content = await page.content();
        const hasH1 = content.includes('<h1');
        const hasH2 = content.includes('<h2');

        // Home page URL matches the language path
        await expect(page).toHaveURL(new RegExp(url.replace('/', '/+')));

        // Check for page content - try multiple selectors
        const h1Count = await page.locator('h1').count();
        const h2Count = await page.locator('h2').count();
        const mainCount = await page.locator('main').count();

        // At least one of these should exist
        expect(h1Count + h2Count + mainCount).toBeGreaterThan(0);
      });

      test(`should navigate to About page from ${name} home`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Click About link
        const aboutLink = page.locator('a[href*="/about" i]').first();
        await aboutLink.click();

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation - check URL first
        await expect(page).toHaveURL(/\/about/);

        // Check page actually loaded
        const content = await page.content();

        // Try to find any content element that indicates the page loaded
        const bodyText = await page.locator('body').innerText();

        // About page should have some content
        expect(bodyText.length).toBeGreaterThan(100);
      });

      test(`should navigate to Search page from ${name} home`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Click Search link
        const searchLink = page.locator('a[href*="/search" i]').first();
        await searchLink.click();

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Verify navigation - check URL first
        await expect(page).toHaveURL(/\/search/);

        // Check page actually loaded
        const bodyText = await page.locator('body').innerText();

        // Search page should have some content
        expect(bodyText.length).toBeGreaterThan(100);
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
