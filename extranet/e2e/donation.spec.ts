import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

test.describe('Donation form', () => {
	test('BUG: an eligible, first-time donor sees "not eligible ... starting undefined" (user-facing symptom of issue #200)', async ({ page }) => {
		// This mocks the REAL (buggy) backend response reproduced in
		// e2e/backend/donation.spec.js: donate() never awaits
		// checkDonationEligibility(), so canDonate/nextDonationDate are always
		// undefined and every donation is rejected with this exact message --
		// even for a first-time donor who has never donated before.
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(
			page,
			'**/api/donation',
			{ message: 'Based on your last donation date, you are not eligible to donate at this time. You can register for a new donation starting undefined', errorKeys: ['donationDate'] },
			{ status: 403, method: 'POST' }
		);

		await page.goto('/donate');
		// The donation-type <Select> has no accessible name (a separate,
		// smaller a11y gap), so it's targeted positionally: blood group (disabled)
		// is the first combobox, donation type is the second.
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option', { name: 'الدم' }).click();
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);
		await expect(page.getByText(/starting undefined/)).toBeVisible({ timeout: 5000 });
	});

	test('the donation date field cannot be set past today (fix: dates were previously unbounded, letting the rest-period check be bypassed by backdating)', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());

		await page.goto('/donate');

		const todayIso = new Date().toISOString().slice(0, 10);
		await expect(page.getByLabel('تاريخ التبرع')).toHaveAttribute('max', todayIso);
	});

	test('a backdated donation that falls inside the mandatory rest period is rejected with the real backend message', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(
			page,
			'**/api/donation',
			{
				message:
					'The provided donation date falls within your mandatory rest period. You can register a donation starting 20/09/2026',
				errorKeys: ['donationDate'],
			},
			{ status: 403, method: 'POST' }
		);

		await page.goto('/donate');
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option', { name: 'الدم' }).click();
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);
		await expect(page.getByText(/mandatory rest period/)).toBeVisible({ timeout: 5000 });
	});

	test('a donor under the minimum donation age is rejected with the real backend message', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(
			page,
			'**/api/donation',
			{ message: 'You must be at least 18 years old to donate.', errorKeys: [] },
			{ status: 403, method: 'POST' }
		);

		await page.goto('/donate');
		await page.getByRole('combobox').nth(1).click();
		await page.getByRole('option', { name: 'الدم' }).click();
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);
		await expect(page.getByText(/at least 18 years old/)).toBeVisible({ timeout: 5000 });
	});

	test('defensive: a 500 from canDonate does not crash the donation form', async ({ page }) => {
		// canDonate used to always 500 with a ReferenceError (fixed in
		// src/controllers/donation.js, see e2e/backend/donation.spec.js). This
		// test now only guards against a regression: if that endpoint ever
		// errors again for any reason, the form should still render.
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse());
		await mockJson(page, '**/api/donation/canDonate', { message: 'checkDonationEligibility is not defined', statusCode: 500 }, { status: 500 });

		const errors: string[] = [];
		page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

		await page.goto('/donate');
		await page.waitForTimeout(1000);
		// The page should still render the form rather than crash outright.
		await expect(page.locator('form')).toBeVisible();
	});
});
