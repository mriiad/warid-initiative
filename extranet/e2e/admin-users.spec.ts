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
		await expect(page.getByText('CIN000111')).toBeVisible({ timeout: 5000 });
	});

	test('admin can promote a user to admin', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ _id: 'target-1', username: 'CIN000111', isAdmin: false })],
			totalItems: 1,
		});
		let patchCalled = false;
		await page.route('**/api/users/target-1/admin', async (route) => {
			patchCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User is now an admin' }) });
		});
		await page.goto('/users');
		await expect(page.getByText('CIN000111')).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'تعيين مشرف' }).click();
		await page.getByRole('button', { name: 'MAKE ADMIN' }).click();
		await page.waitForTimeout(500);
		expect(patchCalled).toBe(true);
	});

	test('admin can delete a user', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/users?*', {
			message: 'Fetched users successfully.',
			users: [sampleUser({ _id: 'target-1', username: 'CIN000111' })],
			totalItems: 1,
		});
		let deleteCalled = false;
		await page.route('**/api/deleteUser/CIN000111', async (route) => {
			deleteCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User deleted successfully' }) });
		});
		await page.goto('/users');
		await expect(page.getByText('CIN000111')).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'حذف' }).click();
		// Confirm the deletion dialog if present.
		await page.getByRole('button', { name: /delete|confirm/i }).last().click({ timeout: 3000 }).catch(() => {});
		await page.waitForTimeout(500);
		expect(deleteCalled).toBe(true);
	});
});
