import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

test.describe('Matched users / User List (redesigned)', () => {
	test('non-admin users cannot see the matched-users route', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await page.goto('/emergencies/em-1/matched-users');
		await expect(page.getByText('404')).toBeVisible();
	});

	test('admin can select matched users and send SMS, which confirms each selected user', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/emergencies/em-1/matchingUsers*', {
			message: 'Fetched matching users successfully.',
			matchingUsers: [
				{ _id: 'u1', phoneNumber: '0600000001', firstname: 'Amine', lastname: 'Bennani', bloodGroup: 'O-' },
				{ _id: 'u2', phoneNumber: '0600000002', firstname: 'Sara', lastname: 'Idrissi', bloodGroup: 'AB+' },
			],
			totalItems: 2,
		});
		const confirmedUserIds: string[] = [];
		await page.route('**/api/emergencies/em-1/matchedUsers/*/confirm', async (route) => {
			const url = route.request().url();
			const userId = url.split('/matchedUsers/')[1].split('/confirm')[0];
			confirmedUserIds.push(userId);
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User confirmed in emergency.' }) });
		});

		await page.goto('/emergencies/em-1/matched-users');
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });

		// Matched donors aren't necessarily the exact requested blood group
		// (compatibility is broader than equality) -- each row must show the
		// donor's own blood group, not the emergency's requested one.
		await expect(page.getByText('O-', { exact: true })).toBeVisible();
		await expect(page.getByText('AB+', { exact: true })).toBeVisible();

		await page.getByText('Amine Bennani').click();
		await page.getByRole('button', { name: 'إرسال رسالة نصية' }).click();
		await page.waitForTimeout(500);

		expect(confirmedUserIds).toEqual(['u1']);
	});

	test('regression (issue #321): sending via WhatsApp opens a wa.me chat with the emergency context, and still confirms the donor', async ({ page, context }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/unconfirmedEmergencies*', {
			message: 'Fetched emergencies successfully.',
			emergencies: [
				{
					_id: 'em-1',
					bloodGroup: 'O-',
					city: 'Casablanca',
					phoneNumber: '+212611111111',
					details: 'Accident victim needs an urgent transfusion.',
				},
			],
			totalItems: 1,
		});
		await mockJson(page, '**/api/emergencies/em-1/matchingUsers*', {
			message: 'Fetched matching users successfully.',
			matchingUsers: [
				{ _id: 'u1', phoneNumber: '+212600000001', firstname: 'Amine', lastname: 'Bennani', bloodGroup: 'O-' },
			],
			totalItems: 1,
		});
		const confirmedUserIds: string[] = [];
		await page.route('**/api/emergencies/em-1/matchedUsers/*/confirm', async (route) => {
			const url = route.request().url();
			const userId = url.split('/matchedUsers/')[1].split('/confirm')[0];
			confirmedUserIds.push(userId);
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User confirmed in emergency.' }) });
		});

		// Navigate through the actual UI (not page.goto straight to the
		// matched-users URL) -- the WhatsApp message needs the emergency's
		// city/phone/details, which only ever arrive via router state set by
		// EmergencyCard's own navigate() call, since there's no endpoint to
		// fetch a single emergency's details directly.
		await page.goto('/emergencies?page=1');
		await page.getByRole('button', { name: 'المستخدمون المتطابقون' }).click();
		await expect(page).toHaveURL(/\/emergencies\/em-1\/matched-users/);
		await expect(page.getByText('Amine Bennani')).toBeVisible({ timeout: 5000 });

		// The sandbox has no real network access to wa.me, so intercept the
		// navigation at the context level (covers the popup page too) instead
		// of letting it fail and redirect to a chrome-error:// page.
		await context.route('https://wa.me/**', (route) =>
			route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>ok</body></html>' })
		);

		await page.getByText('Amine Bennani').click();
		const popupPromise = context.waitForEvent('page');
		await page.getByRole('button', { name: 'إرسال عبر واتساب' }).click();
		const popup = await popupPromise;
		await popup.waitForLoadState('domcontentloaded');

		const popupUrl = new URL(popup.url());
		expect(popupUrl.hostname).toBe('wa.me');
		// The donor's own number (E.164, '+' stripped), not the emergency's.
		expect(popupUrl.pathname).toBe('/212600000001');
		const text = popupUrl.searchParams.get('text') || '';
		expect(text).toContain('O-');
		expect(text).toContain('Casablanca');
		expect(text).toContain('+212611111111');
		expect(text).toContain('Accident victim needs an urgent transfusion.');
		await popup.close();

		await page.waitForTimeout(500);
		expect(confirmedUserIds).toEqual(['u1']);
	});
});
