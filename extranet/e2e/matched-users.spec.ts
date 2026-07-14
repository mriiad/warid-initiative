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
				{ _id: 'u1', phoneNumber: '0600000001', firstname: 'Amine', lastname: 'Bennani' },
				{ _id: 'u2', phoneNumber: '0600000002', firstname: 'Sara', lastname: 'Idrissi' },
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

		await page.getByText('Amine Bennani').click();
		await page.getByRole('button', { name: 'إرسال رسالة نصية' }).click();
		await page.waitForTimeout(500);

		expect(confirmedUserIds).toEqual(['u1']);
	});
});
