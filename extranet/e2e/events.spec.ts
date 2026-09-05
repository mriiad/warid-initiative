import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, eventListResponse, eventDetailResponse, sampleEvent } from './support/mockApi';

test.describe('Events list', () => {
	test('renders events returned by the API', async ({ page }) => {
		await mockJson(page, '**/api/events*', eventListResponse([sampleEvent({ title: 'Collecte A' }), sampleEvent({ reference: 'WEVENT2', title: 'Collecte B' })]));
		await page.goto('/events');
		await expect(page.getByText('Collecte A')).toBeVisible();
		await expect(page.getByText('Collecte B')).toBeVisible();
	});

	test('regression: /events renders full-screen for non-admins too, not wrapped in the old app chrome on top of the new one', async ({ page }) => {
		// DonorEventsListView ships its own full-bleed top bar + RedesignBottomNav,
		// but '/events' was only added to App.tsx's full-screen route list for
		// admins (from before the donor view existed) -- so non-admins were
		// getting the old MobileHeader (with the app logo) and MobileNavbar
		// wrapped around the already-redesigned screen. Confirm the old chrome
		// is gone now.
		await mockJson(page, '**/api/events*', eventListResponse([sampleEvent({ title: 'Collecte A' })]));
		await page.goto('/events');
		await expect(page.getByText('Collecte A')).toBeVisible();
		await expect(page.locator('img[alt="Logo"]')).toHaveCount(0);
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
		// Redesigned donor detail page shows the title in both the top bar and
		// the hero card, so target the first match (same pattern as the
		// admin-dashboard stats test).
		await expect(page.getByText('Collecte de sang - Casablanca').first()).toBeVisible({ timeout: 5000 });
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

		// Regression (issue #322): the QR code used to render inline on this
		// page, forcing the admin to screenshot it. Now behind a "Get QR code"
		// button that opens the same SaveQrModal the donor flow used to use.
		await expect(page.locator('img[src^="data:image/png;base64,QRCODEDATA"]')).toHaveCount(0);
		await page.getByRole('button', { name: 'الحصول على رمز الاستجابة السريعة' }).click();
		await expect(page.locator('img[src^="data:image/png;base64,QRCODEDATA"]')).toBeVisible({ timeout: 5000 });
	});

	test('regression (issue #322): the admin can download the event QR code from the modal', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ qrCode: 'data:image/png;base64,QRCODEDATA' }));
		await page.goto('/events/WEVENT20990101?forceDesktop=1');

		await page.getByRole('button', { name: 'الحصول على رمز الاستجابة السريعة' }).click();
		await expect(page.locator('img[alt="QR code"]')).toBeVisible({ timeout: 5000 });

		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('button', { name: 'حفظ' }).click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toBe('warid-event-WEVENT20990101-qr.png');
	});
});

test.describe('Donor event detail (redesigned)', () => {
	test('a not-yet-participating donor can tap Participate to register', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ title: 'Collecte de sang - Casablanca' }));
		await mockJson(page, '**/api/check/WEVENT20990101', { hasParticipated: false });
		let participateCalled = false;
		await page.route('**/api/participate/WEVENT20990101', async (route) => {
			participateCalled = true;
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Participant registered successfully.' }) });
		});

		await page.goto('/events/WEVENT20990101');
		await page.getByRole('button', { name: 'شارك' }).click();
		await page.waitForTimeout(500);
		expect(participateCalled).toBe(true);
	});

	test('a donor who already participated sees a confirmation message instead of the button', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ title: 'Collecte de sang - Casablanca' }));
		await mockJson(page, '**/api/check/WEVENT20990101', { hasParticipated: true });

		await page.goto('/events/WEVENT20990101');
		await expect(page.getByText('تم تسجيلك بنجاح في قائمة المشاركين', { exact: false })).toBeVisible({ timeout: 5000 });
		await expect(page.getByRole('button', { name: 'شارك' })).toHaveCount(0);
	});

	test('regression (issue #322): registering successfully shows a success message, not a QR-save modal', async ({ page }) => {
		// Used to open SaveQrModal instead -- a QR encoding a presence-
		// confirmation link the donor never asked to save, with no success
		// message shown underneath it at all.
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ title: 'Collecte de sang - Casablanca' }));
		await mockJson(page, '**/api/check/WEVENT20990101', { hasParticipated: false });
		await page.route('**/api/participate/WEVENT20990101', async (route) => {
			await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Participant registered successfully.' }) });
		});

		await page.goto('/events/WEVENT20990101');
		await page.getByRole('button', { name: 'شارك' }).click();

		await expect(page.getByText('Participant registered successfully.')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('احفظ رمز الاستجابة السريعة الخاص بك')).toHaveCount(0);
		await expect(page.locator('img[alt="QR code"]')).toHaveCount(0);
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

	test('regression (issue #319): the create-event form has no search icon -- there is nothing to search here', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await page.goto('/events/create');
		await expect(page.getByLabel('بحث...')).toHaveCount(0);
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

	test('regression: submitting the form PUTs the singular /api/event/:reference, not the plural /api/events/:reference', async ({ page }) => {
		// eventsService.update() used to PUT the plural /api/events/:reference,
		// which matches no backend route at all (only /api/event/:reference is
		// registered) -- every admin "save" 404'd. Confirm the real request
		// lands on the route the backend actually has.
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse());
		let putCalled = false;
		await page.route('**/api/event/WEVENT20990101', async (route) => {
			if (route.request().method() === 'PUT') {
				putCalled = true;
				return route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Event updated successfully!', event: sampleEvent() }),
				});
			}
			return route.fallback();
		});

		await page.goto('/events/update/WEVENT20990101');
		await expect(page.getByLabel('العنوان', { exact: true })).toHaveValue('Collecte de sang - Casablanca');
		await page.locator('button[type=submit]').click();
		await page.waitForTimeout(500);

		expect(putCalled).toBe(true);
	});
});

