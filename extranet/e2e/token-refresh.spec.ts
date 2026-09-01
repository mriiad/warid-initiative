import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

/**
 * Regression tests for issue #304.
 *
 * apiClient (used by every real service call) used to react to *any* 401 by
 * wiping the session and hard-redirecting to /login -- it never attempted to
 * use the refresh token. A separate interceptor patched onto the global
 * axios object did know how to refresh-and-retry, but nothing routed real
 * traffic through plain axios, so that logic never actually ran. Every
 * access-token expiry force-logged users out even though their still-valid
 * refresh token could have kept them signed in silently.
 */
test.describe('Silent token refresh on an expired access token', () => {
	test('an expired access token is refreshed transparently, without bouncing the user to /login', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });

		let dashboardCallCount = 0;
		await page.route('**/api/users/user-1/dashboard', async (route) => {
			dashboardCallCount += 1;
			const hasStaleToken =
				route.request().headers()['authorization'] === 'Bearer fake-jwt-token';
			if (hasStaleToken) {
				return route.fulfill({
					status: 401,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Token expired.' }),
				});
			}
			// The retried request, now carrying the refreshed token.
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ donations: [{ id: 'd1', event: 'Casablanca Event', date: '2026-01-01', type: 'Regular Donation' }] }),
			});
		});

		let refreshCalled = false;
		await page.route('**/api/auth/refresh-token', async (route) => {
			refreshCalled = true;
			expect(route.request().postDataJSON()).toEqual({ refreshToken: 'fake-refresh-token' });
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ accessToken: 'fresh-jwt-token', refreshToken: 'fresh-refresh-token' }),
			});
		});

		await page.goto('/dashboard');

		// The dashboard's own data renders -- the failed first attempt was
		// invisible to the user, retried transparently with the new token.
		await expect(page.getByText('Regular Donation')).toBeVisible({ timeout: 5000 });
		await expect(page).toHaveURL(/\/dashboard/);

		expect(refreshCalled).toBe(true);
		expect(dashboardCallCount).toBe(2);
		expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('fresh-jwt-token');
		expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBe('fresh-refresh-token');
	});

	test('a refresh token that is itself invalid still logs the user out', async ({ page }) => {
		// Seeded via page.evaluate() rather than seedAuth()'s addInitScript,
		// deliberately: an addInitScript fixture re-runs on every navigation
		// within the page, including the hard window.location.href redirect
		// this test expects -- which would silently re-plant the very tokens
		// being asserted as cleared, and mask the bug this test exists to
		// catch.
		await page.goto('/login');
		await page.evaluate(() => {
			localStorage.setItem('token', 'fake-jwt-token');
			localStorage.setItem('refreshToken', 'fake-refresh-token');
			localStorage.setItem('userId', 'user-1');
			localStorage.setItem('isAdmin', 'false');
		});

		await mockJson(page, '**/api/users/user-1/dashboard', { message: 'Token expired.' }, { status: 401 });
		await mockJson(page, '**/api/auth/refresh-token', { message: 'Invalid refresh token.' }, { status: 401 });

		await page.goto('/dashboard');

		await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
		expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
		expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
	});

	test('several requests hitting a 401 at once share a single refresh call (issue #373)', async ({ page }) => {
		// A page that fires several parallel queries on load (the admin home
		// dashboard) is exactly the shape that used to trigger this: every one
		// of the 401s independently called attemptRefresh() with the same
		// refresh token. The backend rotates refresh tokens (single-use), so
		// only the first of those concurrent calls actually succeeded -- the
		// rest got REFRESH_TOKEN_NOT_VALID and force-logged the user out, even
		// though the session was in fact still good.
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });

		// Keyed by endpoint rather than by "carries the stale token": React's
		// dev-mode double-invoking of effects can duplicate a request, and a
		// duplicate issued after the (by-then-completed) refresh would carry
		// the fresh token on its very first real attempt -- racy either way to
		// assert against. Failing each endpoint's first hit unconditionally,
		// regardless of which token it carries, keeps the scenario (several
		// endpoints all needing a refresh at once) deterministic.
		const staleThenOk = (body: object) => {
			let hasFailedOnce = false;
			return async (route: import('@playwright/test').Route) => {
				const shouldFail = !hasFailedOnce;
				hasFailedOnce = true;
				await route.fulfill({
					status: shouldFail ? 401 : 200,
					contentType: 'application/json',
					body: JSON.stringify(shouldFail ? { message: 'Token expired.' } : body),
				});
			};
		};

		await page.route('**/api/admin/stats', staleThenOk({ totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 }));
		await page.route('**/api/user/check-profile', staleThenOk({ isProfileComplete: true }));
		await page.route('**/api/user/profile', staleThenOk({ firstname: 'Admin', lastname: 'One', gender: 'male' }));
		await page.route('**/api/events*', staleThenOk({ events: [], totalItems: 0 }));
		await page.route('**/api/unconfirmedEmergencies*', staleThenOk({ emergencies: [], totalItems: 0 }));
		await page.route('**/api/users/admin-1/dashboard', staleThenOk({ donations: [] }));

		let refreshCallCount = 0;
		await page.route('**/api/auth/refresh-token', async (route) => {
			refreshCallCount += 1;
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ accessToken: 'fresh-jwt-token', refreshToken: 'fresh-refresh-token' }),
			});
		});

		await page.goto('/home');

		// The dashboard renders normally -- none of the six concurrent 401s
		// bounced the user to /login.
		await expect(page).toHaveURL(/\/home/, { timeout: 5000 });
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/\/home/);
		expect(refreshCallCount).toBe(1);
		expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('fresh-jwt-token');
	});

	test('a login attempt with the wrong password does not trigger a refresh attempt', async ({ page }) => {
		// /api/auth/login is excluded from the retry-on-401 logic -- there is
		// no session to refresh yet, and a wrong password is not an expired
		// token.
		let refreshCalled = false;
		await page.route('**/api/auth/refresh-token', async (route) => {
			refreshCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
		});
		await mockJson(page, '**/api/auth/login', { message: 'Wrong password.' }, { status: 401, method: 'POST' });

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('wrongpassword');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('Wrong password.')).toBeVisible({ timeout: 5000 });
		expect(refreshCalled).toBe(false);
	});
});
