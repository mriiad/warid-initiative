import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

// Mirrors the backend's route split in issue #183 (see requireAdminRole.js):
// Principal Admin has full access to everything; Emergency and Event Admin
// are restricted to their own area. admin-menu.spec.ts, events.spec.ts and
// admin-users.spec.ts already cover the plain isAdmin/non-admin split --
// these tests are specifically about the role dimension within "is an
// admin", which none of those exercise.
test.describe('RBAC route guards (issue #183)', () => {
	test.describe('/admin is Principal-Admin-only', () => {
		test('an Event Admin gets 404', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'event' });
			await page.goto('/admin');
			await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		});

		test('an Emergency Admin gets 404', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
			await page.goto('/admin');
			await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		});

		test('a Principal Admin reaches the menu', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'principal' });
			await page.goto('/admin');
			await expect(page.getByText('404')).toHaveCount(0);
			await expect(page.getByText('لائحة المستخدمين')).toBeVisible({ timeout: 5000 });
		});

		test('an admin with no role recorded (legacy) reaches the menu', async ({ page }) => {
			await seedAuth(page, { isAdmin: true });
			await page.goto('/admin');
			await expect(page.getByText('404')).toHaveCount(0);
		});
	});

	test.describe('/users is Principal-Admin-only', () => {
		test('an Event Admin gets 404, not the users list', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'event' });
			await page.goto('/users?page=1');
			await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		});

		test('an Emergency Admin gets 404, not the users list', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
			await page.goto('/users?page=1');
			await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		});

		test('a Principal Admin reaches the users list', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'principal' });
			await mockJson(page, '**/api/users*', { message: 'ok', users: [], totalItems: 0 });
			await page.goto('/users?page=1');
			await expect(page.getByText('404')).toHaveCount(0);
		});
	});

	test.describe('/emergencies is Emergency Admin or Principal', () => {
		test('an Event Admin gets 404', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'event' });
			await page.goto('/emergencies?page=1');
			await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		});

		test('an Emergency Admin reaches the emergencies list', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
			await mockJson(page, '**/api/unconfirmedEmergencies*', {
				message: 'ok',
				emergencies: [],
				totalItems: 0,
			});
			await page.goto('/emergencies?page=1');
			await expect(page.getByText('404')).toHaveCount(0);
		});

		test('a Principal Admin also reaches the emergencies list (full access)', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'principal' });
			await mockJson(page, '**/api/unconfirmedEmergencies*', {
				message: 'ok',
				emergencies: [],
				totalItems: 0,
			});
			await page.goto('/emergencies?page=1');
			await expect(page.getByText('404')).toHaveCount(0);
		});
	});

	test.describe('/events/create is Event Admin or Principal', () => {
		test('an Emergency Admin gets 404', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'emergency' });
			await page.goto('/events/create');
			await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
		});

		test('an Event Admin reaches the create-event form', async ({ page }) => {
			await seedAuth(page, { isAdmin: true, adminRole: 'event' });
			await page.goto('/events/create');
			await expect(page.getByText('404')).toHaveCount(0);
			await expect(page.getByLabel('العنوان', { exact: true })).toBeVisible({ timeout: 5000 });
		});
	});
});
