import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, sampleEvent } from './support/mockApi';

test.describe('Admin dashboard', () => {
	// The dashboard (greeting/stats/next-event) lives at '/home' for admins,
	// matching the bottom nav's Home tab -- the '/admin' route now shows a
	// separate admin menu screen instead (see admin-menu.spec.ts).
	test('non-admin users visiting /home see the regular landing page, not the admin dashboard', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await page.goto('/home');
		await expect(page.getByText('جمعية مغربية', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('لا توجد فعاليات قادمة')).toHaveCount(0);
	});

	test('admin sees the greeting, overview stats and the next upcoming event', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 55, totalEvents: 12, totalDonations: 340 });
		await mockJson(page, '**/api/user/profile', { firstname: 'Mahmoud', lastname: 'Moumen', gender: 'male' });
		await mockJson(page, '**/api/events*', {
			events: [
				sampleEvent({
					reference: 'WEVENTAGADIR',
					title: 'Agadir Event',
					location: 'Agadir',
					date: '2099-11-18T00:00:00.000Z',
					createdAt: '2099-11-08T00:00:00.000Z',
				}),
			],
			totalItems: 1,
		});
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });

		await page.goto('/home');

		await expect(page.getByText('Mahmoud', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('55')).toBeVisible();
		await expect(page.getByText('12')).toBeVisible();
		await expect(page.getByText('340').first()).toBeVisible();
		await expect(page.getByText('Agadir Event')).toBeVisible();
	});

	test('a brand-new admin with no upcoming events sees the empty state, not a crash', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });

		await page.goto('/home');

		await expect(page.getByText('لا توجد فعاليات قادمة')).toBeVisible({ timeout: 5000 });
	});

	test('the edit button on the next event navigates to the update-event form', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 1, totalEvents: 1, totalDonations: 1 });
		await mockJson(page, '**/api/user/profile', { firstname: 'Mahmoud', gender: 'male' });
		await mockJson(page, '**/api/events*', {
			events: [
				sampleEvent({
					reference: 'WEVENTAGADIR',
					title: 'Agadir Event',
					date: '2099-11-18T00:00:00.000Z',
				}),
			],
			totalItems: 1,
		});
		await mockJson(page, '**/api/events/WEVENTAGADIR', sampleEvent({ reference: 'WEVENTAGADIR', title: 'Agadir Event' }));
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });

		await page.goto('/home');
		await expect(page.getByText('Agadir Event')).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'تعديل' }).click();
		await expect(page).toHaveURL(/\/events\/update\/WEVENTAGADIR/);
	});

	test('the bottom nav "+" button navigates to the create-event form', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });

		await page.goto('/home');
		await page.getByRole('button', { name: 'إضافة حدث' }).click();
		await expect(page).toHaveURL(/\/events\/create/);
	});

	test('shows an active emergency in the carousel and confirming it calls the real confirm endpoint', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', {
			emergencies: [{ _id: 'em-1', bloodGroup: 'O+', city: 'Casablanca', phoneNumber: '+212600000000', details: 'Urgent' }],
			totalItems: 1,
		});
		await mockJson(page, '**/api/users/admin-1/dashboard', { donations: [] });
		let confirmCalled = false;
		await page.route('**/api/emergencies/em-1/confirm', async (route) => {
			confirmCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'The emergency is successfully confirmed' }) });
		});

		await page.goto('/home');
		await expect(page.getByText('Urgent')).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'تأكيد الحالة الطارئة' }).click();
		await page.waitForTimeout(500);
		expect(confirmCalled).toBe(true);
	});

	test('shows the donation history when the admin has past donations', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/users/admin-1/dashboard', {
			donations: [{ id: 'd1', date: '1 Jan 2026', type: 'BLOOD', event: 'Casablanca Event' }],
		});

		await page.goto('/home');
		await expect(page.getByText('Casablanca Event')).toBeVisible({ timeout: 5000 });
	});
});
