import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

test.describe('Confirm presence', () => {
	test('a donor who cannot donate can still confirm they attended', async ({ page }) => {
		// This flow was completely broken: the client POSTs
		// /api/event/confirmPresence while the route was registered as PUT, so
		// the screen always rendered "unexpected error".
		await seedAuth(page);
		await mockJson(page, '**/api/events/WEVENT1', {
			message: 'ok',
			event: { _id: 'evt-1', reference: 'WEVENT1', title: 'T', date: '2026-09-01', isGeneric: false, location: 'Rabat', description: 'd' },
		});
		let confirmBody: any = null;
		await page.route('**/api/event/confirmPresence', async (route) => {
			confirmBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Presence confirmed successfully.' }),
			});
		});

		await page.goto('/events/WEVENT1/confirmation');

		await expect(page.getByText('!تم تأكيد حضورك بنجاح')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('حدث خطأ غير متوقع')).toHaveCount(0);
		expect(confirmBody?.eventId).toBe('evt-1');
	});
});
