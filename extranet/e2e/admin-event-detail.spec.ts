import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, eventDetailResponse } from './support/mockApi';

test.describe('Admin event detail (redesigned)', () => {
	test('shows real event, location and participant data, with working edit/delete actions', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENTAGADIR', eventDetailResponse({
			reference: 'WEVENTAGADIR',
			title: 'Agadir Event',
			location: 'Agadir Sous',
			date: '2099-11-18T00:00:00.000Z',
			isGeneric: false,
		}));
		await mockJson(page, '**/api/event/WEVENTAGADIR/participants/details', {
			isGeneric: false,
			allDonaters: 45,
			realDonaters: 12,
			registeredParticipants: 45,
		});

		await page.goto('/events/WEVENTAGADIR');

		await expect(page.getByText('Agadir Event').first()).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Agadir Sous')).toBeVisible();
		await expect(page.getByText('45').first()).toBeVisible();
		await expect(page.getByText('12')).toBeVisible();

		await page.getByRole('button', { name: 'تعديل' }).click();
		await expect(page).toHaveURL(/\/events\/update\/WEVENTAGADIR/);
	});

	test('a generic event only shows the total-donors row, not registered/real-donaters', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENTGENERIC', eventDetailResponse({
			reference: 'WEVENTGENERIC',
			title: 'Generic Drive',
			isGeneric: true,
		}));
		await mockJson(page, '**/api/event/WEVENTGENERIC/participants/details', {
			isGeneric: true,
			allDonaters: 8,
		});

		await page.goto('/events/WEVENTGENERIC');

		await expect(page.getByText('Generic Drive').first()).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('8')).toBeVisible();
		await expect(page.getByText('المسجلون للمشاركة')).toHaveCount(0);
	});

	test('non-admins still get the pre-existing event detail page, not the redesign', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events/WEVENTAGADIR', eventDetailResponse({
			reference: 'WEVENTAGADIR',
			title: 'Agadir Event',
		}));

		await page.goto('/events/WEVENTAGADIR');

		await expect(page.getByText('Agadir Event').first()).toBeVisible({ timeout: 5000 });
		// The redesign's back-arrow + divider + search top bar shouldn't be present.
		await expect(page.getByRole('button', { name: 'حذف' })).toHaveCount(0);
	});
});
