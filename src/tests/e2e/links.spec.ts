import { test, expect } from '@playwright/test';

test.describe('Link Validation', () => {
  const testedPages = [
    { url: '/', name: 'Home' },
    { url: '/about', name: 'About' },
    { url: '/search', name: 'Search' },
    { url: '/zh/', name: 'Chinese Home' },
    { url: '/zh/about', name: 'Chinese About' },
    { url: '/zh/search', name: 'Chinese Search' },
    { url: '/fr/', name: 'French Home' },
    { url: '/fr/about', name: 'French About' },
    { url: '/fr/search', name: 'French Search' },
  ];

  testedPages.forEach(({ url, name }) => {
    test(`"${name}" page should load without errors`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test('internal links should exist on home page', async ({ page }) => {
    await page.goto('/');

    // Check that navigation links exist
    await expect(page.locator('a[href*="/about" i]')).toHaveCountGreaterThan(0);
    await expect(page.locator('a[href*="/search" i]')).toHaveCountGreaterThan(0);
  });

  test('should not have duplicate base paths in URLs', async ({ page }) => {
    // Navigate through all pages and check URLs
    const pages = ['/', '/about', '/search', '/zh/', '/zh/about', '/zh/search'];

    for (const pageUrl of pages) {
      await page.goto(pageUrl);
      const currentUrl = page.url();

      // Check for duplicate base path
      const matches = currentUrl.match(/\/tech-blog\/tech-blog\//g);
      expect(matches).toBeNull();

      // Check that URL contains base path at most once
      const basePathCount = (currentUrl.match(/\/tech-blog/g) || []).length;
      expect(basePathCount).toBeLessThanOrEqual(1);
    }
  });

  test('navigation links should work', async ({ page }) => {
    await page.goto('/');

    // Test About link
    const aboutLink = page.locator('a[href*="/about" i]').first();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);

    // Test Search link
    await page.goto('/');
    const searchLink = page.locator('a[href*="/search" i]').first();
    await searchLink.click();
    await expect(page).toHaveURL(/\/search/);
  });
});
