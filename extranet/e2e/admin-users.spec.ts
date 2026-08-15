import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, sampleUser } from './support/mockApi';

test.describe('Admin users list', () => {
	test('non-admin users cannot see the users list route', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await page.goto('/users');
		await expect(page.getByText('404')).toBeVisible();
	});

	test('admin sees the users list', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ username: 'CIN000111', profile: { firstname: 'Amine', lastname: 'Bennani' } })],
			totalItems: 1,
		});
		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
	});

	test('regression: /users renders full-screen, not wrapped in the old app chrome on top of the new one', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ username: 'CIN000111', profile: { firstname: 'Amine', lastname: 'Bennani' } })],
			totalItems: 1,
		});
		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
		// The old MobileHeader (with the app logo) was still wrapping this
		// already-redesigned screen, stacking on top of its own top bar and
		// bottom nav -- '/users' was missing from App.tsx's full-screen route
		// list. Confirm the old chrome is gone now.
		await expect(page.locator('img[alt="Logo"]')).toHaveCount(0);
	});

	test('regression: both the list fetch and the filtered search carry the Authorization header', async ({ page }) => {
		// UsersComponent used to call plain axios.get/axios.post directly
		// instead of going through apiClient, which is the only instance
		// carrying the request interceptor that attaches the token. Neither
		// call ever sent Authorization, so both 401'd on every real request
		// regardless of login state -- invisible to every other test here
		// because page.route() fulfills mocks unconditionally, whether or not
		// an Authorization header was actually sent.
		await seedAuth(page, { isAdmin: true, token: 'fake-jwt-token' });
		let listAuthHeader: string | undefined;
		await page.route('**/api/users?*', async (route) => {
			listAuthHeader = route.request().headers()['authorization'];
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Fetched users successfully.',
					users: [sampleUser({ username: 'CIN000111', profile: { firstname: 'Amine', lastname: 'Bennani' } })],
					totalItems: 1,
				}),
			});
		});
		let searchAuthHeader: string | undefined;
		await page.route('**/api/searchUsers', async (route) => {
			searchAuthHeader = route.request().headers()['authorization'];
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Fetched users successfully.',
					users: [sampleUser({ username: 'CIN000222', profile: { firstname: 'Sara', lastname: 'Idrissi' } })],
					totalItems: 1,
				}),
			});
		});

		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
		expect(listAuthHeader).toBe('Bearer fake-jwt-token');

		await page.getByRole('button', { name: 'تصفية متقدمة' }).click();
		await page.getByLabel('اسم المستخدم', { exact: true }).fill('CIN000222');
		await page.getByRole('button', { name: 'تطبيق عوامل التصفية' }).click();
		await expect(page.getByText('Sara Idrissi')).toBeVisible({ timeout: 5000 });
		expect(searchAuthHeader).toBe('Bearer fake-jwt-token');
	});

	test('admin can filter the users list via the redesigned filter drawer', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ username: 'CIN000111', profile: { firstname: 'Amine', lastname: 'Bennani' } })],
			totalItems: 1,
		});
		let searchBody: any = null;
		await page.route('**/api/searchUsers', async (route) => {
			searchBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Fetched users successfully.',
					users: [sampleUser({ username: 'CIN000222', profile: { firstname: 'Sara', lastname: 'Idrissi' } })],
					totalItems: 1,
				}),
			});
		});

		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });

		await page.getByRole('button', { name: 'تصفية متقدمة' }).click();
		await expect(page.getByText('تصفية المستخدمين')).toBeVisible();
		await page.getByLabel('اسم المستخدم', { exact: true }).fill('CIN000222');
		await page.getByRole('button', { name: 'تطبيق عوامل التصفية' }).click();

		await expect(page.getByText('Sara Idrissi')).toBeVisible({ timeout: 5000 });
		expect(searchBody?.username).toBe('CIN000222');
	});
	test('the shared pagination control moves between pages of results, staying on GET /api/users', async ({ page }) => {
		// Regression: `page` landing in the URL's search params used to be
		// enough on its own to make UsersComponent switch to POST
		// /api/searchUsers, even with zero actual filters applied -- every
		// paginated request beyond page 1 used the wrong verb for a plain
		// "get me this page" read. searchUsers should only ever be hit once a
		// real filter is present.
		let searchUsersCalled = false;
		await page.route('**/api/searchUsers', async (route) => {
			searchUsersCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: [], totalItems: 0 }) });
		});
		await page.route('**/api/users?*', async (route) => {
			const requestedPage = new URL(route.request().url()).searchParams.get('page');
			const name = requestedPage === '2' ? 'Sara Idrissi' : 'Amine Bennani';
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Fetched users successfully.',
					users: [sampleUser({ username: 'CIN000111', profile: { firstname: name.split(' ')[0], lastname: name.split(' ')[1] } })],
					// 11 items at 10/page -> 2 pages, so the pagination control renders.
					totalItems: 11,
				}),
			});
		});
		await seedAuth(page, { isAdmin: true });

		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('صفحة 1 من 2')).toBeVisible();
		await expect(page.getByRole('button', { name: 'السابق' })).toBeDisabled();

		await page.getByRole('button', { name: 'التالي' }).click();

		await expect(page.getByText('Sara Idrissi')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('صفحة 2 من 2')).toBeVisible();
		await expect(page.getByRole('button', { name: 'التالي' })).toBeDisabled();
		expect(searchUsersCalled).toBe(false);
	});

	test('regression: paginating within an active filtered search still POSTs to /api/searchUsers with the right page', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ username: 'CIN000111', profile: { firstname: 'Amine', lastname: 'Bennani' } })],
			totalItems: 1,
		});
		let requestedPage: number | undefined;
		await page.route('**/api/searchUsers', async (route) => {
			requestedPage = route.request().postDataJSON()?.page;
			const name = requestedPage === 2 ? 'Sara Idrissi' : 'Youssef Amrani';
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					message: 'Fetched users successfully.',
					users: [sampleUser({ username: 'CIN000333', profile: { firstname: name.split(' ')[0], lastname: name.split(' ')[1] } })],
					totalItems: 11,
				}),
			});
		});

		await page.goto('/users?bloodGroup=O%2B');
		await expect(page.getByText('Youssef Amrani')).toBeVisible({ timeout: 5000 });
		expect(requestedPage).toBe(1);

		await page.getByRole('button', { name: 'التالي' }).click();

		await expect(page.getByText('Sara Idrissi')).toBeVisible({ timeout: 5000 });
		expect(requestedPage).toBe(2);
	});

	test('admin can promote a user to admin from the user detail page', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ _id: 'target-1', username: 'CIN000111', isAdmin: false })],
			totalItems: 1,
		});
		await mockJson(page, '**/api/users/profile/target-1', {
			_id: 'target-1',
			username: 'CIN000111',
			email: 'donor@example.com',
			phoneNumber: '+212612345680',
			isAdmin: false,
			gender: 'male',
			firstname: 'Amine',
			lastname: 'Bennani',
			bloodGroup: 'A+',
			city: 'Rabat',
			canDonate: true,
		});
		let patchCalled = false;
		await page.route('**/api/users/target-1/admin', async (route) => {
			patchCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User is now an admin' }) });
		});

		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
		await page.getByText('Amine Bennani').click();
		await expect(page).toHaveURL(/\/users\/target-1$/);
		await page.getByRole('button', { name: 'تعيين مشرف' }).click();
		await page.getByRole('button', { name: 'تعيين مشرف' }).last().click();
		await page.waitForTimeout(500);
		expect(patchCalled).toBe(true);
	});

	test('admin can delete a user from the user detail page', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ _id: 'target-1', username: 'CIN000111' })],
			totalItems: 1,
		});
		await mockJson(page, '**/api/users/profile/target-1', {
			_id: 'target-1',
			username: 'CIN000111',
			email: 'donor@example.com',
			phoneNumber: '+212612345680',
			isAdmin: false,
			gender: 'male',
			firstname: 'Amine',
			lastname: 'Bennani',
			bloodGroup: 'A+',
			city: 'Rabat',
			canDonate: true,
		});
		let deleteCalled = false;
		await page.route('**/api/deleteUser/CIN000111', async (route) => {
			deleteCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User deleted successfully' }) });
		});

		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
		await page.getByText('Amine Bennani').click();
		await expect(page).toHaveURL(/\/users\/target-1$/);
		await page.getByRole('button', { name: 'حذف' }).click();
		await page.getByRole('button', { name: /delete|confirm|حذف/i }).last().click({ timeout: 3000 }).catch(() => {});
		await page.waitForTimeout(500);
		expect(deleteCalled).toBe(true);
	});
});
