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
			phoneNumber: 6123456780,
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
			phoneNumber: 6123456780,
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
