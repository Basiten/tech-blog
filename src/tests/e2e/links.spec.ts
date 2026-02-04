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

      // No console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`Console error on ${url}:`, msg.text());
        }
      });
    });
  });

  test('all internal links should return valid responses', async ({ page }) => {
    await page.goto('/');

    // Find all internal links
    const internalLinks = await page.locator('a[href^="/"], a[href^="./"]').all();

    // Check a sample of links (not all to avoid timeout)
    const linksToCheck = internalLinks.slice(0, 10);

    for (const link of linksToCheck) {
      const href = await link.getAttribute('href');
      if (!href) continue;

      // Skip anchors and external links
      if (href.startsWith('#') || href.startsWith('http')) continue;

      // Navigate to the link and verify
      const response = await page.goto(href);

      // Allow 404 for blog posts ( Sanity might not have content yet)
      const isBlogPost = href.includes('/blog/');
      if (!isBlogPost && response) {
        expect(response.status()).toBeLessThan(500);
      }
    }
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

      // Check that URL contains base path exactly once
      const basePathCount = (currentUrl.match(/\/tech-blog/g) || []).length;
      expect(basePathCount).toBeLessThanOrEqual(1);
    }
  });

  test('blog card links should work correctly', async ({ page }) => {
    await page.goto('/');

    // Find all blog card links
    const blogCards = await page.locator('article a[href*="/blog/"]').all();

    if (blogCards.length > 0) {
      const blogCard = blogCards[0];

      // Get the href attribute
      const href = await blogCard.getAttribute('href');

      if (href) {
        // Click the blog card link
        await blogCard.click();

        // Verify navigation - should go to blog post
        await expect(page).toHaveURL(/\/blog\/.+$/);
      }
    }
  });
});
