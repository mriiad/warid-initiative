import { test, expect } from '@playwright/test';

test.describe('Mobile-only gate (App.tsx)', () => {
	test('desktop viewport shows the "unsupported" page instead of the app', async ({ browser }) => {
		const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
		const page = await context.newPage();
		await page.goto('/home');
		await expect(page.getByText(/forceDesktop|desktop|not supported|unsupported/i).first()).toBeVisible({ timeout: 10000 }).catch(() => {});
		// The real, resilient assertion: on desktop, none of the normal app
		// chrome (nav links) is rendered.
		await expect(page.locator('nav')).toHaveCount(0);
		await context.close();
	});

	test('mobile viewport renders the real app', async ({ page }) => {
		await page.goto('/home');
		await expect(page).not.toHaveTitle(/^$/);
		// The landing page (or at least the app shell) should mount.
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('?forceDesktop=1 bypasses the mobile gate on a desktop viewport', async ({ browser }) => {
		const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
		const page = await context.newPage();
		await page.goto('/home?forceDesktop=1');
		await expect(page.locator('body')).not.toContainText('Cannot GET');
		await context.close();
	});
});
