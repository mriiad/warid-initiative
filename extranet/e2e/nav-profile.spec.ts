import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

test.describe('Profile nav icon', () => {
	test('a donor can reach the profile page from the bottom nav on /dashboard', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/users/user-1/dashboard', { donations: [] });
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Yassine', lastname: 'Alaoui' }));
		await page.goto('/dashboard');
		await expect(page.getByRole('link', { name: 'الملف الشخصي' })).toBeVisible({ timeout: 5000 });
		await page.getByRole('link', { name: 'الملف الشخصي' }).click();
		await expect(page).toHaveURL(/\/profile$/);
		await expect(page.getByText('Yassine', { exact: true })).toBeVisible({ timeout: 5000 });
	});

	test('an admin can also reach the profile page from the bottom nav on /home', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Mahmoud' }));
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');
		await expect(page.getByRole('link', { name: 'الملف الشخصي' })).toBeVisible({ timeout: 5000 });
		await page.getByRole('link', { name: 'الملف الشخصي' }).click();
		await expect(page).toHaveURL(/\/profile$/);
	});
});
