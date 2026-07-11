import { test, expect } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Signup', () => {
	test('BUG: the custom Arabic "required" messages never appear, because the native HTML required attribute blocks submission first', async ({ page }) => {
		// Every TextField in SignupForm.tsx has both a `required` prop (which
		// MUI forwards to the underlying <input required>) AND a react-hook-form
		// `rules: { required: 'اسم المستخدم مطلوب' }` custom message. The browser's
		// native constraint validation intercepts form submission before
		// react-hook-form's JS handler ever runs, popping up a plain English
		// "Please fill out this field" bubble instead of the localized Arabic
		// message the app was clearly built to show. The custom messages are
		// dead code for every required field in this form.
		await page.goto('/signup');
		await page.getByRole('button', { name: 'إرسال' }).click();
		await expect(page.getByText('اسم المستخدم مطلوب')).toBeVisible();
	});

	test('BUG: invalid-email custom validation is unreachable while any earlier required field is empty', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
		await page.getByRole('button', { name: 'إرسال' }).click();
		// Native validation stops at the empty CIN field (earlier in DOM order)
		// before react-hook-form's email regex ever runs.
		await expect(page.getByText(/عنوان بريد إلكتروني صالح/)).toBeVisible();
	});

	test('invalid email format is rejected once every other required field is filled', async ({ page }) => {
		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
		await page.getByLabel('كلمة المرور').fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();
		await expect(page.getByText(/عنوان بريد إلكتروني صالح/)).toBeVisible();
	});

	test('successful signup redirects to the login page', async ({ page }) => {
		await mockJson(page, '**/api/auth/signup', { message: 'User created!', userId: 'new-user-id' }, { status: 201, method: 'PUT' });

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('newuser@example.com');
		await page.getByLabel('كلمة المرور').fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		await expect(page).toHaveURL(/\/login/);
	});

	test('surfaces the backend "email already exists" error', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/signup',
			{ errors: [{ msg: 'E-Mail address already exists!', param: 'email' }] },
			{ status: 400, method: 'PUT' }
		);

		await page.goto('/signup');
		await page.getByLabel('رقم الهوية الوطنية').fill('CIN123456');
		await page.getByLabel('البريد الإلكتروني').fill('taken@example.com');
		await page.getByLabel('كلمة المرور').fill('password123');
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('ذكر').check();
		await page.getByRole('button', { name: 'إرسال' }).click();

		// The form should stay on /signup and not silently pretend success.
		await page.waitForTimeout(500);
		await expect(page).toHaveURL(/\/signup/);
	});
});
