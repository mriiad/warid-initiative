import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

/**
 * Regression test for issue #292: '/home' -- the destination of the bottom
 * nav's Home icon -- always rendered the public LandingPage for a non-admin
 * user, regardless of login state. LoginForm navigates to '/dashboard' once
 * on a successful login, but nothing else in the app links there, so a
 * donor's dashboard was reachable exactly once, right after logging in, and
 * permanently unreachable afterwards -- tapping Home (or any other nav icon
 * and back) took them to the public marketing page instead.
 *
 * Fix: '/home' now resolves to Dashboard for a logged-in donor, the same way
 * it already resolved to AdminDashboard for a logged-in admin. LandingPage
 * remains the destination only for a logged-out visitor.
 */
test.describe('Home routing by auth state (issue #292)', () => {
	test('a logged-out visitor sees the public landing page at /home', async ({ page }) => {
		await page.goto('/home');
		await expect(page.getByText('جمعية مغربية', { exact: false })).toBeVisible({ timeout: 5000 });
	});

	test('a logged-in donor sees their dashboard at /home, not the public landing page', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/users/user-1/dashboard', {
			stats: { total: 3, lastDonation: '2026-01-01', eligibleIn: '-' },
			donations: [{ id: 'd1', event: 'Collecte de sang', date: '2026-01-01', type: 'Regular Donation' }],
		});

		await page.goto('/home');

		await expect(page.getByText('Regular Donation')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('جمعية مغربية', { exact: false })).toHaveCount(0);
	});

	test('a logged-in donor can navigate away from /home and back via the bottom nav, and still sees the dashboard', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/users/user-1/dashboard', { donations: [] });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });

		await page.goto('/home');
		await expect(page.getByText('لم تقم بأي تبرع بعد')).toBeVisible({ timeout: 5000 });

		// Away, then back via the same Home nav icon reported as a dead end.
		// RedesignBottomNav labels this item 'nav.calendar', not 'nav.events'.
		await page.getByRole('link', { name: 'التقويم' }).click();
		await expect(page).toHaveURL(/\/events/);

		await page.getByRole('link', { name: 'الصفحة الرئيسية' }).click();
		await expect(page).toHaveURL(/\/home$/);
		await expect(page.getByText('لم تقم بأي تبرع بعد')).toBeVisible({ timeout: 10000 });
	});
});
