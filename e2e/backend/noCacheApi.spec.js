/**
 * Express's default weak ETag makes every GET conditionally-cacheable --
 * confirmed (separately, via a real browser) to resolve to a transparent 200
 * for fetch()/XHR today, but it's still a second, uncoordinated cache
 * sitting underneath React Query's own. This pins the fix: API responses
 * carry no ETag and are never stored by the client. See
 * src/middleware/no-cache-api.js.
 */
const request = require('supertest');

jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());

const { buildApp } = require('./support/testApp');

describe('no-cache-api middleware', () => {
	let app;

	beforeEach(() => {
		app = buildApp();
	});

	it('sends Cache-Control: no-store and no ETag on an API route', async () => {
		const res = await request(app).get('/api/events');

		expect(res.headers['cache-control']).toBe('no-store');
		expect(res.headers['etag']).toBeUndefined();
	});

	it('a repeated request for the same URL never gets a conditional 304', async () => {
		const agent = request.agent(app);

		const first = await agent.get('/api/events');
		expect(first.status).toBe(200);

		// A real browser would only send this if it had stored an ETag to
		// validate -- simulated directly here since supertest has no HTTP
		// cache of its own to trigger it automatically.
		const second = await agent
			.get('/api/events')
			.set('If-None-Match', first.headers['etag'] || '"anything"');
		expect(second.status).toBe(200);
		expect(second.body).toEqual(first.body);
	});

	it('does not touch routes outside /api (e.g. the swagger docs)', async () => {
		const res = await request(app).get('/api-docs.json');

		expect(res.headers['cache-control']).not.toBe('no-store');
	});
});
