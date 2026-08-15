import { test, expect } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Signup', () => {
	test('the custom Arabic "required" message appears on submit (fixed: form has noValidate)', async ({ page }) => {
		// Every TextField in SignupForm.tsx has both a `required` prop (which
		// MUI forwards to the underlying <input required>) AND a react-hook-form
		// custom message. Without `noValidate` on the <form>, the browser's
		// native constraint validation intercepted submission before
		// react-hook-form's JS handler ever ran, popping up a plain English
		// "Please fill out this field" bubble instead of the localized Arabic
		// message. Fixed by adding `noValidate` to the form.
		await page.goto('/signup');
		await page.getByRole('button', { name: 'إرسال' }).click();
		await expect(page.getByText('رقم الهوية الوطنية مطلوب')).toBeVisible();
	});

	test('invalid-email custom validation still runs even with an earlier required field empty (fixed: form has noValidate)', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
		await page.getByRole('button', { name: 'إرسال' }).click();
		// With noValidate, native constraint validation no longer stops at the
		// empty CIN field (earlier in DOM order) before react-hook-form
		// validates every field, including the email regex.
		await expect(page.getByText(/عنوان بريد إلكتروني صالح/)).toBeVisible();
	});

	test('invalid email format is rejected once every other required field is filled', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();
		await expect(page.getByText(/عنوان بريد إلكتروني صالح/)).toBeVisible();
	});

	test('successful signup redirects to the login page', async ({ page }) => {
		let requestBody: any = null;
		await page.route('**/api/auth/signup', async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'User created!', userId: 'new-user-id' }),
			});
		});

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('newuser@example.com');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page).toHaveURL(/\/login/);
		// A raw national-format Moroccan number (defaultCountry='MA') is
		// normalized to full E.164 by PhoneNumberField before submit.
		expect(requestBody?.phoneNumber).toBe('+212600000000');
	});

	test('a phone number for a country other than the Morocco default is accepted as-is', async ({ page }) => {
		let requestBody: any = null;
		await page.route('**/api/auth/signup', async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 201,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'User created!', userId: 'new-user-id' }),
			});
		});

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('newuser@example.com');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		// Typing a full international number (leading "+" and a non-Morocco
		// country code) is accepted -- signup is no longer Morocco-only.
		await page.getByLabel('رقم الهاتف').fill('+33612345678');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page).toHaveURL(/\/login/);
		expect(requestBody?.phoneNumber).toBe('+33612345678');
	});

	test('surfaces the backend "email already exists" error', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/signup',
			{ errors: [{ msg: 'E-Mail address already exists!', param: 'email' }] },
			{ status: 400, method: 'POST' }
		);

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('taken@example.com');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		// The form should stay on /signup and not silently pretend success.
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/\/signup/);
	});
});
