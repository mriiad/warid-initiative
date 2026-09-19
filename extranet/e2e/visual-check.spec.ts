import { test, expect, Route, Page } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse, sampleEvent, eventDetailResponse } from './support/mockApi';

/**
 * Not a regression suite -- a visual walkthrough of the eight tester issues
 * fixed today, capturing what each screen actually renders so the fixes can
 * be checked by eye rather than only by assertion.
 *
 * The API is mocked (same as every other spec here): this shows the real UI,
 * not a real server.
 */

const SHOTS = 'screenshots';

const stats = { totalUsers: 55, totalEvents: 12, totalDonations: 340, totalEmergencies: 8 };

const shot = async (page: Page, name: string) => {
	await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
};

const navShot = async (page: Page, name: string) => {
	const nav = page.locator('[class*="wrapper"]:has(a[aria-label])').last();
	await nav.screenshot({ path: `${SHOTS}/${name}.png` });
};

test.describe('visual walkthrough', () => {
	test('459 - emergency admin nav has the emergency form and profile', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'emergency' });
		await mockJson(page, '**/api/admin/stats', stats);
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Salma' }));
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');
		await expect(page.getByLabel('الطوارئ', { exact: true })).toBeVisible({ timeout: 10000 });
		await navShot(page, '459-emergency-admin-nav');
	});

	test('463 - event admin nav has the profile icon', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'event' });
		await mockJson(page, '**/api/admin/stats', stats);
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Karim' }));
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await page.goto('/home');
		await expect(page.getByLabel('الملف الشخصي')).toBeVisible({ timeout: 10000 });
		await navShot(page, '463-event-admin-nav');
	});

	test('464 - home icon is highlighted on the donor dashboard', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'u1' });
		await mockJson(page, '**/api/users/u1/dashboard', { donations: [] });
		await page.goto('/dashboard');
		await expect(page.getByRole('link', { name: 'الصفحة الرئيسية' })).toHaveAttribute('aria-current', 'page', { timeout: 10000 });
		await navShot(page, '464-home-active-on-dashboard');
	});

	test('460a - event admin dashboard has no emergency section', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'event' });
		await mockJson(page, '**/api/admin/stats', stats);
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Karim' }));
		await mockJson(page, '**/api/events*', {
			events: [sampleEvent({ reference: 'WEVENT20990101', title: 'Agadir Drive', date: '2099-11-18T00:00:00.000Z' })],
			totalItems: 1,
		});
		await page.goto('/home');
		await expect(page.getByText('الفعالية القادمة')).toBeVisible({ timeout: 10000 });
		await shot(page, '460a-event-admin-dashboard');
	});

	test('460b - emergency admin dashboard has no events section', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'emergency' });
		await mockJson(page, '**/api/admin/stats', stats);
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Salma' }));
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');
		await expect(page.getByText('حالة طارئة')).toBeVisible({ timeout: 10000 });
		await shot(page, '460b-emergency-admin-dashboard');
	});

	test('460c - emergency admin sees no edit or delete on an event', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'emergency' });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({
			reference: 'WEVENT20990101', title: 'Agadir Drive', location: 'Agadir Sous', isGeneric: false,
		}));
		await mockJson(page, '**/api/event/WEVENT20990101/participants/details', {
			isGeneric: false, allDonaters: 45, realDonaters: 12, registeredParticipants: 45,
		});
		await page.goto('/events/WEVENT20990101');
		await expect(page.getByText('Agadir Drive').first()).toBeVisible({ timeout: 10000 });
		await shot(page, '460c-emergency-admin-event-detail');
	});

	test('461a - create event form has no photo picker', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'event' });
		await page.goto('/events/create');
		await expect(page.getByLabel('العنوان', { exact: true })).toBeVisible({ timeout: 10000 });
		await shot(page, '461a-create-event-form');
	});

	test('461b + 462 - update form has no photo picker, and saving without touching the date succeeds', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'event' });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse());
		let sentFields: string[] = [];
		await page.route('**/api/event/WEVENT20990101', async (route: Route) => {
			if (route.request().method() === 'PUT') {
				const body = route.request().postData() || '';
				sentFields = [...body.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
				return route.fulfill({
					status: 200, contentType: 'application/json',
					body: JSON.stringify({ message: 'Event updated successfully!', event: sampleEvent() }),
				});
			}
			return route.fallback();
		});

		await page.goto('/events/update/WEVENT20990101');
		await expect(page.getByLabel('العنوان', { exact: true })).toBeVisible({ timeout: 10000 });
		await shot(page, '461b-update-event-form');

		await page.getByLabel('العنوان', { exact: true }).fill('Agadir Drive (renamed)');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(1200);
		await shot(page, '462-update-event-saved');
		// What the form actually put on the wire: no image, and no date.
		console.log('462 FIELDS SENT:', JSON.stringify(sentFields));
	});

	test('465 - donation success then the dashboard, with the donation on it', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'u1' });
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(page, '**/api/donation/canDonate', { canDonate: true });
		await mockJson(page, '**/api/donation', { message: 'Donation registered.' }, { method: 'POST' });
		await mockJson(page, '**/api/users/u1/dashboard', {
			donations: [{ id: 'd1', event: 'Collecte de sang', date: '2026-01-01', type: 'Regular Donation' }],
		});

		await page.goto('/donate');
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option', { name: 'الدم' }).click();
		await page.locator('button[type=submit]').click();
		await expect(page.getByText('تم تسجيل طلب التبرع بنجاح', { exact: false })).toBeVisible({ timeout: 10000 });
		await shot(page, '465a-donation-confirmation');

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
		await expect(page.getByText('Regular Donation')).toBeVisible({ timeout: 10000 });
		await shot(page, '465b-dashboard-after-donation');
	});

	test('466 - a number stored as bare digits shows with its country code', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'u1' });
		await mockJson(page, '**/api/user/profile', { ...fullProfileResponse(), phoneNumber: '612345678' }, { method: 'GET' });
		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible({ timeout: 10000 });
		await page.getByRole('button', { name: 'تعديل' }).click();
		await expect(page.locator('input[type=tel]')).toHaveValue('+212 6 12 34 56 78');
		await shot(page, '466-profile-phone');
	});

	test('467 - wrong current password shows the error and keeps the session', async ({ page }) => {
		await page.goto('/login');
		await page.evaluate(() => {
			localStorage.setItem('token', 'fake-jwt-token');
			localStorage.setItem('refreshToken', 'fake-refresh-token');
			localStorage.setItem('userId', 'u1');
			localStorage.setItem('isAdmin', 'false');
		});
		await mockJson(page, '**/api/user/profile', fullProfileResponse(), { method: 'GET' });
		await mockJson(page, '**/api/auth/update-password', {
			message: 'Current password is incorrect.', statusCode: 401, code: 'CURRENT_PASSWORD_INCORRECT',
		}, { status: 401, method: 'PATCH' });

		await page.goto('/profile');
		await expect(page.getByText('المعلومات الشخصية')).toBeVisible({ timeout: 10000 });
		await page.getByRole('button', { name: 'تغيير كلمة المرور' }).first().click();
		await page.getByLabel('كلمة المرور الحالية').fill('wrongpassword');
		await page.getByLabel('كلمة المرور الجديدة', { exact: true }).fill('newpassword123');
		await page.getByLabel('تأكيد كلمة المرور الجديدة').fill('newpassword123');
		await page.getByRole('button', { name: 'تحديث كلمة المرور' }).click();

		await expect(page.getByText('Current password is incorrect.')).toBeVisible({ timeout: 10000 });
		await shot(page, '467-wrong-password-still-signed-in');
		console.log('467 FINAL URL:', page.url());
		console.log('467 TOKEN:', await page.evaluate(() => localStorage.getItem('token')));
	});
});
