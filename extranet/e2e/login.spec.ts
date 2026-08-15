import { test, expect, Route } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Login', () => {
	test('the custom Arabic "username required" message appears on submit (fixed: form has noValidate)', async ({ page }) => {
		await page.goto('/login');
		await page.getByRole('button', { name: 'دخول' }).click().catch(async () => {
			// Fall back to a more permissive submit button match if the exact
			// label differs.
			await page.locator('button[type=submit]').click();
		});
		await expect(page.getByText('اسم المستخدم مطلوب')).toBeVisible();
	});

	test('wrong credentials show an error and keep the user on /login', async ({ page }) => {
		// Regression test for issue #293: this test's own name was the bug --
		// it asserted the URL stayed on /login and called that "shows an
		// error", but never checked anything was actually rendered. Nothing
		// was: useLogin's onError just logged to the console, and LoginForm
		// never read login.isError/login.error, so a wrong password silently
		// returned the user to an unchanged form with the spinner gone and no
		// explanation.
		await mockJson(page, '**/api/auth/login', { message: 'Wrong password.' }, { status: 401, method: 'POST' });
		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('wrongpassword');
		await page.locator('button[type=submit]').click();

		// The backend's own message is surfaced as-is (same convention as
		// ProfileComponent/EventForm elsewhere in the app).
		await expect(page.getByText('Wrong password.')).toBeVisible({ timeout: 5000 });
		await expect(page).toHaveURL(/\/login/);
	});

	test('a translated fallback message is shown when the backend response has no message field', async ({ page }) => {
		await mockJson(page, '**/api/auth/login', {}, { status: 401, method: 'POST' });
		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('wrongpassword');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('اسم المستخدم أو كلمة المرور غير صحيحة')).toBeVisible({ timeout: 5000 });
	});

	test('retrying after a failed login clears the previous error', async ({ page }) => {
		let attempt = 0;
		await page.route('**/api/auth/login', async (route: Route) => {
			attempt += 1;
			if (attempt === 1) {
				return route.fulfill({
					status: 401,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Wrong password.' }),
				});
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					token: 'fake-token',
					refreshToken: 'fake-refresh',
					userId: 'user-1',
					isAdmin: false,
				}),
			});
		});
		await mockJson(page, '**/api/user/check-profile', { isProfileComplete: true }, { status: 200 });

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('wrongpassword');
		await page.locator('button[type=submit]').click();
		await expect(page.getByText('Wrong password.')).toBeVisible({ timeout: 5000 });

		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('correctpassword');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
		await expect(page.getByText('Wrong password.')).toHaveCount(0);
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
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
	});

	test('an admin with a complete profile is redirected to /home (their overview), not /dashboard (the donor screen) -- issue #297', async ({ page }) => {
		// '/dashboard' unconditionally renders the donor Dashboard component
		// regardless of role, so an admin who landed there previously saw
		// "you haven't donated yet, join our community of heroes" instead of
		// their actual overview.
		await mockJson(page, '**/api/auth/login', {
			token: 'fake-token',
			refreshToken: 'fake-refresh',
			userId: 'admin-1',
			isAdmin: true,
		}, { status: 200, method: 'POST' });
		await mockJson(page, '**/api/user/check-profile', { isProfileComplete: true }, { status: 200 });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 12, totalEvents: 3, totalDonations: 40 });
		await mockJson(page, '**/api/user/profile', { firstname: 'Sara', lastname: 'Idrissi', gender: 'female' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN999999');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });
		await expect(page.getByText('Sara', { exact: false })).toBeVisible({ timeout: 5000 });
		// The donor empty-state Dashboard would show this exact string.
		await expect(page.getByText('!لم تقم بأي تبرع بعد')).toHaveCount(0);
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
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/update-profile/, { timeout: 3000 });
		expect(sawAuthenticatedRequest).toBe(true);
	});
});
