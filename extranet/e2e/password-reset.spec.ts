import { test, expect } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Password reset', () => {
	test('request-reset form submits an email', async ({ page }) => {
		await mockJson(page, '**/api/auth/request-reset', { message: 'Password reset link sent to email!' }, { status: 200, method: 'POST' });
		await page.goto('/request-reset-password');
		await page.getByLabel('البريد الإلكتروني').fill('user@example.com');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(300);
		// Should not crash or navigate away unexpectedly.
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('request-reset surfaces a "no user found" error', async ({ page }) => {
		// Regression (issue #307): this used to be console.error(...) and
		// nothing else -- the form just sat there with no visible feedback,
		// indistinguishable from a hang. Now goes through the shared error
		// toast.
		await mockJson(page, '**/api/auth/request-reset', { message: 'No user found with that email address.' }, { status: 404, method: 'POST' });
		await page.goto('/request-reset-password');
		await page.getByLabel('البريد الإلكتروني').fill('ghost@example.com');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('No user found with that email address.')).toBeVisible({ timeout: 5000 });
		await expect(page).toHaveURL(/request-reset-password/);
	});

	test('reset-password form accepts a new password for a valid token', async ({ page }) => {
		await mockJson(page, '**/api/auth/check-reset-token/*', { message: 'Token is valid.' }, { status: 200, method: 'GET' });
		await mockJson(page, '**/api/auth/reset-password/*', { message: 'Password reset successful!' }, { status: 200, method: 'POST' });
		await page.goto('/reset-password/valid-token-123');
		await page.getByLabel(/^كلمة المرور الجديدة/).fill('newpassword123');
		await page.getByLabel('تأكيد كلمة المرور الجديدة').fill('newpassword123');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(300);
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('regression (issue #307): a failed reset-password submission is shown via the shared error toast', async ({ page }) => {
		await mockJson(page, '**/api/auth/check-reset-token/*', { message: 'Token is valid.' }, { status: 200, method: 'GET' });
		await mockJson(page, '**/api/auth/reset-password/*', { message: 'This reset link has expired.' }, { status: 400, method: 'POST' });
		await page.goto('/reset-password/valid-token-123');
		await page.getByLabel(/^كلمة المرور الجديدة/).fill('newpassword123');
		await page.getByLabel('تأكيد كلمة المرور الجديدة').fill('newpassword123');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('This reset link has expired.')).toBeVisible({ timeout: 5000 });
	});

	test('reset-password rejects a mismatched confirmation', async ({ page }) => {
		await mockJson(page, '**/api/auth/check-reset-token/*', { message: 'Token is valid.' }, { status: 200, method: 'GET' });
		await page.goto('/reset-password/valid-token-123');
		await page.getByLabel(/^كلمة المرور الجديدة/).fill('newpassword123');
		await page.getByLabel('تأكيد كلمة المرور الجديدة').fill('doesnotmatch');
		await page.locator('button[type=submit]').click();
		await expect(page.getByText(/متطابقة/)).toBeVisible({ timeout: 5000 }).catch(async () => {
			// If no explicit mismatch message exists, this documents that gap.
			expect(true, 'BUG: no visible error for mismatched password confirmation').toBe(false);
		});
	});

	// The email Controller carried no `rules` at all, so pressing submit on an
	// empty form fired POST /api/auth/request-reset with {"email":""} -- past
	// the mailLimiter, which is tight for mail endpoints -- and then bounced
	// the user to /login as if something had been sent. See issue #412.
	test('regression (issue #412): an empty email is rejected in the form, not sent to the server', async ({ page }) => {
		let requested = false;
		await page.route('**/api/auth/request-reset', async (route) => {
			requested = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
		});

		await page.goto('/request-reset-password');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('البريد الإلكتروني مطلوب')).toBeVisible({ timeout: 5000 });
		await expect(page).toHaveURL(/request-reset-password/);
		expect(requested).toBe(false);
	});

	test('regression (issue #412): a malformed email is rejected in the form', async ({ page }) => {
		let requested = false;
		await page.route('**/api/auth/request-reset', async (route) => {
			requested = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
		});

		await page.goto('/request-reset-password');
		await page.getByLabel('البريد الإلكتروني').fill('not-an-email');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText(/بريد إلكتروني صالح/)).toBeVisible({ timeout: 5000 });
		expect(requested).toBe(false);
	});

	// PasswordResetForm navigated with `state.resetMessage`; LoginForm only
	// ever read `state.passwordReset`, so the user asked for a reset link and
	// landed on the login page with nothing at all telling them a mail was on
	// its way. See issue #412.
	test('regression (issue #412): a successful request confirms itself on the login screen', async ({ page }) => {
		await mockJson(page, '**/api/auth/request-reset', { message: 'Password reset link sent to email!' }, { status: 200, method: 'POST' });

		await page.goto('/request-reset-password');
		await page.getByLabel('البريد الإلكتروني').fill('user@example.com');
		await page.locator('button[type=submit]').click();

		await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
		// Worded conditionally because requestPasswordReset answers 200 whether
		// or not the address exists, so it can't be used to enumerate accounts.
		await expect(page.getByText(/إذا كان هذا البريد الإلكتروني مسجلاً/)).toBeVisible();
	});
});
