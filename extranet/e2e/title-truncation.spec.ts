import { expect, test } from '@playwright/test';
import { mockJson } from './support/mockApi';

// `text-overflow: ellipsis` trims at the end of the line *in the
// container's direction*, which under the app's dir=rtl is the visual
// left. Event titles are Latin-script, so the clipped half used to be the
// beginning -- the part that tells one event from another -- and the top
// bar read "...cte de sang - Casablanca". See issue #388.
//
// jsdom has no layout or bidi engine, so this can only be checked in a
// real browser: the assertion is which characters actually fall inside
// the element's box.
const LONG_LATIN = 'Collecte de sang - Casablanca Maarif Centre Ville';
const LONG_ARABIC = 'حملة التبرع بالدم في مدينة الدار البيضاء الكبرى بالمغرب';

const mockEvent = (page, title: string) =>
	mockJson(page, '**/api/events/WEVENT1', {
		message: 'ok',
		event: {
			_id: 'evt-1',
			reference: 'WEVENT1',
			title,
			date: '2099-01-01T00:00:00.000Z',
			isGeneric: false,
			location: 'Casablanca',
			description: 'd',
		},
	});

/** Which end of an overflowing title survives the ellipsis. */
async function visibleEnds(page, title: string) {
	return page.evaluate((full: string) => {
		const els = Array.prototype.slice.call(document.querySelectorAll('p,h1,h2,div'));
		let el: HTMLElement | null = null;
		for (const e of els as HTMLElement[]) {
			if (e.textContent === full && e.scrollWidth > e.clientWidth) {
				el = e;
				break;
			}
		}
		if (!el || !el.firstChild) return null;
		const box = el.getBoundingClientRect();
		const at = (i: number) => {
			const r = document.createRange();
			r.setStart(el!.firstChild!, i);
			r.setEnd(el!.firstChild!, i + 1);
			const cr = r.getBoundingClientRect();
			return cr.left >= box.left - 1 && cr.right <= box.right + 1;
		};
		return { startKept: at(0), endKept: at(full.length - 1) };
	}, title);
}

test.describe('Top-bar title truncation (issue #388)', () => {
	test('a Latin title keeps its beginning and clips its end', async ({ page }) => {
		await mockEvent(page, LONG_LATIN);
		await page.goto('/events/WEVENT1');
		await expect(page.getByText('Casablanca').first()).toBeVisible({ timeout: 5000 });

		const ends = await visibleEnds(page, LONG_LATIN);
		expect(ends, 'the title should be overflowing so truncation is exercised').not.toBeNull();
		// Before the fix these were reversed: the start was cut away.
		expect(ends!.startKept).toBe(true);
		expect(ends!.endKept).toBe(false);
	});

	test('an Arabic title also keeps its beginning', async ({ page }) => {
		// The fix resolves direction from the text itself, so it must not
		// have flipped RTL titles the other way in the process.
		await mockEvent(page, LONG_ARABIC);
		await page.goto('/events/WEVENT1');
		await expect(page.getByText('Casablanca').first()).toBeVisible({ timeout: 5000 });

		const ends = await visibleEnds(page, LONG_ARABIC);
		expect(ends).not.toBeNull();
		expect(ends!.startKept).toBe(true);
		expect(ends!.endKept).toBe(false);
	});
});
