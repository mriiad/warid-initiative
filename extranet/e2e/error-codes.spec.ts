import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

/**
 * Backend messages are English prose, and the clients deliberately prefer
 * them over their own copy (issues #293, #332, #342, #344) -- correctly, but
 * it made English the primary error surface of an Arabic-first app. The
 * response now carries a code alongside the prose. See issue #434.
 */
test.describe('Error codes are rendered in the user\'s language', () => {
	test('a rejected login is refused in Arabic, not English', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/login',
			{ message: 'Wrong password.', statusCode: 401, code: 'WRONG_PASSWORD' },
			{ status: 401, method: 'POST' }
		);

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('AB123456');
		await page.getByLabel(/كلمة المرور/).first().fill('wrongpass');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('.اسم المستخدم أو كلمة المرور غير صحيحة')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Wrong password.')).toHaveCount(0);
	});

	// The half that matters most for rollout: an endpoint nobody has tagged
	// yet must keep showing exactly what it showed before.
	test('an untagged response still shows the backend reason, unchanged', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/login',
			{ message: 'Some reason nobody has tagged yet.', statusCode: 401 },
			{ status: 401, method: 'POST' }
		);

		await page.goto('/login');
		await page.getByLabel('اسم المستخدم').fill('AB123456');
		await page.getByLabel(/كلمة المرور/).first().fill('wrongpass');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('Some reason nobody has tagged yet.')).toBeVisible({ timeout: 5000 });
	});

	test('a donation refused for age is explained in Arabic, with the age interpolated', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(page, '**/api/donation/canDonate', { canDonate: true });
		await mockJson(
			page,
			'**/api/donation',
			{
				message: 'You must be at least 18 years old to donate.',
				errorKeys: [],
				code: 'DONATION_TOO_YOUNG',
				params: { minAge: 18 },
			},
			{ status: 403, method: 'POST' }
		);

		await page.goto('/donate');
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option', { name: 'الدم' }).click();
		await page.locator('button[type=submit]').click();

		await expect(page.getByText('يجب أن يكون عمرك 18 سنة على الأقل للتبرع.')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('at least 18 years old')).toHaveCount(0);
	});

	// The silent-404 hole closed by #416 was surfacing English prose; now it
	// surfaces translated copy instead.
	test('the donation 404 from #416 now reads in Arabic', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(page, '**/api/donation/canDonate', { canDonate: true });
		await mockJson(
			page,
			'**/api/donation',
			{ message: 'No generic event found for free donation', code: 'NO_GENERIC_EVENT' },
			{ status: 404, method: 'POST' }
		);

		await page.goto('/donate');
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option', { name: 'الدم' }).click();
		await page.locator('button[type=submit]').click();

		await expect(page.getByText(/لا يمكن تسجيل تبرع حر في الوقت الحالي/)).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('No generic event found')).toHaveCount(0);
	});

	test('the shared error toast translates too', async ({ page }) => {
		await mockJson(
			page,
			'**/api/auth/request-reset',
			{ message: 'That email is already in use.', code: 'DUPLICATE_VALUE', params: { field: 'email' } },
			{ status: 409, method: 'POST' }
		);

		await page.goto('/request-reset-password');
		await page.getByLabel('البريد الإلكتروني').fill('user@example.com');
		await page.locator('button[type=submit]').click();

		await expect(page.getByText(/هذه القيمة مستعملة من قبل/)).toBeVisible({ timeout: 5000 });
	});
});
