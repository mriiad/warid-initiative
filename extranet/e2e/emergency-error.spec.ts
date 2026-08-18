import { test, expect } from '@playwright/test';

// Reproduces the bug in isolation before it's fixed: EmergencyForm reads the
// backend's error message from `error?.data?.message`, but apiClient rejects
// with a raw Axios error whose body lives at `error.response.data`, not
// `error.data` (see the response interceptor in utils/apiClient.ts, which
// forwards the error unchanged). `error?.data` is always undefined, so the
// specific backend message never displays -- only the generic fallback does.
test.describe('Emergency form error message', () => {
	test('a backend validation failure shows the actual reason, not just the generic fallback', async ({ page }) => {
		const backendMessage = 'Ce numéro de téléphone est déjà utilisé pour une urgence en cours.';
		await page.route('**/api/emergency', (route) =>
			route.fulfill({
				status: 400,
				contentType: 'application/json',
				body: JSON.stringify({ message: backendMessage, statusCode: 400 }),
			})
		);

		await page.goto('/emergency');
		await page.getByRole('combobox').nth(0).click();
		await page.getByRole('option', { name: 'O+' }).click();
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option').nth(1).click();
		await page.getByLabel('رقم الهاتف').fill('0600000000');
		await page.getByLabel('التفاصيل').fill('Urgent need for surgery.');
		await page.getByRole('button', { name: 'إنشاء حالة طارئة' }).click();

		await expect(page.getByText(backendMessage)).toBeVisible({ timeout: 5000 });
	});
});
