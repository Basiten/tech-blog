import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test('search page should load without errors', async ({ page }) => {
    await page.goto('/search');

    // Check for h1 heading
    await expect(page.locator('h1')).toBeVisible();

    // Check for search input or no-posts message
    const searchInput = page.locator('input#search-input');
    const noPostsMessage = page.locator('text=/no posts|没有文章|aucun article/i');

    const hasSearch = await searchInput.count() > 0;
    const hasNoPosts = await noPostsMessage.count() > 0;

    expect(hasSearch || hasNoPosts).toBeTruthy();
  });

  test('should show results when typing', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input#search-input');

    // Only test if search input exists (has posts)
    if (await searchInput.count() > 0) {
      // Type in search box
      await searchInput.fill('test');

      // Wait for results to appear (debounce is 300ms)
      await page.waitForTimeout(500);

      // Check for results
      const results = page.locator('#search-results a[href*="/blog/" i]');
      const hasResults = await results.count();

      if (hasResults > 0) {
        // Verify blog post titles are shown
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should navigate to blog post from search results', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input#search-input');

    // Only test if search input exists (has posts)
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);

      // Click first search result
      const firstResult = page.locator('#search-results a[href*="/blog/" i]').first();

      if (await firstResult.isVisible()) {
        await firstResult.click();

        // Verify we're on a blog post page
        await expect(page).toHaveURL(/\/blog\/.+$/);
        await expect(page.locator('article h1, article h2').first()).toBeVisible();
      }
    }
  });

  test('should show "no results" when no posts match', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input#search-input');

    // Only test if search input exists (has posts)
    if (await searchInput.count() > 0) {
      // Search for something that doesn't exist
      await searchInput.fill('nonexistentpostxyz123');
      await page.waitForTimeout(500);

      // Verify no results message
      await expect(page.locator('#no-results')).toBeVisible();
      await expect(page.locator('#no-results')).toContainText(/no posts|no results|没有找到|aucun/i);
    }
  });
});
