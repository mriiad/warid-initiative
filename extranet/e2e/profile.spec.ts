import { test, expect, Route } from '@playwright/test';
import { mockJson, seedAuth, fullProfileResponse } from './support/mockApi';

test.describe('Profile page', () => {
	test('renders a complete profile correctly', async ({ page }) => {
		await seedAuth(page);
		await mockJson(page, '**/api/user/profile', fullProfileResponse({ firstname: 'Yassine', lastname: 'Alaoui' }));
		await page.goto('/profile');
		await expect(page.getByText('Yassine', { exact: true })).toBeVisible();
		await expect(page.getByText('Alaoui')).toBeVisible();
	});

	test('BUG: saving profile edits hits the admin-only /api/users/me endpoint (issue #204 root cause)', async ({ page }) => {
		// ProfileComponent.tsx's handleUpdateProfile always calls
		// updateProfileMutation.mutate({ userId: 'me', data }), and
		// usersService.updateProfile(userId, data) does
		// `apiClient.put(`/api/users/${userId}`, data)`. That resolves to
		// `PUT /api/users/me` -- the ADMIN-ONLY updateUserById route (guarded
		// by checkIfAdmin), not the self-service PATCH /api/user/profile route
		// used by GET. For a non-admin (every normal donor), this 403s; for an
		// admin, `User.findById('me')` throws the exact Mongoose CastError
		// reported in issue #204 ("Cast to ObjectId failed for value 'me'").
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/user/profile', fullProfileResponse());

		let capturedUrl = '';
		let capturedMethod = '';
		await page.route('**/api/users/me', async (route: Route) => {
			capturedUrl = route.request().url();
			capturedMethod = route.request().method();
			await route.fulfill({
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'User must be an Admin to call this API.' }),
			});
		});

		await page.goto('/profile');
		await expect(page.getByText('Personal Information')).toBeVisible();
		await page
			.locator('h5', { hasText: 'Personal Information' })
			.locator('xpath=ancestor::*[contains(@class,"MuiBox-root")][1]')
			.getByRole('button')
			.click();

		// The edit form should now be visible; save without changing anything.
		const saveButton = page.getByRole('button', { name: /save/i });
		await saveButton.click({ timeout: 5000 }).catch(() => {});
		await page.waitForTimeout(500);

		expect(capturedUrl).toContain('/api/users/me');
		expect(capturedMethod).toBe('PUT');
	});
});
