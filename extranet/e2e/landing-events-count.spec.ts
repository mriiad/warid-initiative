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
test.describe('Landing page event count (issue #452)', () => {
	test('shows the number of events when the request succeeds', async ({ page }) => {
		await mockJson(
			page,
			'**/api/events*',
			eventListResponse([sampleEvent(), sampleEvent({ _id: 'evt-2' })], 7)
		);
		await page.goto('/home');

		// totalItems, not the length of the page -- a page holds at most five.
		await expect(page.getByText('7', { exact: true })).toBeVisible({ timeout: 5000 });
	});

	test('shows zero rather than a dash when there genuinely are no events', async ({ page }) => {
		await mockJson(page, '**/api/events*', eventListResponse([], 0));
		await page.goto('/home');

		await expect(page.getByText('0', { exact: true })).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('—', { exact: true })).toHaveCount(0);
	});

	test('says the count could not be loaded when the request fails, instead of showing a dash', async ({ page }) => {
		await mockJson(page, '**/api/events*', { message: 'boom' }, { status: 500 });
		await page.goto('/home');

		// An em dash is indistinguishable from "we have no events", which is
		// what made this look like missing data rather than a failed request.
		await expect(page.getByText('تعذر تحميل الفعاليات')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('—', { exact: true })).toHaveCount(0);
	});

	test('a failed request offers a retry, and the count appears once it succeeds', async ({ page }) => {
		let attempt = 0;
		await page.route('**/api/events*', async (route) => {
			attempt += 1;
			if (attempt === 1) {
				return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
			}
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(eventListResponse([sampleEvent()], 4)),
			});
		});
		await page.goto('/home');

		await page.getByRole('button', { name: 'إعادة المحاولة' }).click();
		await expect(page.getByText('4', { exact: true })).toBeVisible({ timeout: 10000 });
	});
});
