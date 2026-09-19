import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

// Issue #183's "Navigation per role" section: a restricted admin sees a
// bottom nav built from their own items, not the full set with some removed.
// Issue #459 amends how narrow that is for Emergency Admin -- the profile
// and the emergency form are not "someone else's area", and leaving them out
// made both unreachable from navigation for that role.
//
// rbac-route-guards.spec.ts already covers that the routes themselves refuse
// the wrong role; these tests are about what's shown to tap in the first
// place.
test.describe('Role-aware bottom navigation (issue #183)', () => {
	// Same shape as #459: the profile was left out of this role's items, and
	// /profile has no route guard, so the screen was reachable only by typing
	// the URL. Issue #463.
	test('an Event Admin sees home, events and their profile in the bottom nav (issue #463)', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'event' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		await expect(nav.getByLabel('التقويم')).toBeVisible({ timeout: 5000 });
		await expect(nav.getByLabel('الملف الشخصي')).toBeVisible();
		// Still restricted: no emergency area, no admin menu, no users list.
		await expect(nav.getByLabel('طوارئ', { exact: false })).toHaveCount(0);
		await expect(nav.getByLabel('الإدارة')).toHaveCount(0);
		await expect(nav.getByLabel('لائحة المستخدمين')).toHaveCount(0);
	});

	test('an Event Admin reaches the profile screen from the nav (issue #463)', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'event' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/user/profile', {
			firstname: 'Karim',
			lastname: 'Idrissi',
			email: 'karim@example.com',
			phoneNumber: '+212612345678',
			gender: 'male',
			bloodGroup: 'O+',
			city: 'Casablanca',
		});
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		await expect(nav.getByLabel('الملف الشخصي')).toBeVisible({ timeout: 5000 });
		await nav.getByLabel('الملف الشخصي').click();
		await expect(page).toHaveURL(/\/profile$/);
	});

	// #183 was read literally as "only the dashboard and a list icon", which
	// left this role with no way to reach their own profile and no way to
	// open the emergency form -- the two things issue #459 reports missing.
	test('an Emergency Admin sees the emergency form and their profile too (issue #459)', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		// Exact, because nav.emergencies ("الطوارئ") contains nav.emergency
		// ("طوارئ") as a substring and a loose match would take either.
		await expect(nav.getByLabel('الطوارئ', { exact: true })).toBeVisible({ timeout: 5000 });
		await expect(nav.getByLabel('طوارئ', { exact: true })).toBeVisible();
		await expect(nav.getByLabel('الملف الشخصي')).toBeVisible();
		// Still not the whole nav: the areas this role does not manage stay out.
		await expect(nav.getByLabel('التقويم')).toHaveCount(0);
		await expect(nav.getByLabel('الإدارة')).toHaveCount(0);
		await expect(nav.getByLabel('لائحة المستخدمين')).toHaveCount(0);

		// The two emergency icons are distinct destinations: the admin list
		// (plural) and the public create form (singular).
		await nav.getByLabel('الطوارئ', { exact: true }).click();
		await expect(page).toHaveURL(/\/emergencies\?page=1/);
	});

	test('an Emergency Admin reaches the emergency form and the profile screen (issue #459)', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await mockJson(page, '**/api/user/profile', {
			firstname: 'Salma',
			lastname: 'Bennani',
			email: 'salma@example.com',
			phoneNumber: '+212612345678',
			gender: 'female',
			bloodGroup: 'A+',
			city: 'Rabat',
		});
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		await expect(nav.getByLabel('طوارئ', { exact: true })).toBeVisible({ timeout: 5000 });
		await nav.getByLabel('طوارئ', { exact: true }).click();
		await expect(page).toHaveURL(/\/emergency$/);

		await nav.getByLabel('الملف الشخصي').click();
		await expect(page).toHaveURL(/\/profile$/);
	});

	test('a Principal Admin keeps the full six-icon nav (issue #183: "keeps the navbar as it is today")', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'principal' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		for (const label of ['التقويم', 'الملف الشخصي', 'الإدارة', 'لائحة المستخدمين']) {
			await expect(nav.getByLabel(label)).toBeVisible({ timeout: 5000 });
		}
	});
});
