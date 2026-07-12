import { Page, Route } from '@playwright/test';

/**
 * This suite never talks to a real backend: mongodb-memory-server's binary
 * download is blocked by this sandbox's egress policy (fastdl.mongodb.org),
 * and pointing tests at the real production Atlas cluster (whose
 * credentials are hardcoded in src/utils/config.js) is out of the question.
 * Every `/api/**` call the real frontend makes is intercepted here and
 * answered with a fixture shaped exactly like the real controllers'
 * responses (verified by reading src/controllers/*.js and src/models/*.js),
 * so the app code under test is 100% real -- only the network boundary is
 * faked.
 */

export async function seedAuth(
	page: Page,
	opts: { token?: string; userId?: string; isAdmin?: boolean } = {}
) {
	const { token = 'fake-jwt-token', userId = 'user-1', isAdmin = false } = opts;
	await page.addInitScript(
		([t, u, a]) => {
			window.localStorage.setItem('token', t as string);
			window.localStorage.setItem('userId', u as string);
			window.localStorage.setItem('isAdmin', String(a));
		},
		[token, userId, isAdmin]
	);
}

export async function mockJson(
	page: Page,
	urlPattern: string | RegExp,
	body: unknown,
	options: { status?: number; method?: string } = {}
) {
	const { status = 200, method } = options;
	await page.route(urlPattern, async (route: Route) => {
		if (method && route.request().method() !== method) {
			return route.fallback();
		}
		await route.fulfill({
			status,
			contentType: 'application/json',
			body: JSON.stringify(body),
		});
	});
}

// ---- Fixtures shaped like the real backend responses ----

export const sampleEvent = (overrides: Record<string, unknown> = {}) => ({
	_id: 'evt-1',
	reference: 'WEVENT20990101',
	title: 'Collecte de sang - Casablanca',
	subtitle: 'Sous-titre',
	location: 'Casablanca',
	date: '2099-01-01T00:00:00.000Z',
	mapLink: 'https://maps.example.com',
	description: 'Description de l’événement',
	isGeneric: false,
	...overrides,
});

// GET /api/events/:reference -> { message, event }
export const eventDetailResponse = (overrides: Record<string, unknown> = {}) => ({
	message: 'Event fetched successfully.',
	event: sampleEvent(overrides),
});

// GET /api/events -> { events, totalItems }
export const eventListResponse = (events = [sampleEvent()], totalItems = events.length) => ({
	events,
	totalItems,
});

// GET /api/user/profile -> flat profile fields (no wrapper) when complete
export const fullProfileResponse = (overrides: Record<string, unknown> = {}) => ({
	firstname: 'Yassine',
	lastname: 'Alaoui',
	birthdate: '1995-05-20T00:00:00.000Z',
	gender: 'male',
	bloodGroup: 'O+',
	city: 'Casablanca',
	phoneNumber: 6123456789,
	email: 'yassine@example.com',
	...overrides,
});

// GET /api/user/profile -> only gender when profile doc doesn't exist yet
export const incompleteProfileResponse = (gender = 'male') => ({ gender });

// GET /api/user/check-profile
export const profileCompleteResponse = (isProfileComplete: boolean) => ({ isProfileComplete });

// GET /api/users/:userId/dashboard -> { stats, donations }
export const dashboardResponse = (overrides: Record<string, unknown> = {}) => ({
	stats: { total: 2, lastDonation: '01/01/2026', eligibleIn: '0 days' },
	donations: [
		{ id: 'd1', date: '01/01/2026', type: 'BLOOD', event: 'Regular Donation' },
		{ id: 'd2', date: '01/11/2025', type: 'BLOOD', event: 'Collecte de sang - Casablanca' },
	],
	...overrides,
});

export const sampleUser = (overrides: Record<string, unknown> = {}) => ({
	_id: 'user-1',
	username: 'CIN123456',
	email: 'donor@example.com',
	phoneNumber: 6123456780,
	isAdmin: false,
	gender: 'male',
	profile: { firstname: 'Amine', lastname: 'Bennani', bloodGroup: 'A+', city: 'Rabat' },
	...overrides,
});
