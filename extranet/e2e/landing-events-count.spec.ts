import { expect, test } from '@playwright/test';

import { eventListResponse, mockJson, sampleEvent } from './support/mockApi';

/**
 * Issue #452: the event count is missing from the landing page.
 *
 * LandingPage destructures only `data` from useEvents, so a request that is
 * still in flight, one that failed, and a genuinely empty database all reach
 * the same place -- `totalItems` is undefined and the stat pill renders a
 * bare em dash. It is the same flaw issue #418 fixed on EventDetail, which
 * could not tell a slow fetch from a failed one either; this was the last
 * screen still carrying it.
 */
// The stat pill's number, scoped. A bare getByText('4') also matches the day
// numbers in the event card's date strip, which appear precisely when the
// request succeeds -- so an unscoped digit assertion fails exactly in the
// case it is meant to confirm.
const eventCount = (page: import('@playwright/test').Page) =>
	page.locator('[class*="statNumber"]');

test.describe('Landing page event count (issue #452)', () => {
	test('shows the number of events when the request succeeds', async ({ page }) => {
		await mockJson(
			page,
			'**/api/events*',
			eventListResponse([sampleEvent(), sampleEvent({ _id: 'evt-2' })], 7)
		);
		await page.goto('/home');

		// totalItems, not the length of the page -- a page holds at most five.
		await expect(eventCount(page)).toHaveText('7', { timeout: 15000 });
	});

	test('shows zero rather than a dash when there genuinely are no events', async ({ page }) => {
		await mockJson(page, '**/api/events*', eventListResponse([], 0));
		await page.goto('/home');

		await expect(eventCount(page)).toHaveText('0', { timeout: 15000 });
	});

	test('says the count could not be loaded when the request fails, instead of showing a dash', async ({ page }) => {
		await mockJson(page, '**/api/events*', { message: 'boom' }, { status: 500 });
		await page.goto('/home');

		// An em dash is indistinguishable from "we have no events", which is
		// what made this look like missing data rather than a failed request.
		await expect(page.getByText('تعذر تحميل الفعاليات')).toBeVisible({ timeout: 15000 });
		// The pill is gone entirely rather than showing a dash that reads as
		// "we have no events".
		await expect(eventCount(page)).toHaveCount(0);
	});

	test('a failed request offers a retry, and the count appears once it succeeds', async ({ page }) => {
		// The QueryClient sets retry: 1 (see index.tsx), so the query already
		// retries itself once and a single transient failure self-heals
		// without the user doing anything. The manual retry only matters once
		// that automatic attempt has failed too -- hence failing the first
		// two calls rather than just the first.
		let attempts = 0;
		await page.route('**/api/events*', async (route) => {
			attempts += 1;
			if (attempts <= 2) {
				return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(eventListResponse([sampleEvent()], 4)),
			});
		});
		await page.goto('/home');

		await page.getByRole('button', { name: 'إعادة المحاولة' }).click({ timeout: 15000 });
		await expect(eventCount(page)).toHaveText('4', { timeout: 15000 });
	});

	test('a single transient failure recovers on its own, with no retry shown', async ({ page }) => {
		// The other half of retry: 1 -- worth pinning so the error state is
		// not made to appear more eagerly than it should.
		let attempts = 0;
		await page.route('**/api/events*', async (route) => {
			attempts += 1;
			if (attempts === 1) {
				return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(eventListResponse([sampleEvent()], 6)),
			});
		});
		await page.goto('/home');

		await expect(eventCount(page)).toHaveText('6', { timeout: 15000 });
		await expect(page.getByRole('button', { name: 'إعادة المحاولة' })).toHaveCount(0);
	});
});
