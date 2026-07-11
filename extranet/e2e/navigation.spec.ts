import { test, expect } from '@playwright/test';

test.describe('Basic navigation', () => {
	test('landing page renders', async ({ page }) => {
		await page.goto('/home');
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('unknown route renders the 404 page', async ({ page }) => {
		await page.goto('/this-route-does-not-exist');
		await expect(page.getByText('404')).toBeVisible();
		await expect(page.getByText(/isn't here/i)).toBeVisible();
	});

	test('FAQ page renders questions', async ({ page }) => {
		await page.goto('/FAQ?forceDesktop=1');
		await expect(page.getByText(/Find quick answers/i)).toBeVisible();
	});

	test('root path redirects to /home', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/home$/);
	});
});
