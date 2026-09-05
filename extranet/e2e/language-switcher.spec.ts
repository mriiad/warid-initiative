import { test, expect } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

/**
 * LanguageSwitcher was written, styled and unit-tested, and then rendered
 * nowhere: `grep -rn "LanguageSwitcher" src/` matched only the component and
 * its own test file. The app shipped three complete locales, a working
 * direction flip and localStorage persistence, with no control anywhere for
 * a user to pick between them -- language was decided solely by whatever the
 * browser reported, falling back to Arabic. See issue #421.
 */
test.describe('Language switcher', () => {
	test('a signed-in user can change the language from their profile, and it sticks', async ({ page }) => {
		await seedAuth(page, { userId: 'user-1' });
		await mockJson(page, '**/api/user/profile', fullProfileResponse());

		await page.goto('/profile');
		await expect(page.getByText('ملفي الشخصي')).toBeVisible({ timeout: 5000 });
		expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');

		await page.getByRole('button', { name: 'تغيير اللغة' }).click();
		await expect(page.getByRole('menuitem', { name: 'Français' })).toBeVisible();
		await page.getByRole('menuitem', { name: 'Français' }).click();

		await expect(page.getByText('Mon profil')).toBeVisible({ timeout: 5000 });
		// The whole point of an RTL-first app: the direction has to follow.
		expect(await page.evaluate(() => document.documentElement.dir)).toBe('ltr');
		expect(await page.evaluate(() => localStorage.getItem('warid_language'))).toBe('fr');

		// And it survives a reload rather than snapping back to Arabic.
		await page.reload();
		await expect(page.getByText('Mon profil')).toBeVisible({ timeout: 5000 });
	});

	test('a visitor who has no account yet can still change the language from the login screen', async ({ page }) => {
		// The language a first-time visitor reads is settled before they have
		// a profile screen to open.
		await page.goto('/login');
		await expect(page.getByRole('button', { name: 'تغيير اللغة' })).toBeVisible({ timeout: 5000 });

		await page.getByRole('button', { name: 'تغيير اللغة' }).click();
		await page.getByRole('menuitem', { name: 'English' }).click();

		await expect(page.getByText('Login', { exact: true }).first()).toBeVisible({ timeout: 5000 });
		expect(await page.evaluate(() => document.documentElement.dir)).toBe('ltr');
	});

	test('the signup screen carries it too, and going back to Arabic restores RTL', async ({ page }) => {
		await page.goto('/signup');
		await page.getByRole('button', { name: 'تغيير اللغة' }).click();
		await page.getByRole('menuitem', { name: 'English' }).click();
		await expect(page.getByRole('button', { name: 'Change language' })).toBeVisible({ timeout: 5000 });

		await page.getByRole('button', { name: 'Change language' }).click();
		await page.getByRole('menuitem', { name: 'العربية' }).click();

		await expect(page.getByRole('button', { name: 'تغيير اللغة' })).toBeVisible({ timeout: 5000 });
		expect(await page.evaluate(() => document.documentElement.dir)).toBe('rtl');
	});
});
