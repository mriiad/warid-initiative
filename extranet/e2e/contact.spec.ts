import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
	test('submits a contact request', async ({ page }) => {
		let requestBody: any = null;
		await page.route('**/api/contact-us', async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Email sent successfully' }) });
		});

		await page.goto('/contact');
		await page.getByLabel('الاسم الشخصي').fill('Yassine');
		await page.getByLabel('الاسم العائلي').fill('Alaoui');
		await page.getByLabel('البريد الإلكتروني').fill('yassine@example.com');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('الموضوع').fill('Question');
		await page.getByLabel('الرسالة').fill('Hello, I have a question.');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);

		expect(requestBody).not.toBeNull();
		expect(requestBody.email).toBe('yassine@example.com');
	});

	// ContactForm calls contactService.sendMessage directly in its own
	// try/catch rather than through useSendMessage (that hook wires the
	// shared ErrorToastProvider correctly but is unused -- nothing imports
	// it). This form's own catch block used to read error.message, Axios's
	// generic status text, instead of the backend's actual reason at
	// error.response.data.message. See issue #344 -- and the EmergencyForm
	// fix in #342 for the same class of mistake in a different component.
	test('a backend failure shows the actual reason, not the generic Axios status text', async ({ page }) => {
		const backendMessage = "Le service de messagerie n'est pas disponible pour le moment.";
		await page.route('**/api/contact-us', (route) =>
			route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ message: backendMessage, statusCode: 500 }),
			})
		);

		await page.goto('/contact');
		await page.getByLabel('الاسم الشخصي').fill('Yassine');
		await page.getByLabel('الاسم العائلي').fill('Alaoui');
		await page.getByLabel('البريد الإلكتروني').fill('yassine@example.com');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('الموضوع').fill('Question');
		await page.getByLabel('الرسالة').fill('Hello, I have a question.');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText(backendMessage)).toBeVisible({ timeout: 5000 });
	});
});
