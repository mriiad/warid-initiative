import { test, expect } from '@playwright/test';

test.describe('Basic navigation', () => {
	test('landing page renders', async ({ page }) => {
		await page.goto('/home');
		await expect(page.locator('body')).not.toContainText('Cannot GET');
	});

	test('unknown route renders the 404 page', async ({ page }) => {
		await page.goto('/this-route-does-not-exist');
		await expect(page.getByText('404')).toBeVisible();
		await expect(page.getByText(/غير موجودة هنا/)).toBeVisible();
	});

	test('FAQ page renders questions', async ({ page }) => {
		await page.goto('/FAQ?forceDesktop=1');
		await expect(page.getByText(/أجوبة سريعة/)).toBeVisible();
	});

	test('root path redirects to /home', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/home$/);
	});

	test('regression (issue #328): the landing page footer links to FAQ and Contact us, reachable by a logged-out visitor', async ({ page }) => {
		// /FAQ and /contact still existed and were redesigned onto the same
		// styling system, but nothing in the redesigned navigation linked to
		// either one -- the only thing that ever did was the old,
		// pre-redesign MobileNavbar, which no route a normal user visits
		// renders anymore. Both routes are meant to be reachable whether
		// logged in or not (see App.tsx), so this checks the fully
		// logged-out landing page specifically.
		await page.goto('/home');
		await page.getByRole('button', { name: 'الأسئلة الشائعة' }).scrollIntoViewIfNeeded();
		await page.getByRole('button', { name: 'الأسئلة الشائعة' }).click();
		await expect(page).toHaveURL(/\/FAQ/);

		await page.goBack();
		await expect(page).toHaveURL(/\/home/);
		const contactLink = page.getByRole('button', { name: 'تواصل معنا' });
		await expect(contactLink).toBeVisible();
		await contactLink.scrollIntoViewIfNeeded();
		await contactLink.click();
		await expect(page).toHaveURL(/\/contact/);
	});
});
