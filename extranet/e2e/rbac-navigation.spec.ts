import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

// Issue #183's "Navigation per role" section: Event Admin and Emergency
// Admin each see a bottom nav with only two icons -- not the full set with
// some items removed. rbac-route-guards.spec.ts already covers that the
// routes themselves refuse the wrong role; these tests are about what's
// actually shown to tap in the first place.
test.describe('Role-aware bottom navigation (issue #183)', () => {
	test('an Event Admin sees only home and events in the bottom nav', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'event' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/events*', { events: [], totalItems: 0 });
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		await expect(nav.getByLabel('التقويم')).toBeVisible({ timeout: 5000 });
		await expect(nav.getByLabel('الملف الشخصي')).toHaveCount(0);
		await expect(nav.getByLabel('طوارئ', { exact: false })).toHaveCount(0);
		await expect(nav.getByLabel('الإدارة')).toHaveCount(0);
		await expect(nav.getByLabel('لائحة المستخدمين')).toHaveCount(0);
	});

	test('an Emergency Admin sees only home and the emergencies list in the bottom nav', async ({ page }) => {
		await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
		await mockJson(page, '**/api/admin/stats', { totalUsers: 0, totalEvents: 0, totalDonations: 0, totalEmergencies: 0 });
		await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
		await page.goto('/home');

		const nav = page.locator('nav, [class*="wrapper"]:has(a[aria-label])').first();
		await expect(nav.getByLabel('الطوارئ')).toBeVisible({ timeout: 5000 });
		await expect(nav.getByLabel('التقويم')).toHaveCount(0);
		await expect(nav.getByLabel('الملف الشخصي')).toHaveCount(0);
		await expect(nav.getByLabel('الإدارة')).toHaveCount(0);
		await expect(nav.getByLabel('لائحة المستخدمين')).toHaveCount(0);

		// It's the admin list (plural), not the public create form (singular).
		await nav.getByLabel('الطوارئ').click();
		await expect(page).toHaveURL(/\/emergencies\?page=1/);
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
