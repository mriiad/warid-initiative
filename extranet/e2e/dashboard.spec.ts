import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, dashboardResponse, dashboardNoDonationsResponse } from './support/mockApi';

test.describe('Dashboard', () => {
	test('renders donation stats and history for a returning donor', async ({ page }) => {
		await seedAuth(page, { userId: 'user-1' });
		await mockJson(page, '**/api/users/user-1/dashboard', dashboardResponse());
		await page.goto('/dashboard');
		await expect(page.getByText('Your donations history')).toBeVisible();
		await expect(page.getByText('Regular Donation')).toBeVisible();
	});

	test('BUG: a brand-new user sees a raw error message instead of the empty-state welcome screen (issue #203)', async ({ page }) => {
		// Dashboard.tsx already HAS a proper empty-state UI ready
		// ("You haven't made any donations yet!" + a call to action) for
		// `donations.length === 0`. But the real backend's getDashboard
		// returns HTTP 404 with { errorMessage: "No donations found for this
		// user." } for a user with no donations (see
		// e2e/backend/user.spec.js), instead of 200 with an empty array.
		// Axios throws on a 404, so react-query's `isError` becomes true, and
		// Dashboard.tsx's `if (isError) return <Typography color='error'>...`
		// branch renders a raw "Error loading dashboard" message -- the nice
		// empty state the component was clearly built to show is
		// unreachable for exactly the users who'd see it most (first-timers).
		await seedAuth(page, { userId: 'new-user' });
		await mockJson(page, '**/api/users/new-user/dashboard', dashboardNoDonationsResponse(), { status: 404 });
		await page.goto('/dashboard');
		await expect(page.getByText("You haven't made any donations yet!")).toBeVisible({ timeout: 5000 });
	});
});