test.describe('Event deletion (admin only, regression test for the redesigned events list/detail)', () => {
	test('the admin events list no longer has an inline delete action (dropped to match the new mockup); deletion now happens from the redesigned event detail page', async ({ page }) => {
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
		await page.getByRole('button', { name: 'حذف' }).click();
		// Scoped to the dialog: its confirm button is now also 'حذف' rather
		// than the old hardcoded English 'Delete' (issue #420), so an
		// unscoped lookup would match the page's delete button too.
		await page.getByRole('dialog').getByRole('button', { name: 'حذف' }).click();
		await page.waitForTimeout(500);
		expect(deleteCalled).toBe(true);
	});

	test('regression (issue #332): a failed delete shows the real backend reason, not a generic message', async ({ page }) => {
		// The events controller raises ApiError, which used to serialize as
		// `{ errorMessage, errorKeys }` while everything else sent
		// `{ message, statusCode }`. The shared error toast only ever looked
		// for `message`, so the specific reason was dropped on the floor and
		// the user got the generic "an error occurred" fallback instead.
		// Both shapes are now `message`.
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse({ reference: 'WEVENT20990101', title: 'To Delete' }));
		await page.route('**/api/event', async (route) => {
			if (route.request().method() === 'DELETE') {
				return route.fulfill({
					status: 403,
					contentType: 'application/json',
					body: JSON.stringify({
						message: 'This event already has registered participants.',
						statusCode: 403,
						errorKeys: [],
					}),
				});
			}
			return route.fallback();
		});

		await page.goto('/events/WEVENT20990101?forceDesktop=1');
		await page.getByRole('button', { name: 'حذف' }).click();
		// Scoped to the dialog: its confirm button is now also 'حذف' rather
		// than the old hardcoded English 'Delete' (issue #420), so an
		// unscoped lookup would match the page's delete button too.
		await page.getByRole('dialog').getByRole('button', { name: 'حذف' }).click();

		await expect(
			page.getByText('This event already has registered participants.')
		).toBeVisible({ timeout: 5000 });
	});
});

// `isLoading || !event` cannot tell a slow fetch from a failed one: on a 404
// the query settles, `event` stays undefined, and the loading branch held
// forever. /events/:reference is the URL behind printed and shared event QR
// codes, so a deleted event or a mistyped reference produced a dead screen
// with no explanation. See issue #418.
test.describe('Event detail when the event cannot be loaded (issue #418)', () => {
	test('a reference that does not exist shows a not-found message and a way back, not an endless spinner', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events/WEVENTGONE', { message: 'Event not found' }, { status: 404 });

		await page.goto('/events/WEVENTGONE');

		await expect(page.getByText('لم يتم العثور على هذه الفعالية')).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('...جاري تحميل تفاصيل الفعالية')).toHaveCount(0);

		await page.getByRole('button', { name: 'العودة إلى الفعاليات' }).click();
		await expect(page).toHaveURL(/\/events(\?|$)/);
	});

	test('a server error is worded as a transient failure rather than a missing event', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/events/WEVENTAGADIR', { message: 'Server error' }, { status: 500 });

		await page.goto('/events/WEVENTAGADIR');

		await expect(page.getByText(/تعذّر تحميل تفاصيل الفعالية/)).toBeVisible({ timeout: 10000 });
		await expect(page.getByText('لم يتم العثور على هذه الفعالية')).toHaveCount(0);
	});

	test('an admin gets the same treatment, not a blank detail screen', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		await mockJson(page, '**/api/events/WEVENTGONE', { message: 'Event not found' }, { status: 404 });

		await page.goto('/events/WEVENTGONE');

		await expect(page.getByText('لم يتم العثور على هذه الفعالية')).toBeVisible({ timeout: 10000 });
	});
});

