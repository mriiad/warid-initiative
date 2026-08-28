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

	test('an unconfirmed account shows the backend\'s activation message (issue #357)', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/login',
			{ message: 'Please confirm your email before logging in. Check your inbox for the activation link.' },
			{ status: 403, method: 'POST' }
		);
		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('correctpassword');
		await page.locator('button[type=submit]').click();

		await expect(
			page.getByText('Please confirm your email before logging in. Check your inbox for the activation link.')
		).toBeVisible({ timeout: 5000 });
	});

	test('an unconfirmed account can resend the activation email from the login page (issue #365)', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/login',
			{ message: 'Please confirm your email before logging in. Check your inbox for the activation link.' },
			{ status: 403, method: 'POST' }
		);
		let resendRequestBody: unknown = null;
		await page.route('**/api/auth/resend-activation', async (route) => {
			resendRequestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'sent' }),
			});
		});

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('correctpassword');
		await page.locator('button[type=submit]').click();

		// The resend field/button only appear for this specific 403 case, not
		// for a plain wrong-password rejection.
		const resendField = page.getByLabel('البريد الإلكتروني');
		await expect(resendField).toBeVisible({ timeout: 5000 });
		await resendField.fill('donor@example.com');
		await page.getByRole('button', { name: 'إعادة إرسال رابط التأكيد' }).click();

		await expect(page.getByText('تم إرسال رابط جديد')).toBeVisible({ timeout: 5000 });
		expect(resendRequestBody).toEqual({ email: 'donor@example.com' });
	});

	test('the resend-activation field does not appear for a plain wrong-password rejection', async ({ page }) => {
		await mockJson(page, '**/api/auth/login', { message: 'Wrong password.' }, { status: 401, method: 'POST' });
		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN123456');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('wrongpassword');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('Wrong password.')).toBeVisible({ timeout: 5000 });
		await expect(page.getByLabel('البريد الإلكتروني')).not.toBeVisible();
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
		await mockJson(page, '**/api/admin/stats', { totalUsers: 12, totalEvents: 3, totalDonations: 40, totalEmergencies: 0 });
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

	test('a brand-new user with an INCOMPLETE profile is redirected to /update-profile, not /dashboard -- issue #195', async ({ page }) => {
		// Simulate realistic network latency: on a real (especially mobile)
		// connection this call can take anywhere from tens of milliseconds to
		// a couple of seconds -- slow enough to still be in flight well after
		// the login form has moved on.
		let sawAuthenticatedRequest = false;
		await page.route('**/api/user/check-profile', async (route: Route) => {
			sawAuthenticatedRequest = true;
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

	test('a slow initial check-profile response never reaches the login page, doesn\'t wipe the session -- issue #195', async ({ page }) => {
		// useCheckProfileCompleteness() used to fire unconditionally on
		// mount -- before any token exists, guaranteeing a 401 from the
		// isAuth-gated backend route on every single /login page load. That
		// call isn't cancelled at the network level when login later succeeds
		// (React Query drops its own bookkeeping, but the in-flight axios
		// request keeps running); if it happens to resolve *after* the user
		// has already been routed past /login, apiClient's global response
		// interceptor treats that late 401 as "session expired" -- wiping the
		// freshly-set token and hard-redirecting back to /login via
		// window.location.href, discarding the just-completed login.
		//
		// Reproduced empirically: a login this fast combined with an
		// unauthenticated check-profile response this slow used to leave the
		// user routed correctly to /update-profile for a moment, then
		// silently bounced back to /login with localStorage wiped a few
		// seconds later.
		let unauthenticatedCallCount = 0;
		await page.route('**/api/user/check-profile', async (route: Route) => {
			const hasAuth = !!route.request().headers()['authorization'];
			if (!hasAuth) {
				unauthenticatedCallCount += 1;
				await new Promise((r) => setTimeout(r, 2000));
				return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Not authenticated.' }) });
			}
			await new Promise((r) => setTimeout(r, 100));
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

		// Wait past the slow response's arrival time and confirm the user is
		// still there, still logged in, and that no unauthenticated request
		// was ever made in the first place.
		await page.waitForTimeout(2500);
		await expect(page).toHaveURL(/\/update-profile/);
		expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('fake-token');
		expect(unauthenticatedCallCount).toBe(0);
	});

	// Both admin post-login flows land on /home, which renders AdminDashboard
	// regardless of role (isAdmin is App.tsx's only gate on that route) --
	// same mock set as the #297 admin-login test above.
	const mockAdminHomeDependencies = async (page: import('@playwright/test').Page) => {
		await mockJson(page, '**/api/user/check-profile', { isProfileComplete: true }, { status: 200 });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', { firstname: 'Sara', lastname: 'Idrissi', gender: 'female' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });
	};

	test('an admin role in the login response is persisted (issue #183)', async ({ page }) => {
		await mockJson(page, '**/api/auth/login', {
			token: 'fake-token',
			refreshToken: 'fake-refresh',
			userId: 'admin-1',
			isAdmin: true,
			role: 'event',
		}, { status: 200, method: 'POST' });
		await mockAdminHomeDependencies(page);

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN999999');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });
		expect(await page.evaluate(() => localStorage.getItem('adminRole'))).toBe('event');
	});

	test('a legacy admin with no role in the login response stores no adminRole (issue #183)', async ({ page }) => {
		// requireAdminRole.js / adminAccess.ts both treat a missing role the
		// same as principal (full access) -- nothing here should ever store
		// the literal string "undefined".
		await mockJson(page, '**/api/auth/login', {
			token: 'fake-token',
			refreshToken: 'fake-refresh',
			userId: 'admin-1',
			isAdmin: true,
		}, { status: 200, method: 'POST' });
		await mockAdminHomeDependencies(page);

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('CIN999999');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/home$/, { timeout: 10000 });
		expect(await page.evaluate(() => localStorage.getItem('adminRole'))).toBeNull();
	});
});
