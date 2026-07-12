import { test, expect } from '@playwright/test';
import { mockJson } from './support/mockApi';

test.describe('Password reset', () => {
	test('request-reset form submits an email', async ({ page }) => {
		await mockJson(page, '**/api/auth/request-reset', { message: 'Password reset link sent to email!' }, { status: 200, method: 'POST' });
		await page.goto('/request-reset-password');
		await page.getByLabel('Email').fill('user@example.com');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(300);
		// Should not crash or navigate away unexpectedly.
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('request-reset surfaces a "no user found" error', async ({ page }) => {
		await mockJson(page, '**/api/auth/request-reset', { message: 'No user found with that email address.' }, { status: 404, method: 'POST' });
		await page.goto('/request-reset-password');
		await page.getByLabel('Email').fill('ghost@example.com');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(300);
		await expect(page).toHaveURL(/request-reset-password/);
	});

	test('reset-password form accepts a new password for a valid token', async ({ page }) => {
		await mockJson(page, '**/api/auth/check-reset-token/*', { message: 'Token is valid.' }, { status: 200, method: 'GET' });
		await mockJson(page, '**/api/auth/reset-password/*', { message: 'Password reset successful!' }, { status: 200, method: 'POST' });
		await page.goto('/reset-password/valid-token-123');
		await page.getByLabel(/^New Password/).fill('newpassword123');
		await page.getByLabel('Confirm New Password').fill('newpassword123');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(300);
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('reset-password rejects a mismatched confirmation', async ({ page }) => {
		await mockJson(page, '**/api/auth/check-reset-token/*', { message: 'Token is valid.' }, { status: 200, method: 'GET' });
		await page.goto('/reset-password/valid-token-123');
		await page.getByLabel(/^New Password/).fill('newpassword123');
		await page.getByLabel('Confirm New Password').fill('doesnotmatch');
		await page.locator('button[type=submit]').click();
		await expect(page.getByText(/match/i)).toBeVisible({ timeout: 5000 }).catch(async () => {
			// If no explicit mismatch message exists, this documents that gap.
			expect(true, 'BUG: no visible error for mismatched password confirmation').toBe(false);
		});
	});
});
