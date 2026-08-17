/**
 * The limiters are disabled under NODE_ENV=test so the rest of the suite can
 * hammer these same routes freely. This spec turns them on explicitly and
 * re-requires the app, mirroring how contact.spec.js exercises EMAIL_ENABLED.
 */
const request = require('supertest');

describe('rate limiting on public endpoints', () => {
	let app;
	let User;
	let resolveTo;

	beforeEach(() => {
		jest.resetModules();
		process.env.RATE_LIMIT_ENABLED = 'true';
		process.env.RATE_LIMIT_AUTH_MAX = '3';
		process.env.RATE_LIMIT_MAIL_MAX = '2';
		process.env.RATE_LIMIT_PUBLIC_WRITE_MAX = '3';

		jest.doMock('../../src/models/user', () =>
			require('./support/mongooseMock').makeModelMock()
		);
		jest.doMock('../../src/models/emergency', () =>
			require('./support/mongooseMock').makeModelMock()
		);

		({ resolveTo } = require('./support/mongooseMock'));
		User = require('../../src/models/user');
		app = require('./support/testApp').buildApp();
	});

	afterEach(() => {
		delete process.env.RATE_LIMIT_ENABLED;
		delete process.env.RATE_LIMIT_AUTH_MAX;
		delete process.env.RATE_LIMIT_MAIL_MAX;
		delete process.env.RATE_LIMIT_PUBLIC_WRITE_MAX;
	});

	it('blocks credential brute-force on login once the limit is reached', async () => {
		User.findOne.mockReturnValue(resolveTo(null));

		const attempt = () =>
			request(app)
				.post('/api/auth/login')
				.send({ username: 'victim', password: 'guess' });

		// Under the limit the request is processed normally (401 here, since
		// the user doesn't exist) rather than being rejected by the limiter.
		for (let i = 0; i < 3; i++) {
			const res = await attempt();
			expect(res.status).not.toBe(429);
		}

		const blocked = await attempt();
		expect(blocked.status).toBe(429);
		expect(blocked.body.message).toMatch(/too many requests/i);
	});

	it('applies a tighter limit to the mail-sending reset endpoint', async () => {
		User.findOne.mockReturnValue(resolveTo(null));

		const attempt = () =>
			request(app).post('/api/auth/request-reset').send({ email: 'a@example.com' });

		for (let i = 0; i < 2; i++) {
			expect((await attempt()).status).not.toBe(429);
		}
		expect((await attempt()).status).toBe(429);
	});

	it('rate limits the public contact form, which also sends mail', async () => {
		const attempt = () =>
			request(app).post('/api/contact-us').send({
				firstname: 'Jane',
				lastname: 'Doe',
				email: 'jane@example.com',
				phoneNumber: '0600000000',
				subject: 'Question',
				message: 'Hello',
			});

		for (let i = 0; i < 2; i++) {
			expect((await attempt()).status).not.toBe(429);
		}
		expect((await attempt()).status).toBe(429);
	});

	it('rate limits public emergency creation', async () => {
		const attempt = () =>
			request(app)
				.post('/api/emergency')
				.send({ bloodGroup: 'O+', city: 'Casablanca', phoneNumber: '0600000000' });

		for (let i = 0; i < 3; i++) {
			expect((await attempt()).status).not.toBe(429);
		}
		expect((await attempt()).status).toBe(429);
	});

	it('does not rate limit authenticated read routes', async () => {
		// Only the public surface is limited; an admin paging through the
		// users list must not trip an anti-abuse control.
		const { authHeader } = require('./support/jwtHelper');
		const ADMIN_ID = '507f1f77bcf86cd799439099';
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		User.find.mockReturnValue(resolveTo([]));
		User.countDocuments.mockReturnValue(resolveTo(0));

		for (let i = 0; i < 8; i++) {
			const res = await request(app)
				.get('/api/users?page=1')
				.set('Authorization', authHeader(ADMIN_ID));
			expect(res.status).not.toBe(429);
		}
	});

	it('is inert when rate limiting is disabled', async () => {
		jest.resetModules();
		process.env.RATE_LIMIT_ENABLED = 'false';
		jest.doMock('../../src/models/user', () =>
			require('./support/mongooseMock').makeModelMock()
		);
		const freshMock = require('./support/mongooseMock');
		const FreshUser = require('../../src/models/user');
		FreshUser.findOne.mockReturnValue(freshMock.resolveTo(null));
		const freshApp = require('./support/testApp').buildApp();

		for (let i = 0; i < 8; i++) {
			const res = await request(freshApp)
				.post('/api/auth/login')
				.send({ username: 'victim', password: 'guess' });
			expect(res.status).not.toBe(429);
		}
	});
});
