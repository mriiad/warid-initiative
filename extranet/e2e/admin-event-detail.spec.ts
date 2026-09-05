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

	// The dialog used to be built from hardcoded English literals in
	// EventDetail.tsx ("Delete Event" / "Are you sure you want to delete the
	// event ...?" / DELETE / CANCEL), under an otherwise fully Arabic RTL
	// page -- the one irreversible action an event admin can take was the one
	// they couldn't read. See issue #420.
	test('regression (issue #420): the delete-event confirmation asks in Arabic, not English', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENTAGADIR', eventDetailResponse({
			reference: 'WEVENTAGADIR',
			title: 'Agadir Event',
			isGeneric: false,
		}));
		await mockJson(page, '**/api/event/WEVENTAGADIR/participants/details', {
			isGeneric: false,
			allDonaters: 4,
			realDonaters: 2,
			registeredParticipants: 4,
		});

		await page.goto('/events/WEVENTAGADIR');
		await expect(page.getByText('Agadir Event').first()).toBeVisible({ timeout: 5000 });

		await page.getByRole('button', { name: 'حذف' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('heading', { name: 'حذف الفعالية' })).toBeVisible();
		// The event's own title is still interpolated into the question.
		await expect(dialog.getByText('Agadir Event', { exact: false })).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'حذف' })).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'إلغاء' })).toBeVisible();
		await expect(dialog.getByText('Delete Event')).toHaveCount(0);
		await expect(dialog.getByText('cannot be undone', { exact: false })).toHaveCount(0);
	});
});
