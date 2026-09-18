import { expect, test } from '@playwright/test';

import { mockJson, sampleEvent } from './support/mockApi';

/**
 * Issue #453: the next upcoming event is missing from the landing page.
 *
 * LandingPage asked for `useEvents(1)` with no filters, so the backend --
 * which sorts date ascending -- returned the five *oldest* events, and the
 * component then filtered that page down to upcoming, non-generic ones. Five
 * past events is enough to empty the card permanently while upcoming events
 * sit on later pages.
 *
 * It is the bug issue #417 fixed for the donor events list and the admin
 * dashboard, which asks explicitly with `useEvents(1, { upcoming: true })`.
 * The landing page was missed.
 */
const PAST = (day: string) => `2020-${day}T00:00:00.000Z`;
const FUTURE = (day: string) => `2099-${day}T00:00:00.000Z`;

const nextEventCard = (page: import('@playwright/test').Page) =>
	page.getByText('حملة تبرع بالدم - الرباط');

test.describe('Landing page next event (issue #453)', () => {
	test('asks the server for upcoming, non-generic events rather than filtering page one', async ({ page }) => {
		const requests: string[] = [];
		await page.route('**/api/events*', async (route) => {
			requests.push(route.request().url());
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ events: [], totalItems: 0 }),
			});
		});
		await page.goto('/home');
		await expect(page.getByText('لا توجد فعاليات في الوقت الحالي، تابعونا قريباً')).toBeVisible({
			timeout: 15000,
		});

		expect(requests).not.toHaveLength(0);
		// Without these the page receives the oldest events and filters them
		// client-side, which is what empties the card.
		expect(requests[0]).toContain('upcoming=true');
		expect(requests[0]).toContain('includeGeneric=false');
	});

	test('shows the soonest upcoming event even when the collection is full of past ones', async ({ page }) => {
		// What the server returns once it is asked correctly: past events are
		// filtered out server-side, so the page holds upcoming ones only.
		await mockJson(page, '**/api/events*', {
			events: [
				sampleEvent({
					_id: 'evt-soon',
					reference: 'WEVENTRABAT',
					title: 'حملة تبرع بالدم - الرباط',
					date: FUTURE('04-02'),
				}),
				sampleEvent({
					_id: 'evt-later',
					reference: 'WEVENTAGADIR',
					title: 'حملة تبرع بالدم - أكادير',
					date: FUTURE('05-20'),
				}),
			],
			totalItems: 2,
		});
		await page.goto('/home');

		await expect(nextEventCard(page)).toBeVisible({ timeout: 15000 });
		// The soonest one, not merely the first in the array.
		await expect(page.getByText('حملة تبرع بالدم - أكادير')).toHaveCount(0);
	});

	test('the count describes the same set as the card below it', async ({ page }) => {
		// Agreed behaviour change: with one filtered request serving both, the
		// pill counts upcoming events rather than every event ever run, so the
		// number and the card no longer describe different things.
		await mockJson(page, '**/api/events*', {
			events: [sampleEvent({ reference: 'WEVENTRABAT', title: 'حملة تبرع بالدم - الرباط', date: FUTURE('04-02') })],
			totalItems: 3,
		});
		await page.goto('/home');

		await expect(page.locator('[class*="statNumber"]')).toHaveText('3', { timeout: 15000 });
		await expect(nextEventCard(page)).toBeVisible();
	});

	test('a past event on the page is still not offered as the next event', async ({ page }) => {
		// Defence in depth: the client-side date filter stays, so a stale or
		// mis-filtered response cannot advertise an event that has been and gone.
		await mockJson(page, '**/api/events*', {
			events: [sampleEvent({ _id: 'evt-old', reference: 'WEVENTOLD', title: 'حملة قديمة', date: PAST('01-15') })],
			totalItems: 1,
		});
		await page.goto('/home');

		await expect(page.getByText('لا توجد فعاليات في الوقت الحالي، تابعونا قريباً')).toBeVisible({
			timeout: 15000,
		});
		await expect(page.getByText('حملة قديمة')).toHaveCount(0);
	});
});
