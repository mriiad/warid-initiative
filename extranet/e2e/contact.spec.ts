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
});
