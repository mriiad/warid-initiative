import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, sampleEvent } from './support/mockApi';

test.describe('Admin dashboard', () => {
	// The dashboard (greeting/stats/next-event) lives at '/home' for admins,
	// matching the bottom nav's Home tab -- the '/admin' route now shows a
	// separate admin menu screen instead (see admin-menu.spec.ts).
	//
	// A logged-in donor's equivalent is covered in home-routing.spec.ts (issue
	// #292) -- this file stays admin-only.
	test('a logged-out visitor sees the public landing page, not the admin dashboard', async ({ page }) => {
		await page.goto('/home');
		await expect(page.getByText('جمعية مغربية', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('لا توجد فعاليات قادمة')).toHaveCount(0);
	});

	test('admin sees the greeting, overview stats and the next upcoming event', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 55, totalEvents: 12, totalDonations: 340, totalEmergencies: 8 });
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

		await page.goto('/home');

		await expect(page.getByText('Mahmoud', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('55')).toBeVisible();
		await expect(page.getByText('12')).toBeVisible();
		// Regression test for issue #302: the 4th stat card used to duplicate
		// this same totalDonations figure, so '340' rendered twice.
		await expect(page.getByText('340')).toHaveCount(1);
		// Exact match -- '8' otherwise also matches substrings of the event
		// date text ('نُشرت 8 نوفمبر', '18 نوفمبر') and the calendar strip.
		await expect(page.getByText('8', { exact: true })).toBeVisible();
		await expect(page.getByText('Agadir Event')).toBeVisible();
	});

	test('a brand-new admin with no upcoming events sees the empty state, not a crash', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });

		await page.goto('/home');

		await expect(page.getByText('لا توجد فعاليات قادمة')).toBeVisible({ timeout: 5000 });
	});

	test('the edit button on the next event navigates to the update-event form', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 1, totalEvents: 1, totalDonations: 1, totalEmergencies: 0 });
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

		await page.goto('/home');
		await expect(page.getByText('Agadir Event')).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'تعديل' }).click();
		await expect(page).toHaveURL(/\/events\/update\/WEVENTAGADIR/);
	});

	test('shows an active emergency in the carousel and confirming it calls the real confirm endpoint', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', {
			emergencies: [{ _id: 'em-1', bloodGroup: 'O+', city: 'Casablanca', phoneNumber: '+212600000000', details: 'Urgent' }],
			totalItems: 1,
		});
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

	test('regression (issue #319): the search bar and donation history are gone -- admin accounts are for administration only', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 55, totalEvents: 12, totalDonations: 340, totalEmergencies: 8 });
		await mockJson(page, '**/api/user/profile', { firstname: 'Mahmoud', lastname: 'Moumen', gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		let dashboardRouteCalled = false;
		await page.route('**/api/users/admin-1/dashboard', async (route) => {
			dashboardRouteCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ donations: [{ id: 'd1', date: '1 Jan 2026', type: 'BLOOD', event: 'Casablanca Event' }] }) });
		});

		await page.goto('/home');
		await expect(page.getByText('Mahmoud', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByPlaceholder('بحث...')).toHaveCount(0);
		await expect(page.getByText('Casablanca Event')).toHaveCount(0);
		expect(dashboardRouteCalled).toBe(false);
	});

	test('regression (issue #319): the bottom nav "+" button is gone -- creating an event still works from the events list', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });

		await page.goto('/home');
		await expect(page.getByRole('button', { name: 'إضافة حدث' })).toHaveCount(0);
		await page.goto('/events?page=1');
		await page.getByRole('button', { name: 'إضافة حدث' }).click();
		await expect(page).toHaveURL(/\/events\/create/);
	});

	// The strip used to render `t('admin.weekday.X').charAt(0)`, which
	// collapsed different days onto the same glyph: أر (Wed) and أح (Sun)
	// both showed as أ. The Arabic abbreviations are two letters precisely
	// because one letter doesn't tell them apart. See issue #422.
	test('regression (issue #422): every weekday in the gift strip is distinguishable', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/user/profile', { gender: 'male' });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });

		await page.goto('/home');
		await expect(page.getByText('هديتك')).toBeVisible({ timeout: 5000 });

		// GIFT_WEEKDAYS is Wed..Sun; ar.json abbreviates them as أر خم جم سب أح.
		const labels = await page.locator('[class*="giftDay"] > span:first-child').allInnerTexts();
		expect(labels).toEqual(['أر', 'خم', 'جم', 'سب', 'أح']);
		expect(new Set(labels).size).toBe(labels.length);
	});
});
