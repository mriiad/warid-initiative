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
		await page.getByLabel('أوافق على سياسة الخصوصية').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page).toHaveURL(/\/login/);
		// A raw national-format Moroccan number (defaultCountry='MA') is
		// normalized to full E.164 by PhoneNumberField before submit.
		expect(requestBody?.phoneNumber).toBe('+212600000000');
		// regression (issue #320): privacyConsent is a client-side gate only --
		// the backend has no field for it and was never asked to add one.
		expect(requestBody).not.toHaveProperty('privacyConsent');
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
		await page.getByLabel('أوافق على سياسة الخصوصية').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page).toHaveURL(/\/login/);
		expect(requestBody?.phoneNumber).toBe('+33612345678');
	});

	test('surfaces the backend "email already exists" error', async ({ page }) => {
		// Shaped like the real error-handler's response (src/middleware/
		// error-handler.js always sends { message, statusCode }, never the
		// raw express-validator { errors: [...] } array this used to mock).
		await mockJson(
			page,
			'**/api/auth/signup',
			{ message: 'E-Mail address already exists!', statusCode: 400 },
			{ status: 400, method: 'POST' }
		);

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('taken@example.com');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByLabel('أوافق على سياسة الخصوصية').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		// The form should stay on /signup and not silently pretend success.
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/\/signup/);
	});

	test('regression (issue #307): a signup failure is shown via the shared error toast, not silently dropped', async ({ page }) => {
		// useSignup's onError used to be console.error(...) and nothing else --
		// SignupForm has no error UI of its own, so a failed signup looked
		// exactly like a hung page.
		await mockJson(
			page,
			'**/api/auth/signup',
			{ message: 'E-Mail address already exists!', statusCode: 400 },
			{ status: 400, method: 'POST' }
		);

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('taken@example.com');
		await page.getByRole('textbox', { name: 'كلمة المرور' }).fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByLabel('أوافق على سياسة الخصوصية').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page.getByText('E-Mail address already exists!')).toBeVisible({ timeout: 5000 });
	});

	test('regression (issue #320): submission is blocked with a clear error until the privacy-policy checkbox is checked', async ({ page }) => {
		let signupCalled = false;
		await page.route('**/api/auth/signup', async (route) => {
			signupCalled = true;
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
		// Every other required field is valid -- the checkbox is left unchecked.
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page.getByText('يجب الموافقة على سياسة الخصوصية للمتابعة')).toBeVisible();
		await page.waitForTimeout(300);
		expect(signupCalled).toBe(false);
		await expect(page).toHaveURL(/\/signup/);
	});

	test('regression (issue #320): the checkbox label links to the privacy-policy PDF without also toggling the checkbox', async ({ page }) => {
		await page.goto('/signup');
		const pdfLink = page.getByRole('link', { name: 'سياسة الخصوصية' });
		await expect(pdfLink).toHaveAttribute('href', '/files/Warid_Policies.pdf');
		await expect(pdfLink).toHaveAttribute('target', '_blank');

		const checkbox = page.getByLabel('أوافق على سياسة الخصوصية');
		await expect(checkbox).not.toBeChecked();

		// Assert on the network request the click triggers, not on the
		// resulting popup page's `.url()` -- a PDF response is handled
		// differently by different Chromium builds (rendered inline vs.
		// downloaded), so the popup can sit on 'about:blank' even though the
		// browser is correctly fetching the file. The request itself, on the
		// BrowserContext, is the reliable signal regardless of that.
		const requestPromise = page
			.context()
			.waitForEvent('request', (req) => req.url().includes('Warid_Policies.pdf'));
		await pdfLink.click();
		await requestPromise;

		// Clicking the link must not have also activated the checkbox via the
		// surrounding native <label>.
		await expect(checkbox).not.toBeChecked();
	});
});
