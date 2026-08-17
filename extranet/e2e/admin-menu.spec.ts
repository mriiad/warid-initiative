import { test, expect } from '@playwright/test';
import { seedAuth } from './support/mockApi';

test.describe('Admin menu', () => {
	test('non-admin users cannot see the admin menu route', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await page.goto('/admin');
		await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
	});

	test('admin sees the menu tiles and can navigate to the users list', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await page.goto('/admin');
		await page.getByText('لائحة المستخدمين').click();
		await expect(page).toHaveURL(/\/users\?page=1/);
	});

	test('regression (issue #319): the admin menu has no search icon -- there is nothing to search here', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await page.goto('/admin');
		await expect(page.getByLabel('بحث...')).toHaveCount(0);
	});
});
