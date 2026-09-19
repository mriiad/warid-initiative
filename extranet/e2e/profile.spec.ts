import { test, expect, Route } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

test.describe('Profile page', () => {
	test('renders a complete profile correctly', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Yassine', lastname: 'Alaoui' }));
		await page.goto('/profile');
		await expect(page.getByText('Yassine', { exact: true })).toBeVisible();
		// The redesigned page shows the last name in both the combined
		// "Yassine Alaoui" header and its own info row, so target the info row.
		await expect(page.getByText('Alaoui', { exact: true })).toBeVisible();
	});

	test('FIXED (issue #204): saving profile edits hits the self-service PATCH /api/user/profile endpoint, not the admin-only /api/users/:userId route', async ({ page }) => {
		// Was: ProfileComponent.tsx's handleUpdateProfile called
		// updateProfileMutation.mutate({ userId: 'me', data }), which resolved
		// to `PUT /api/users/me` -- the ADMIN-ONLY updateUserById route
		// (guarded by checkIfAdmin). For a non-admin (every normal donor) this
		// 403'd; for an admin, `User.findById('me')` threw the exact Mongoose
		// CastError reported in issue #204.
		//
		// Now: ProfileComponent uses useUpdateMyProfile(), which PATCHes
		// /api/user/profile directly -- the self-service route that resolves
		// the user from the auth token server-side, matching GET's endpoint.
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/user/profile', fullProfileResponse(), { method: 'GET' });

		let adminRouteWasCalled = false;
		await page.route('**/api/users/me', async (route: Route) => {
			adminRouteWasCalled = true;
			await route.fulfill({
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'User must be an Admin to call this API.' }),
			});
		});

		let capturedUrl = '';
		let capturedMethod = '';
		await page.route('**/api/user/profile', async (route: Route) => {
			if (route.request().method() === 'PATCH') {
				capturedUrl = route.request().url();
				capturedMethod = route.request().method();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Profile updated successfully!' }),
				});
				return;
			}
			return route.fallback();
		});

		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
		await page.getByRole('button', { name: 'تعديل' }).click();

		const saveButton = page.getByRole('button', { name: 'حفظ التغييرات' });
		await saveButton.click({ timeout: 5000 });
		await expect(page.getByText('تم تحديث الملف الشخصي بنجاح')).toBeVisible({ timeout: 5000 });

		expect(capturedUrl).toContain('/api/user/profile');
		expect(capturedMethod).toBe('PATCH');
		expect(adminRouteWasCalled).toBe(false);
	});

	test('the logout button signs the user out and redirects to /login', async ({ page }) => {
		// Logout used to only be wired up in AdminDashboard and the legacy
		// nav components (neither reachable from a redesigned donor screen),
		// leaving non-admin users with no way to sign out at all.
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/user/profile', fullProfileResponse(), { method: 'GET' });

		let logoutCalled = false;
		await page.route('**/api/auth/logout', async (route) => {
			logoutCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Logged out successfully!' }) });
		});

		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
		await page.getByRole('button', { name: 'تسجيل الخروج' }).click();

		await expect(page).toHaveURL(/\/login/);
		expect(logoutCalled).toBe(true);
	});

	test('regression (issue #307): a failed logout is shown via the shared error toast', async ({ page }) => {
		// useLogout's onError used to be console.error(...) and nothing else --
		// a failed logout request left the user stuck on the page with zero
		// indication anything had gone wrong.
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/user/profile', fullProfileResponse(), { method: 'GET' });
		await mockJson(page, '**/api/auth/logout', { message: 'Could not reach the session store.' }, { status: 500, method: 'POST' });

		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
		await page.getByRole('button', { name: 'تسجيل الخروج' }).click();

		// The error is still surfaced -- a failed logout must not be swallowed.
		await expect(page.getByText('Could not reach the session store.')).toBeVisible({ timeout: 5000 });
		// What changed (issue #404): the user is logged out anyway. Clearing
		// the device is the part that must never fail -- this used to leave
		// every token in localStorage, so someone who pressed "log out" on a
		// shared device was still logged in behind the toast.
		await expect(page).toHaveURL(/\/login/);
		const leftovers = await page.evaluate(() =>
			['token', 'refreshToken', 'userId', 'isAdmin', 'adminRole'].filter((k) =>
				localStorage.getItem(k)
			)
		);
		expect(leftovers).toEqual([]);
	});

	test('regression (issue #328): the Help & Support links reach the FAQ and Contact us pages', async ({ page }) => {
		// /FAQ and /contact still existed and were redesigned onto the same
		// styling system, but nothing in the redesigned navigation linked to
		// either one -- the only thing that ever did was the old,
		// pre-redesign MobileNavbar, which no route a normal user visits
		// renders anymore.
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/user/profile', fullProfileResponse(), { method: 'GET' });

		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
		await expect(page.getByText('المساعدة والدعم')).toBeVisible();

		await page.getByRole('button', { name: 'الأسئلة الشائعة' }).click();
		await expect(page).toHaveURL(/\/FAQ/);

		await page.goBack();
		await expect(page.getByText('المساعدة والدعم')).toBeVisible();
		await page.getByRole('button', { name: 'تواصل معنا' }).click();
		await expect(page).toHaveURL(/\/contact/);
	});

	// Issue #466. A number stored without its country code was handed to the
	// phone field verbatim, so it rendered as bare national digits -- the
	// missing leading zero the tester saw. Saving then failed, because the
	// form's own validator requires E.164 (`/^\+[1-9]\d{6,14}$/`), leaving no
	// way forward except typing the country code by hand on every edit.
	const openProfileEditor = async (page: import('@playwright/test').Page, stored: string) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/user/profile', { ...fullProfileResponse(), phoneNumber: stored }, { method: 'GET' });
		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
		await page.getByRole('button', { name: 'تعديل' }).click();
		return page.locator('input[type=tel]');
	};

	test('a number stored without its country code is shown in full (issue #466)', async ({ page }) => {
		const phone = await openProfileEditor(page, '612345678');
		await expect(phone).toHaveValue('+212 6 12 34 56 78');
	});

	test('a number stored in Moroccan local format is shown in full too (issue #466)', async ({ page }) => {
		// The legacy shape documented in routes/user.js: '0612345678'. The
		// leading 0 is the national trunk prefix, which E.164 drops.
		const phone = await openProfileEditor(page, '0612345678');
		await expect(phone).toHaveValue('+212 6 12 34 56 78');
	});

	test('a number already in E.164 is left exactly as it is (issue #466)', async ({ page }) => {
		const phone = await openProfileEditor(page, '+212612345678');
		await expect(phone).toHaveValue('+212 6 12 34 56 78');
	});

	test('a non-Moroccan number is not rewritten to +212 (issue #466)', async ({ page }) => {
		const phone = await openProfileEditor(page, '+33612345678');
		await expect(phone).toHaveValue('+33 6 12 34 56 78');
	});

	test('saving a profile whose number was stored without a country code succeeds (issue #466)', async ({ page }) => {
		// The reported failure end to end: open the form, change nothing about
		// the phone, press save. It used to be refused by the E.164 validator.
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		let patchedPhone: string | null = null;
		await page.route('**/api/user/profile', async (route: Route) => {
			if (route.request().method() === 'PATCH') {
				patchedPhone = route.request().postDataJSON()?.phoneNumber ?? null;
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Profile updated successfully!' }),
				});
				return;
			}
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ ...fullProfileResponse(), phoneNumber: '612345678' }),
			});
		});

		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible();
		await page.getByRole('button', { name: 'تعديل' }).click();
		await page.getByRole('button', { name: 'حفظ التغييرات' }).click();

		await expect(page.getByText('تم تحديث الملف الشخصي بنجاح')).toBeVisible({ timeout: 5000 });
		// And it is sent back in the canonical shape, not as bare digits.
		expect(patchedPhone).toBe('+212612345678');
	});
});
