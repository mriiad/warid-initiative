import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

// The 404 is reachable at any time -- a stale link, a typo, or a non-admin
// hitting an admin-only route, which App.tsx answers with this page. Before
// issue #340 it was the only in-app screen with no bottom navigation, so
// landing there was a dead end apart from the single "back to home" button.
test.describe('Not found page', () => {
	test('a donor landing on an unknown URL still has the bottom nav', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await page.goto('/this-route-does-not-exist');

		await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('link', { name: 'الملف الشخصي' })).toBeVisible();
	});

	test('the nav is usable from the 404, not just present', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(
			page,
			'**/api/user/profile',
			fullProfileResponse({ firstname: 'Yassine', lastname: 'Alaoui' })
		);
		await page.goto('/some/missing/page');

		await page.getByRole('link', { name: 'الملف الشخصي' }).click();
		await expect(page).toHaveURL(/\/profile$/);
	});

	test('a non-admin sent to the 404 by an admin-only route can navigate away', async ({ page }) => {
		// /users is admin-gated, so App.tsx renders NotFoundPage for a donor.
		// This is the path an ordinary user is most likely to arrive by.
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await page.goto('/users');

		await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('link', { name: 'الرئيسية' })).toBeVisible();
	});

	test('the fixed nav does not cover the back-to-home button', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await page.goto('/nope');

		const button = page.getByRole('button', { name: 'العودة إلى الصفحة الرئيسية' });
		await expect(button).toBeVisible({ timeout: 5000 });

		const buttonBox = await button.boundingBox();
		const navBox = await page
			.getByRole('link', { name: 'الرئيسية' })
			.locator('xpath=ancestor::div[2]')
			.boundingBox();

		expect(buttonBox).not.toBeNull();
		expect(navBox).not.toBeNull();
		// The button must end above where the nav bar starts.
		expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(navBox!.y);
	});
});
