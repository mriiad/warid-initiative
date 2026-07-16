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
	test('the shared pagination control moves between pages of results', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		// The initial page-1 load happens via GET /api/users, but as soon as
		// `page` lands in the URL's search params (i.e. after any pagination
		// click), UsersComponent switches to POST /api/searchUsers instead --
		// this is pre-existing behaviour, not specific to the shared control.
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ username: 'CIN000111', profile: { firstname: 'Amine', lastname: 'Bennani' } })],
			totalItems: 11,
		});
		let requestedPage: number | undefined;
		await page.route('**/api/searchUsers', async (route) => {
			requestedPage = route.request().postDataJSON()?.page;
			const name = requestedPage === 2 ? 'Sara Idrissi' : 'Amine Bennani';
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

		await page.goto('/users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('صفحة 1 من 2')).toBeVisible();
		await expect(page.getByRole('button', { name: 'السابق' })).toBeDisabled();

		await page.getByRole('button', { name: 'التالي' }).click();

		await expect(page.getByText('Sara Idrissi')).toBeVisible({ timeout: 5000 });
		expect(requestedPage).toBe(2);
		await expect(page.getByText('صفحة 2 من 2')).toBeVisible();
		await expect(page.getByRole('button', { name: 'التالي' })).toBeDisabled();
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
