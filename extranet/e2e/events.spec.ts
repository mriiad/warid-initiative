import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, eventListResponse, eventDetailResponse, sampleEvent } from './support/mockApi';

test.describe('Events list', () => {
	test('renders events returned by the API', async ({ page }) => {
		await mockJson(page, '**/api/events*', eventListResponse([sampleEvent({ title: 'Collecte A' }), sampleEvent({ reference: 'WEVENT2', title: 'Collecte B' })]));
		await page.goto('/events');
		await expect(page.getByText('Collecte A')).toBeVisible();
		await expect(page.getByText('Collecte B')).toBeVisible();
	});
});

test.describe('Event details (BUG regression for issue #196)', () => {
	// EventDetail.tsx reads title/subtitle/image/date/location/description off
	// `event.data.X` directly, but the real GET /api/events/:reference response
	// is `{ message, event: {...} }` -- every one of those fields actually
	// lives one level deeper, at `event.data.event.X`. Only the QR code (line
	// ~752, `event.data.event.qrCode`) drills into the right place. The result
	// is that almost the entire Event Details page is blank: no title, no
	// subtitle, no image, no date, no location, no description.
	test('BUG: title is missing from the event details page', async ({ page }) => {
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ title: 'Collecte de sang - Casablanca' }));
		await page.goto('/events/WEVENT20990101');
		await expect(page.getByText('Collecte de sang - Casablanca')).toBeVisible({ timeout: 5000 });
	});

	test('BUG: description is missing from the event details page', async ({ page }) => {
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ description: 'Venez nombreux a la collecte de sang.' }));
		await page.goto('/events/WEVENT20990101?forceDesktop=1');
		await expect(page.getByText('Venez nombreux a la collecte de sang.')).toBeVisible({ timeout: 5000 });
	});

	test('BUG: location is missing from the event details page', async ({ page }) => {
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ location: 'Boulevard Zerktouni, Casablanca' }));
		await page.goto('/events/WEVENT20990101');
		await expect(page.getByText('Boulevard Zerktouni, Casablanca')).toBeVisible({ timeout: 5000 });
	});

	test('the admin-only QR code path IS wired correctly (contrast case)', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ qrCode: 'data:image/png;base64,QRCODEDATA' }));
		await page.goto('/events/WEVENT20990101?forceDesktop=1');
		await expect(page.locator('img[src^="data:image/png;base64,QRCODEDATA"]')).toBeVisible({ timeout: 5000 });
	});
});

test.describe('Event creation (admin only)', () => {
	test('BUG: a non-admin visiting /events/create gets stuck on an infinite loading spinner instead of a 404', async ({ page }) => {
		// App.tsx only registers `<Route path='/events/create' .../>` when
		// isAdmin is true. For a non-admin, that route is absent from the
		// tree, so React Router falls through to the next route that matches
		// the path -- `/events/:reference/*` (EventDetail) -- treating
		// "create" as an event reference. EventDetail then tries to load an
		// event named "create", which never resolves, leaving a permanent
		// "جاري تحميل تفاصيل الفعالية..." (loading event details) spinner
		// instead of redirecting to the 404 page a user would reasonably
		// expect for a route they aren't allowed to use.
		await seedAuth(page, { isAdmin: false });
		await page.goto('/events/create');
		await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
	});

	test('admin can submit the create-event form', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/event', { message: 'Event created successfully!', event: { reference: 'WEVENT20990101', _id: 'evt-1' } }, { status: 201, method: 'POST' });
		await page.goto('/events/create');
		await page.getByLabel('العنوان', { exact: true }).fill('New Event');
		await page.getByLabel('موقع الحدث').fill('Rabat');
		await page.locator('input[type=date]').fill('2099-01-01');
		await page.getByLabel('الوصف').fill('Description');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});
});

test.describe('Event update (admin only, regression test for issue #205)', () => {
	test('the update form loads pre-filled with the event\'s current data, without crashing', async ({ page }) => {
		// UpdateEvent.tsx used to call `new Date(eventData.date).toISOString()`
		// directly on the raw AxiosResponse (eventData.date was undefined,
		// since the real payload is nested at eventData.data.event.date),
		// throwing `RangeError: Invalid time value` and crashing the page.
		// Fixed to read `eventData.data.event` correctly.
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse());
		await page.goto('/events/update/WEVENT20990101');

		await expect(page.getByLabel('العنوان', { exact: true })).toHaveValue('Collecte de sang - Casablanca');
		expect(errors.some((e) => /Invalid time value/.test(e))).toBe(false);
	});
});

test.describe('Event deletion (admin only, regression test for the redesigned events list)', () => {
	test('the admin events list no longer has an inline delete action (dropped to match the new mockup); deletion now happens from the event detail page', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events*', eventListResponse([sampleEvent({ reference: 'WEVENT20990101', title: 'To Delete' })]));
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ reference: 'WEVENT20990101', title: 'To Delete' }));
		let deleteCalled = false;
		await page.route('**/api/event', async (route) => {
			if (route.request().method() === 'DELETE') {
				deleteCalled = true;
				return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Event deleted successfully.' }) });
			}
			return route.fallback();
		});

		await page.goto('/events');
		await expect(page.getByText('To Delete')).toBeVisible();
		expect(await page.getByRole('button', { name: 'حذف' }).count()).toBe(0);

		await page.getByRole('button', { name: 'عرض التفاصيل' }).click();
		await expect(page).toHaveURL(/\/events\/WEVENT20990101/);
		await page.getByRole('button', { name: 'Delete Event' }).click();
		await page.getByRole('button', { name: 'Delete' }).click();
		await page.waitForTimeout(500);
		expect(deleteCalled).toBe(true);
	});
});
