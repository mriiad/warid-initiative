import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, dashboardResponse } from './support/mockApi';

test.describe('Dashboard', () => {
	test('renders donation stats and history for a returning donor', async ({ page }) => {
		await seedAuth(page, { userId: 'user-1' });
		await mockJson(page, '**/api/users/user-1/dashboard', dashboardResponse());
		await page.goto('/dashboard');
		await expect(page.getByText('سجل تبرعاتك')).toBeVisible();
		await expect(page.getByText('Regular Donation')).toBeVisible();
	});

	test('a brand-new user sees the empty-state welcome screen, not an error (regression test for issue #203)', async ({ page }) => {
		// getDashboard used to return HTTP 404 for a user with no donations
		// yet, which Axios throws on, so Dashboard.tsx's `isError` branch
		// rendered a raw error message instead of the empty-state UI. Fixed
		// to return 200 with an empty donations array.
		await seedAuth(page, { userId: 'new-user' });
		await mockJson(page, '**/api/users/new-user/dashboard', { donations: [] }, { status: 200 });
		await page.goto('/dashboard');
		await expect(page.getByText('!لم تقم بأي تبرع بعد')).toBeVisible({ timeout: 5000 });
	});
});
