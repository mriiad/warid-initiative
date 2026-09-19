import { test, expect, Route } from '@playwright/test';
import { mockJson, seedAuth, sampleEvent, eventDetailResponse } from './support/mockApi';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Asserts what the update-event form actually puts on the wire, and saves it
 * as the fixture that e2e/backend/update-event-real-form-body.spec.js
 * replays against the real route stack.
 *
 * That backend test is the only thing covering issue #462 across the HTTP
 * boundary, and it is only as honest as this fixture: a stale one would keep
 * passing while the real form had moved on. Keeping the capture in the suite
 * means the fixture is rewritten on every run.
 */
const FIXTURES = path.join(__dirname, '..', '..', 'e2e', 'backend', 'support', 'fixtures');

test('the update form sends its text fields, and neither a date nor an image (issues #461, #462)', async ({ page }) => {
	await seedAuth(page, { isAdmin: true, userId: 'a1', adminRole: 'event' });
	await mockJson(page, '**/api/events/WEVENT20990101', eventDetailResponse());

	let body = '';
	let contentType = '';
	await page.route('**/api/event/WEVENT20990101', async (route: Route) => {
		if (route.request().method() === 'PUT') {
			body = route.request().postData() || '';
			contentType = route.request().headers()['content-type'] || '';
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'ok', event: sampleEvent() }),
			});
		}
		return route.fallback();
	});

	await page.goto('/events/update/WEVENT20990101');
	await expect(page.getByLabel('العنوان', { exact: true })).toBeVisible({ timeout: 10000 });
	await page.getByLabel('العنوان', { exact: true }).fill('Agadir Drive (renamed)');
	await page.locator('button[type=submit]').click();
	await expect.poll(() => body.length, { timeout: 10000 }).toBeGreaterThan(0);

	expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
	expect(body).toContain('name="title"');
	expect(body).toContain('name="location"');
	expect(body).toContain('name="isGeneric"');
	// The date is fixed at creation and the field is disabled, so the form
	// must not send it -- the backend falls back to the stored value. The
	// image is gone entirely.
	expect(body).not.toContain('name="date"');
	expect(body).not.toContain('name="image"');

	fs.mkdirSync(FIXTURES, { recursive: true });
	fs.writeFileSync(path.join(FIXTURES, 'update-event-body.txt'), body);
	fs.writeFileSync(path.join(FIXTURES, 'update-event-content-type.txt'), contentType);
});
