import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

// The bottom nav is the only navigation on the redesigned screens, so which
// icons it offers is the whole of what a visitor can reach by tapping.
const bottomNav = (page: import('@playwright/test').Page) =>
	page.locator('[class*="wrapper"]:has(a[aria-label])').first();

test.describe('Profile nav icon', () => {
	test('a logged-out visitor is not offered a profile icon (issue #451)', async ({ page }) => {
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await page.goto('/home');

		const nav = bottomNav(page);
		// The public destinations are still there -- this is about removing one
		// icon, not about leaving a guest with no navigation.
		await expect(nav.getByLabel('الصفحة الرئيسية')).toBeVisible({ timeout: 5000 });
		await expect(nav.getByLabel('التقويم')).toBeVisible();
		await expect(nav.getByLabel('طوارئ', { exact: true })).toBeVisible();

		await expect(nav.getByLabel('الملف الشخصي')).toHaveCount(0);
	});

	test('a logged-out visitor still has a way to sign in (issue #451)', async ({ page }) => {
		// Guards the fix against over-reach: the landing hero's account button
		// is a different control from the nav icon, it is labelled "my
		// account", and it correctly sends a guest to login rather than to a
		// profile page there is no session for. Removing it would leave the
		// landing page with no route to authentication at all.
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await page.goto('/home');

		await page.getByRole('button', { name: 'حسابي' }).click();
		await expect(page).toHaveURL(/\/login$/);
	});

	test('a donor can reach the profile page from the bottom nav on /dashboard', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/users/user-1/dashboard', { donations: [] });
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Yassine', lastname: 'Alaoui' }));
		await page.goto('/dashboard');
		await expect(page.getByRole('link', { name: 'الملف الشخصي' })).toBeVisible({ timeout: 5000 });
		await page.getByRole('link', { name: 'الملف الشخصي' }).click();
		await expect(page).toHaveURL(/\/profile$/);
		await expect(page.getByText('Yassine', { exact: true })).toBeVisible({ timeout: 5000 });
	});

	test('an admin can also reach the profile page from the bottom nav on /home', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Mahmoud' }));
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');
		await expect(page.getByRole('link', { name: 'الملف الشخصي' })).toBeVisible({ timeout: 5000 });
		await page.getByRole('link', { name: 'الملف الشخصي' }).click();
		await expect(page).toHaveURL(/\/profile$/);
	});
});
