import { test, expect, Route } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Login', () => {
	test('BUG: native required popup pre-empts the custom Arabic "username required" message', async ({ page }) => {
		await page.goto('/login');
		await page.getByRole('button', { name: 'دخول' }).click().catch(async () => {
			// Fall back to a more permissive submit button match if the exact
			// label differs.
			await page.locator('button[type=submit]').click();
		});
		await expect(page.getByText('اسم المستخدم مطلوب')).toBeVisible();
	});

	test('wrong credentials show an error and keep the user on /login', async ({ page }) => {
		await mockJson(page, '**/api/auth/login', { message: 'Wrong password.' }, { status: 401, method: 'POST' });
		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByLabel('كلمة المرور').fill('wrongpassword');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/\/login/);
	});

	test('a user with a complete profile is redirected to /dashboard', async ({ page }) => {
		await mockJson(page, '**/api/auth/login', {
			token: 'fake-token',
			refreshToken: 'fake-refresh',
			userId: 'user-1',
			isAdmin: false,
		}, { status: 200, method: 'POST' });
		await mockJson(page, '**/api/user/check-profile', { isProfileComplete: true }, { status: 200 });

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByLabel('كلمة المرور').fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
	});

	test('BUG: a brand-new user with an INCOMPLETE profile is still redirected to /dashboard instead of /update-profile', async ({ page }) => {
		// LoginForm calls useCheckProfileCompleteness() unconditionally on
		// mount, i.e. before any auth token exists, so that first call 401s.
		// useLogin's onSuccess handler then calls `queryClient.clear()`,
		// wiping the (already-401'd) cached result right as the redirect
		// effect needs to read it, and the freshly authenticated refetch
		// hasn't resolved yet. The effect's guard
		// `profileCompleteness.data?.data && !isProfileComplete` is falsy
		// while data is undefined, so it always falls through to the `else`
		// branch and navigates to /dashboard -- even for a user who has never
		// filled in their profile.
		let sawAuthenticatedRequest = false;
		await page.route('**/api/user/check-profile', async (route: Route) => {
			const hasAuth = !!route.request().headers()['authorization'];
			if (!hasAuth) {
				return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated.' }) });
			}
			sawAuthenticatedRequest = true;
			// Simulate realistic network latency for the authenticated retry.
			await new Promise((r) => setTimeout(r, 400));
			return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ isProfileComplete: false }) });
		});
		await mockJson(page, '**/api/auth/login', {
			token: 'fake-token',
			refreshToken: 'fake-refresh',
			userId: 'new-user',
			isAdmin: false,
		}, { status: 200, method: 'POST' });

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByLabel('كلمة المرور').fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/update-profile/, { timeout: 3000 });
		expect(sawAuthenticatedRequest).toBe(true);
	});
});
