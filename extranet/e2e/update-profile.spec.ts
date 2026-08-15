import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

/**
 * UserProfileForm ('/update-profile') is where a brand-new user is sent to
 * fill in their donor profile after signup.
 */
test.describe('Complete your profile', () => {
	const fillForm = async (page: import('@playwright/test').Page) => {
		await page.getByLabel(/الاسم الشخصي/).fill('Yassine');
		await page.getByLabel(/الاسم العائلي/).fill('Alaoui');
		await page.getByLabel(/تاريخ الميلاد/).fill('1995-05-20');
		// Neither Select has an accessible name here (same a11y gap as the
		// emergency form) -- target positionally: bloodGroup then city.
		await page.getByRole('combobox').nth(0).click();
		await page.getByRole('option', { name: 'O+' }).click();
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option').nth(1).click();
	};

	test('a successful save goes through PUT /api/user/update and navigates to /events', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/user/profile', { firstname: '', lastname: '', gender: 'male' });

		let requestBody: Record<string, unknown> | null = null;
		await page.route('**/api/user/update', async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'User profile updated successfully!' }) });
		});

		await page.goto('/update-profile');
		await fillForm(page);
		await page.getByRole('button', { name: /تحديث/ }).click();

		await expect(page).toHaveURL(/\/events/, { timeout: 5000 });
		expect(requestBody).toMatchObject({ firstname: 'Yassine', lastname: 'Alaoui' });
	});

	test('regression test for issue #300: a failed save shows an error message instead of failing silently', async ({ page }) => {
		await seedAuth(page, { isAdmin: false, userId: 'user-1' });
		await mockJson(page, '**/api/user/profile', { firstname: '', lastname: '', gender: 'male' });
		await mockJson(page, '**/api/user/update', { message: 'Something went wrong.' }, { status: 500, method: 'PUT' });

		await page.goto('/update-profile');
		await fillForm(page);
		await page.getByRole('button', { name: /تحديث/ }).click();

		await expect(page.getByText(/فشل حفظ ملفك الشخصي/)).toBeVisible({ timeout: 5000 });
		// Stayed put -- the values the user typed are not lost.
		await expect(page).toHaveURL(/\/update-profile/);
		await expect(page.getByLabel(/الاسم الشخصي/)).toHaveValue('Yassine');
	});
});
