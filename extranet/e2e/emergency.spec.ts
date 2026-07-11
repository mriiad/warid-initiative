import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

test.describe('Emergency', () => {
	test('anyone can submit an emergency request without logging in', async ({ page }) => {
		let requestBody: any = null;
		await page.route('**/api/emergency', async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'Emergency successfully created', emergency: { _id: 'em-1' } }),
			});
		});

		await page.goto('/emergency');
		// Neither Select has an accessible name (a separate a11y gap), so they
		// are targeted positionally.
		await page.getByRole('combobox').nth(0).click();
		await page.getByRole('option', { name: 'O+' }).click();
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option').nth(1).click(); // index 0 is the empty "None" placeholder
		await page.getByLabel('Phone Number').fill('0600000000');
		await page.getByLabel('Details').fill('Urgent need for surgery.');
		await page.getByRole('button', { name: 'Create Emergency' }).click();
		await page.waitForTimeout(500);

		expect(requestBody).not.toBeNull();
		expect(requestBody.bloodGroup).toBe('O+');
		await expect(page.getByText('Emergency created successfully!')).toBeVisible({ timeout: 5000 });
	});

	test('non-admin users cannot see the emergencies management route', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await page.goto('/emergencies');
		await expect(page.getByText('404')).toBeVisible();
	});

	test('admin sees unconfirmed emergencies and can confirm one', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/unconfirmedEmergencies*', {
			message: 'Fetched emergencies successfully.',
			emergencies: [{ _id: 'em-1', bloodGroup: 'O+', city: 'Casablanca', phoneNumber: 600000000, details: 'Urgent' }],
			totalItems: 1,
		});
		let confirmCalled = false;
		await page.route('**/api/emergencies/em-1/confirm', async (route) => {
			confirmCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'The emergency is successfully confirmed' }) });
		});
		await page.goto('/emergencies');
		await expect(page.getByText('Urgent')).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: /confirm/i }).first().click();
		await page.waitForTimeout(500);
		expect(confirmCalled).toBe(true);
	});
});
