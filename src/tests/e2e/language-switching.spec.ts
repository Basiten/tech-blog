import { test, expect } from '@playwright/test';
import { languages } from '../fixtures/test-helpers';

test.describe('Language Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show language switcher dropdown', async ({ page }) => {
    const switcher = page.locator('#language-switcher, .language-switcher');
    await expect(switcher).toBeVisible();

    // Check all languages are present
    await expect(page.locator('[data-lang="en"]')).toBeVisible();
    await expect(page.locator('[data-lang="zh"]')).toBeVisible();
    await expect(page.locator('[data-lang="fr"]')).toBeVisible();
  });

  test('should switch from English to Chinese', async ({ page }) => {
    await page.goto('/');

    // Click Chinese language option
    const zhOption = page.locator('[data-lang="zh"]');
    await zhOption.click();

    // Verify URL changes to /zh/
    await expect(page).toHaveURL(/\/zh\/?$/);

    // Verify page content
    await expect(page.locator('h1')).toContainText(/欢迎|welcome|首页/i);
  });

  test('should switch from Chinese to French', async ({ page }) => {
    await page.goto('/zh/');

    // Click French language option
    const frOption = page.locator('[data-lang="fr"]');
    await frOption.click();

    // Verify URL changes to /fr/
    await expect(page).toHaveURL(/\/fr\/?$/);

    // Verify page content
    await expect(page.locator('h1')).toContainText(/bienvenue|welcome|accueil/i);
  });

  test('should switch from French to English', async ({ page }) => {
    await page.goto('/fr/');

    // Click English language option
    const enOption = page.locator('[data-lang="en"]');
    await enOption.click();

    // Verify URL changes to root
    await expect(page).toHaveURL(/\/tech-blog\/?$/);

    // Verify page content
    await expect(page.locator('h1')).toContainText(/welcome/i);
  });

  test('should preserve language when navigating between pages', async ({ page }) => {
    // Start on Chinese home
    await page.goto('/zh/');

    // Navigate to About
    const aboutLink = page.locator('a[href*="about" i]').first();
    await aboutLink.click();

    // Verify language preserved (still on /zh/about)
    await expect(page).toHaveURL(/\/zh\/about/);

    // Go back to home
    await page.goBack();

    // Verify language still Chinese
    await expect(page).toHaveURL(/\/zh\/?$/);
  });
});
