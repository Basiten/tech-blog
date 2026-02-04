import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('should show language switcher', async ({ page }) => {
    // The language switcher is a button with a flag and language name
    const switcher = page.locator('button[aria-label="Switch language"]');
    await expect(switcher).toBeVisible();
  });

  test('should switch from English to Chinese', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Hover over the language switcher to show dropdown
    const switcher = page.locator('button[aria-label="Switch language"]');
    await switcher.hover();

    // Wait for dropdown to be visible
    const dropdown = page.locator('.group-hover\\:opacity-100, .group-hover\\:visible');
    await dropdown.waitFor({ state: 'visible', timeout: 3000 });

    // Click Chinese language option (contains "中文" text)
    const zhOption = page.locator('a:has-text("中文")');
    await zhOption.click();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify URL changes to /zh/
    await expect(page).toHaveURL(/\/zh\/?$/);

    // Verify page content (check for any heading)
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

  test('should switch from Chinese to French', async ({ page }) => {
    await page.goto('/zh/', { waitUntil: 'domcontentloaded' });

    // Hover over the language switcher to show dropdown
    const switcher = page.locator('button[aria-label="Switch language"]');
    await switcher.hover();

    // Wait for dropdown to be visible
    const dropdown = page.locator('.group-hover\\:opacity-100, .group-hover\\:visible');
    await dropdown.waitFor({ state: 'visible', timeout: 3000 });

    // Click French language option (contains "Français" text)
    const frOption = page.locator('a:has-text("Français")');
    await frOption.click();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify URL changes to /fr/
    await expect(page).toHaveURL(/\/fr\/?$/);

    // Verify page content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

  test('should switch from French to English', async ({ page }) => {
    await page.goto('/fr/', { waitUntil: 'domcontentloaded' });

    // Hover over the language switcher to show dropdown
    const switcher = page.locator('button[aria-label="Switch language"]');
    await switcher.hover();

    // Wait for dropdown to be visible
    const dropdown = page.locator('.group-hover\\:opacity-100, .group-hover\\:visible');
    await dropdown.waitFor({ state: 'visible', timeout: 3000 });

    // Click English language option (contains "English" text)
    const enOption = page.locator('a:has-text("English")');
    await enOption.click();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify URL changes to root
    await expect(page).toHaveURL(/\/tech-blog\/?$/);

    // Verify page content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
  });

  test('should preserve language when navigating between pages', async ({ page }) => {
    // Start on Chinese home
    await page.goto('/zh/', { waitUntil: 'domcontentloaded' });

    // Navigate to About
    const aboutLink = page.locator('a[href*="about" i]').first();
    await aboutLink.click();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify language preserved (still on /zh/about)
    await expect(page).toHaveURL(/\/zh\/about/);

    // Go back to home
    await page.goBack();

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Verify language still Chinese
    await expect(page).toHaveURL(/\/zh\/?$/);
  });
});
