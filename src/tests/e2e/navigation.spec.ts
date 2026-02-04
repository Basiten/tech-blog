import { test, expect } from '@playwright/test';
import { languages } from '../fixtures/test-helpers';

test.describe('Navigation', () => {
  languages.forEach(({ code, name, url }) => {
    test.describe(`${name} navigation`, () => {
      test(`should load ${name} home page`, async ({ page }) => {
        await page.goto(url);
        await expect(page).toHaveURL(/\/tech-blog\/?$/);
        await expect(page.locator('h1')).toContainText(/welcome|latest|首页|accueil/i);
      });

      test(`should navigate to About page from ${name} home`, async ({ page }) => {
        await page.goto(url);

        // Click About link
        const aboutLink = page.locator('a[href*="/about" i]').first();
        await aboutLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/\/about\/?$/);
        await expect(page.locator('h1')).toContainText(/about|关于|à propos/i);
      });

      test(`should navigate to Search page from ${name} home`, async ({ page }) => {
        await page.goto(url);

        // Click Search link
        const searchLink = page.locator('a[href*="/search" i]').first();
        await searchLink.click();

        // Verify navigation
        await expect(page).toHaveURL(/\/search\/?$/);
        await expect(page.locator('h1')).toContainText(/search|搜索|recherche/i);
      });

      test(`should return to home page from About page`, async ({ page }) => {
        await page.goto(`${url}about`);

        // Click logo/home link
        const homeLink = page.locator('a[href*="/" i]').first();
        await homeLink.click();

        // Verify back on home
        await expect(page).toHaveURL(/\/tech-blog\/?$/);
      });
    });
  });
});
