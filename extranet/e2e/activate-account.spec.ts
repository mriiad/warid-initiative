import { test, expect } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Account activation (issue #357)', () => {
	test('a valid activation link confirms the account and offers a way to log in', async ({ page }) => {
		await mockJson(page, '**/api/auth/activation/*', { message: 'Account activated.' }, { method: 'GET' });

		await page.goto('/activate/good-token');
		// A generous timeout: this is the only spec that ever visits this
		// route, so it always pays this chunk's first-compile cost (Vite
		// compiles routes on demand -- see playwright.config.ts).
		await expect(page.getByText('تم تأكيد حسابك بنجاح')).toBeVisible({ timeout: 10000 });

		await page.getByRole('button', { name: 'الذهاب لتسجيل الدخول' }).click();
		await expect(page).toHaveURL(/\/login/);
	});

	test('an invalid or expired activation link shows an error, not raw JSON', async ({ page }) => {
		await mockJson(page, '**/api/auth/activation/*', { message: 'User not found' }, { status: 404, method: 'GET' });

		await page.goto('/activate/bad-token');
		await expect(page.getByText('رابط التأكيد غير صالح أو منتهي الصلاحية')).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('button', { name: 'الذهاب لتسجيل الدخول' })).toBeVisible();
	});
});
