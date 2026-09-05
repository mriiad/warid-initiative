import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

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

	// Every Controller carried no `rules` at all, so errors.* was never
	// populated: the six translated contact.*Required strings were dead code
	// in all three locales, and the only thing standing between the user and
	// a garbage submission was the native `required` attribute (which the
	// missing noValidate left active, in the browser's own language).
	// See issue #415.
	test('regression (issue #415): an empty submit shows the form\'s own errors and sends nothing', async ({ page }) => {
		let sent = false;
		await page.route('**/api/contact-us', async (route) => {
			sent = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
		});

		await page.goto('/contact');
		await expect(page.getByLabel('الموضوع')).toBeVisible({ timeout: 5000 });
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('الموضوع مطلوب')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('الرسالة مطلوبة')).toBeVisible();
		await expect(page.getByText('الاسم الشخصي مطلوب')).toBeVisible();
		await expect(page.getByText('البريد الإلكتروني مطلوب')).toBeVisible();
		expect(sent).toBe(false);
	});

	// A signed-out sender's email and phone are the only way to answer them,
	// and neither was format-checked: 'not-an-email' and 'abc' went through
	// and the form reported success. See issue #415.
	test('regression (issue #415): a malformed email is rejected instead of reported as sent', async ({ page }) => {
		let sent = false;
		await page.route('**/api/contact-us', async (route) => {
			sent = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
		});

		await page.goto('/contact');
		await page.getByLabel('الاسم الشخصي').fill('Yassine');
		await page.getByLabel('الاسم العائلي').fill('Alaoui');
		await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('الموضوع').fill('Question');
		await page.getByLabel('الرسالة').fill('Hello.');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText(/بريد إلكتروني صالح/)).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('!تم إرسال رسالتك بنجاح')).toHaveCount(0);
		expect(sent).toBe(false);
	});

	// A signed-in sender doesn't see the name/email/phone fields at all --
	// sendContactUs overrides them from the account. Those Controllers are
	// unmounted, so their new rules must not block the submit.
	test('a signed-in user only fills subject and message, and the request still goes through', async ({ page }) => {
		await seedAuth(page, { userId: 'user-1' });
		await mockJson(page, '**/api/user/profile', { firstname: 'Yassine', lastname: 'Alaoui', gender: 'male' });

		let requestBody: any = null;
		await page.route('**/api/contact-us', async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Email sent successfully' }) });
		});

		await page.goto('/contact');
		await expect(page.getByLabel('الموضوع')).toBeVisible({ timeout: 5000 });
		await expect(page.getByLabel('البريد الإلكتروني')).toHaveCount(0);

		await page.getByLabel('الموضوع').fill('Question');
		await page.getByLabel('الرسالة').fill('Hello, I have a question.');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('!تم إرسال رسالتك بنجاح')).toBeVisible({ timeout: 5000 });
		expect(requestBody).toMatchObject({ subject: 'Question', message: 'Hello, I have a question.' });
	});
});