// The donor list used to filter the page it had been given (dropping generic
// and past events) and then derive totalPages from what survived. A page
// holds at most five items, so that count could never exceed one: the pager
// was hidden and events beyond the first page were unreachable. With the
// backend unsorted, the oldest events also sat on page 1, so once five past
// events accumulated the list read "no events available" while upcoming ones
// waited on later pages. See issue #417.
test.describe('Events list pagination (issue #417)', () => {
	const mkEvent = (i: number, date: string, isGeneric = false) =>
		sampleEvent({ _id: `evt-${i}`, reference: `WEV${i}`, title: `Event ${i}`, date, isGeneric });
	const future = (days: number) => new Date(Date.now() + days * 864e5).toISOString();

	// Serves whatever the server would for the requested page, honouring the
	// filters, so the test exercises the real client/server contract.
	const routeEvents = async (page: import('@playwright/test').Page, all: ReturnType<typeof mkEvent>[]) => {
		await page.route('**/api/events?**', async (route) => {
			const params = new URL(route.request().url()).searchParams;
			let set = all;
			if (params.get('upcoming') === 'true') {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				set = set.filter((e) => new Date(e.date as string) >= today);
			}
			if (params.get('includeGeneric') === 'false') {
				set = set.filter((e) => !e.isGeneric);
			}
			set = [...set].sort(
				(a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
			);
			const p = Number(params.get('page') || 1);
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ events: set.slice((p - 1) * 5, p * 5), totalItems: set.length }),
			});
		});
	};

	test('a donor can page through more than five events', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		const all = Array.from({ length: 12 }, (_, i) => mkEvent(i + 1, future(i + 1)));
		await routeEvents(page, all);

		await page.goto('/events');
		await expect(page.getByText('Event 1')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Event 6')).toHaveCount(0);

		// The pager exists at all -- it used to be hidden, since totalPages
		// was computed from a five-item page and so was never above 1.
		await expect(page.getByText('صفحة 1 من 3')).toBeVisible();

		await page.getByRole('button', { name: 'التالي' }).click();
		await expect(page.getByText('Event 6')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('صفحة 2 من 3')).toBeVisible();
	});

	test('a donor still sees upcoming events when the oldest five are in the past', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		const past = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
		const all = [
			...Array.from({ length: 5 }, (_, i) => mkEvent(i + 1, past(10 - i))),
			...Array.from({ length: 2 }, (_, i) => mkEvent(i + 6, future(i + 1))),
		];
		await routeEvents(page, all);

		await page.goto('/events');

		await expect(page.getByText('Event 6')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('.لا توجد فعاليات متاحة حالياً. تحقق مرة أخرى لاحقاً')).toHaveCount(0);
	});

	test('generic events stay out of the donor list, and out of its page count', async ({ page }) => {
		await seedAuth(page, { isAdmin: false });
		const all = [
			mkEvent(1, future(1)),
			mkEvent(2, future(2), true),
			mkEvent(3, future(3), true),
		];
		await routeEvents(page, all);

		await page.goto('/events');

		await expect(page.getByText('Event 1')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Event 2')).toHaveCount(0);
		// One event left after filtering, so no pager at all.
		await expect(page.getByText(/صفحة \d+ من/)).toHaveCount(0);
	});

	test('an admin still sees every event, generic and past included', async ({ page }) => {
		await seedAuth(page, { isAdmin: true });
		const past = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
		const all = [mkEvent(1, past(5)), mkEvent(2, future(1), true), mkEvent(3, future(2))];
		await routeEvents(page, all);

		await page.goto('/events');

		await expect(page.getByText('Event 1')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('Event 2')).toBeVisible();
		await expect(page.getByText('Event 3')).toBeVisible();
	});
});
