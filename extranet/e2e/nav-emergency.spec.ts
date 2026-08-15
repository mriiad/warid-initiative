import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

/**
 * Regression test for issue #291: RedesignBottomNav -- the bottom nav
 * rendered on every screen -- had no entry for '/emergency' at all, so the
 * public blood-request form was unreachable from navigation for every user,
 * admin or not. The only other nav bar with an emergency link
 * (MobileNavbar) is unreachable in practice: App.tsx's FULL_SCREEN_ROUTES
 * covers essentially every route, and each of those renders its own
 * RedesignBottomNav instead of the app chrome MobileNavbar lives in.
 */
test.describe('Emergency nav icon', () => {
	test('a donor can reach the emergency form from the bottom nav on /home', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });

		await page.goto('/home');
		await expect(page.getByText('جمعية مغربية', { exact: false })).toBeVisible({ timeout: 5000 });

		await page.getByRole('link', { name: 'طوارئ' }).click();
		await expect(page).toHaveURL(/\/emergency$/);
		// EmergencyForm itself, confirming the right screen actually mounted
		// rather than just the URL changing. Generous timeout: this is the
		// first time in the test that EmergencyForm's lazy chunk is requested,
		// and that cold compile can be slow under a contended dev server.
		await expect(page.getByRole('combobox').first()).toBeVisible({ timeout: 10000 });
	});

	test('an admin can also reach the emergency form from the bottom nav on /home', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });

		await page.goto('/home');
		await expect(page.getByRole('link', { name: 'طوارئ' })).toBeVisible({ timeout: 5000 });

		await page.getByRole('link', { name: 'طوارئ' }).click();
		await expect(page).toHaveURL(/\/emergency$/);
	});
});
