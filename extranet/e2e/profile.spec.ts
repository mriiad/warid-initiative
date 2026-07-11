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

	test('FIXED (issue #204): saving profile edits hits the self-service PATCH /api/user/profile endpoint, not the admin-only /api/users/:userId route', async ({ page }) => {
		// Was: ProfileComponent.tsx's handleUpdateProfile called
		// updateProfileMutation.mutate({ userId: 'me', data }), which resolved
		// to `PUT /api/users/me` -- the ADMIN-ONLY updateUserById route
		// (guarded by checkIfAdmin). For a non-admin (every normal donor) this
		// 403'd; for an admin, `User.findById('me')` threw the exact Mongoose
		// CastError reported in issue #204.
		//
		// Now: ProfileComponent uses useUpdateMyProfile(), which PATCHes
		// /api/user/profile directly -- the self-service route that resolves
		// the user from the auth token server-side, matching GET's endpoint.
		await seedAuth(page, { isAdmin: false });
		await mockJson(page, '**/api/user/profile', fullProfileResponse(), { method: 'GET' });

		let adminRouteWasCalled = false;
		await page.route('**/api/users/me', async (route: Route) => {
			adminRouteWasCalled = true;
			await route.fulfill({
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify({ message: 'User must be an Admin to call this API.' }),
			});
		});

		let capturedUrl = '';
		let capturedMethod = '';
		await page.route('**/api/user/profile', async (route: Route) => {
			if (route.request().method() === 'PATCH') {
				capturedUrl = route.request().url();
				capturedMethod = route.request().method();
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ message: 'Profile updated successfully!' }),
				});
				return;
			}
			return route.fallback();
		});

		await page.goto('/profile');
		await expect(page.getByText('Personal Information')).toBeVisible();
		await page
			.locator('h5', { hasText: 'Personal Information' })
			.locator('xpath=ancestor::*[contains(@class,"MuiBox-root")][1]')
			.getByRole('button')
			.click();

		const saveButton = page.getByRole('button', { name: /save/i });
		await saveButton.click({ timeout: 5000 });
		await expect(page.getByText('Profile updated successfully!')).toBeVisible({ timeout: 5000 });

		expect(capturedUrl).toContain('/api/user/profile');
		expect(capturedMethod).toBe('PATCH');
		expect(adminRouteWasCalled).toBe(false);
	});
});
