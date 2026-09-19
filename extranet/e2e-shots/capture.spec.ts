import { test, type Page } from '@playwright/test';

import {
	dashboardResponse,
	eventDetailResponse,
	eventListResponse,
	fullProfileResponse,
	mockJson,
	profileCompleteResponse,
	sampleEvent,
	sampleUser,
	seedAuth,
} from '../e2e/support/mockApi';

/**
 * Regenerates the screenshots in docs/screenshots/ that the README embeds.
 *
 * Not part of the test suite -- playwright.config.ts points at ./e2e, so this
 * only runs when asked for explicitly:
 *
 *   npx playwright test --config=playwright.shots.config.ts
 *
 * It reuses e2e/support/mockApi.ts, so every screen is the real application
 * rendering real components; only the network boundary is faked. App.tsx gates
 * the whole UI behind a mobile-viewport check, so these are Pixel 7 captures
 * by necessity, not preference.
 */

const OUT = '../docs/screenshots';

const shot = async (page: Page, name: string) => {
	// Let entrance animations (framer-motion) and image loads settle, so a
	// capture is not a half-faded card.
	await page.waitForTimeout(1500);
	// JPEG rather than PNG: the geometric background pattern behind every
	// screen defeats PNG's compression, which made the set several megabytes
	// for images a README renders a few hundred pixels wide. Playwright emits
	// JPEG itself, so this needs no conversion step or extra dependency.
	await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 86 });
};

// Arabic fixtures: the app is Arabic-first, and a screenshot carrying French
// placeholder copy misrepresents it.
const upcomingEvents = [
	sampleEvent({
		reference: 'WEVENTCASA',
		title: 'حملة تبرع بالدم - الدار البيضاء',
		subtitle: 'بالشراكة مع المركز الجهوي لتحاقن الدم',
		location: 'الدار البيضاء',
		date: '2099-03-14T00:00:00.000Z',
		createdAt: '2099-03-01T00:00:00.000Z',
		description: 'حملة مفتوحة لكل المتبرعين من الثامنة صباحاً إلى الرابعة مساءً.',
	}),
	sampleEvent({
		_id: 'evt-2',
		reference: 'WEVENTRABAT',
		title: 'حملة تبرع بالدم - الرباط',
		subtitle: 'بتعاون مع كلية الطب',
		location: 'الرباط',
		date: '2099-04-02T00:00:00.000Z',
	}),
	sampleEvent({
		_id: 'evt-3',
		reference: 'WEVENTAGADIR',
		title: 'حملة تبرع بالدم - أكادير',
		subtitle: 'المركب الرياضي',
		location: 'أكادير',
		date: '2099-05-20T00:00:00.000Z',
	}),
];

test.describe.configure({ mode: 'serial' });

test('landing', async ({ page }) => {
	await mockJson(page, '**/api/events*', eventListResponse(upcomingEvents, 3));
	await page.goto('/home');
	// The landing page loads its own gallery photography.
	await page.waitForTimeout(1500);
	await shot(page, '01-landing');
});

test('login', async ({ page }) => {
	await page.goto('/login');
	await shot(page, '02-login');
});

test('signup', async ({ page }) => {
	await page.goto('/signup');
	await shot(page, '03-signup');
});

test('donor dashboard', async ({ page }) => {
	await seedAuth(page, { userId: 'user-1' });
	await mockJson(
		page,
		'**/api/users/user-1/dashboard',
		dashboardResponse({
			stats: { total: 4, lastDonation: '02/08/2026', eligibleIn: '31' },
			donations: [
				{ id: 'd1', date: '02/08/2026', type: 'BLOOD', event: 'حملة تبرع بالدم - الرباط' },
				{ id: 'd2', date: '14/03/2026', type: 'BLOOD', event: 'حملة تبرع بالدم - الدار البيضاء' },
				{ id: 'd3', date: '20/11/2025', type: 'BLOOD', event: 'تبرع عادي' },
			],
		})
	);
	await mockJson(page, '**/api/user/profile', fullProfileResponse());
	await page.goto('/dashboard');
	await shot(page, '04-donor-dashboard');
});

test('events list', async ({ page }) => {
	await seedAuth(page, { userId: 'user-1' });
	await mockJson(page, '**/api/events*', eventListResponse(upcomingEvents, 3));
	await page.goto('/events');
	await shot(page, '05-events');
});

test('event detail', async ({ page }) => {
	await seedAuth(page, { userId: 'user-1' });
	await mockJson(page, '**/api/events/WEVENTCASA', eventDetailResponse(upcomingEvents[0]));
	await page.goto('/events/WEVENTCASA');
	await shot(page, '06-event-detail');
});

test('record a donation', async ({ page }) => {
	await seedAuth(page, { userId: 'user-1' });
	await mockJson(page, '**/api/user/check-profile', profileCompleteResponse(true));
	await mockJson(page, '**/api/user/profile', fullProfileResponse());
	await mockJson(page, '**/api/donation/canDonate', { canDonate: true });
	await page.goto('/donate');
	await shot(page, '07-donate');
});

test('urgent request', async ({ page }) => {
	await page.goto('/emergency');
	await shot(page, '08-emergency');
});

test('admin dashboard', async ({ page }) => {
	await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
	await mockJson(page, '**/api/admin/stats', {
		totalUsers: 128,
		totalEvents: 17,
		totalDonations: 412,
		totalEmergencies: 9,
	});
	await mockJson(page, '**/api/user/profile', {
		firstname: 'Mohamed',
		lastname: 'Riad',
		gender: 'male',
	});
	await mockJson(page, '**/api/events*', eventListResponse([upcomingEvents[0]], 1));
	await mockJson(page, '**/api/unconfirmedEmergencies*', { emergencies: [], totalItems: 0 });
	await page.goto('/home');
	await shot(page, '09-admin-dashboard');
});

test('admin user list', async ({ page }) => {
	await seedAuth(page, { isAdmin: true, userId: 'admin-1' });
	await mockJson(page, '**/api/users*', {
		users: [
			sampleUser({
				_id: 'u1',
				username: 'AB123456',
				phoneNumber: '+212661234567',
				profile: { firstname: 'Amine', lastname: 'Bennani', bloodGroup: 'A+', city: 'الرباط' },
			}),
			sampleUser({
				_id: 'u2',
				username: 'CD234567',
				phoneNumber: '+212662345678',
				profile: { firstname: 'Salma', lastname: 'Idrissi', bloodGroup: 'O-', city: 'الدار البيضاء' },
			}),
			sampleUser({
				_id: 'u3',
				username: 'EF345678',
				phoneNumber: '+212663456789',
				profile: { firstname: 'Youssef', lastname: 'Alaoui', bloodGroup: 'B+', city: 'أكادير' },
			}),
		],
		totalItems: 3,
	});
	await page.goto('/users');
	await shot(page, '10-admin-users');
});

test('profile', async ({ page }) => {
	await seedAuth(page, { userId: 'user-1' });
	await mockJson(page, '**/api/user/profile', fullProfileResponse());
	await mockJson(page, '**/api/user/check-profile', profileCompleteResponse(true));
	await page.goto('/profile');
	await shot(page, '11-profile');
});
