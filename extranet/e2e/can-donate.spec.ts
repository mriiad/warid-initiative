import { test, expect } from '@playwright/test';
import { mockJson, seedAuth } from './support/mockApi';

// Matched on a distinctive fragment rather than the full sentence: these
// are RTL strings whose trailing '.' renders at the start, which makes
// exact literals easy to get subtly wrong.
const CAN_DONATE_MSG = /بناءً على تاريخ تبرعك الأخير/;
const CANNOT_DONATE_MSG = /عذرًا، لا يُسمح لك بالتبرع/;

const mockEvent = (page) =>
	mockJson(page, '**/api/events/WEVENT1', {
		message: 'ok',
		event: { _id: 'evt-1', reference: 'WEVENT1', title: 'T', date: '2026-09-01', isGeneric: false, location: 'Rabat', description: 'd' },
	});

test.describe('Can-donate screen', () => {
	test('an ineligible donor is told they cannot donate', async ({ page }) => {
		// The eligibility flag was read off the Axios response object rather
		// than its body, so it was always truthy and this screen claimed the
		// donor could donate regardless of what the backend said.
		await seedAuth(page);
		await mockEvent(page);
		await mockJson(page, '**/api/donation/canDonate', {
			canDonate: false,
			lastDonationDate: '01/07/2026',
			nextDonationDate: '30/08/2026',
			ineligibilityReason: 'COOLDOWN',
		});

		await page.goto('/events/WEVENT1/can-donate');

		await expect(page.getByText(CANNOT_DONATE_MSG)).toBeVisible({ timeout: 5000 });
		await expect(page.getByText(CAN_DONATE_MSG)).toHaveCount(0);
	});

	test('an eligible donor is told they can donate, and Confirm takes them to the donation form', async ({ page }) => {
		await seedAuth(page);
		await mockEvent(page);
		await mockJson(page, '**/api/donation/canDonate', { canDonate: true, lastDonationDate: null });

		await page.goto('/events/WEVENT1/can-donate');

		await expect(page.getByText(CAN_DONATE_MSG)).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'تأكيد' }).click();
		await expect(page).toHaveURL(/\/donate\?eventRef=WEVENT1&eventDate=2026-09-01/);
	});

	test('an ineligible donor is routed to the presence-confirmation flow instead', async ({ page }) => {
		await seedAuth(page);
		await mockEvent(page);
		await mockJson(page, '**/api/donation/canDonate', { canDonate: false });
		await mockJson(page, '**/api/event/confirmPresence', { message: 'ok' }, { method: 'POST' });

		await page.goto('/events/WEVENT1/can-donate');
		await expect(page.getByText(CANNOT_DONATE_MSG)).toBeVisible({ timeout: 5000 });
		await page.getByRole('button', { name: 'تأكيد' }).click();
		await expect(page).toHaveURL(/\/events\/WEVENT1\/confirmation/);
	});
});
