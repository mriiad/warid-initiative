/**
 * The logger is silent under NODE_ENV=test so the suites can drive error paths
 * without burying real failures in stack traces. This spec sets LOG_LEVEL and
 * re-requires the app to assert on the output, the way rateLimit.spec.js does
 * with its own flag.
 *
 * Output is captured by spying on the stream the logger actually writes to,
 * rather than by replacing the logger's methods: pino-http installs its
 * serializers on a child of that logger, so swapping methods would bypass them
 * and the assertions would be testing a configuration that never ships.
 */
const request = require('supertest');

describe('structured logging', () => {
	let app;
	let logger;
	let writeSpy;
	let User;
	let resolveTo;

	/**
	 * Every log line written, parsed back from the JSON pino emitted. Other
	 * things share stdout -- dotenv prints a banner on load -- so anything that
	 * isn't a JSON object is not ours and is skipped.
	 */
	const parsed = () =>
		writeSpy.mock.calls
			.map((call) => String(call[0]).trim())
			.filter((line) => line.startsWith('{'))
			.flatMap((line) => {
				try {
					return [JSON.parse(line)];
				} catch {
					return [];
				}
			});
	const find = (predicate) => parsed().find(predicate);

	beforeEach(() => {
		jest.resetModules();
		process.env.LOG_LEVEL = 'info';

		jest.doMock('../../src/models/user', () =>
			require('./support/mongooseMock').makeModelMock()
		);

		writeSpy = jest
			.spyOn(process.stdout, 'write')
			.mockImplementation(() => true);

		({ logger } = require('../../src/utils/logger'));
		({ resolveTo } = require('./support/mongooseMock'));
		User = require('../../src/models/user');
		app = require('./support/testApp').buildApp();
	});

	afterEach(() => {
		writeSpy.mockRestore();
		delete process.env.LOG_LEVEL;
	});

	it('writes one JSON line per request with method, url and status', async () => {
		await request(app).get('/api-docs.json');

		const completed = find(
			(line) => line.req?.url === '/api-docs.json' && line.res?.statusCode === 200
		);
		expect(completed).toBeDefined();
		expect(completed.req.method).toBe('GET');
		expect(completed.level).toBe('info');
		// Present so a slow endpoint can be found without adding timing code.
		expect(completed.responseTime).toEqual(expect.any(Number));
	});

	it('logs a rejected request at warn, not error', async () => {
		// A wrong password is ordinary traffic. If it logged at error, a real
		// incident would be indistinguishable from users mistyping.
		User.findOne.mockReturnValue(resolveTo(null));

		await request(app)
			.post('/api/auth/login')
			.send({ username: 'nobody', password: 'wrong' });

		const rejected = find(
			(line) => line.req?.url === '/api/auth/login' && line.res !== undefined
		);
		expect(rejected.level).toBe('warn');
	});

	it('never writes the Authorization header to the log', async () => {
		// pino-http's default serializer logs every request header, which for
		// this app means a bearer token in plain text on every single line.
		const secret = 'Bearer super-secret-token-value';
		await request(app).get('/api-docs.json').set('Authorization', secret);

		const output = writeSpy.mock.calls.map((call) => String(call[0])).join('\n');
		expect(output).not.toContain('super-secret-token-value');
	});

	it('redacts credential-shaped fields wherever they appear', async () => {
		logger.info(
			{ user: { username: 'donor', password: 'hunter2' }, resetToken: 'abc123' },
			'manual log'
		);

		const entry = find((line) => line.msg === 'manual log');
		expect(entry.user.password).toBe('[redacted]');
		expect(entry.resetToken).toBe('[redacted]');
		// Redaction must not swallow the rest of the object.
		expect(entry.user.username).toBe('donor');
	});

	describe('request ids', () => {
		it('returns one on the response so a user can quote it in a report', async () => {
			const res = await request(app).get('/api-docs.json');
			expect(res.headers['x-request-id']).toEqual(expect.any(String));
			expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
		});

		it('keeps the id a proxy already assigned', async () => {
			const res = await request(app)
				.get('/api-docs.json')
				.set('X-Request-Id', 'trace-from-proxy');

			expect(res.headers['x-request-id']).toBe('trace-from-proxy');
			expect(find((line) => line.req?.id === 'trace-from-proxy')).toBeDefined();
		});
	});

	describe('the error handler', () => {
		/** Force a 500 from a route that is otherwise fully mocked. */
		const triggerServerError = () => {
			User.findOne.mockImplementation(() => {
				throw new Error('database exploded');
			});
			return request(app)
				.post('/api/auth/login')
				.send({ username: 'someone', password: 'whatever' });
		};

		it('records a 500 with its stack and the request that caused it', async () => {
			// Previously a 500 was answered and forgotten -- nothing recorded it,
			// so a production failure left no trace to investigate.
			await triggerServerError();

			const logged = find((line) => line.err?.message === 'database exploded');
			expect(logged).toBeDefined();
			expect(logged.level).toBe('error');
			expect(logged.statusCode).toBe(500);
			expect(logged.method).toBe('POST');
			expect(logged.url).toBe('/api/auth/login');
			expect(logged.err.stack).toContain('Error: database exploded');
		});

		it('ties the log line to the id the caller was given', async () => {
			const res = await triggerServerError();

			const logged = find((line) => line.err?.message === 'database exploded');
			expect(logged.requestId).toBe(res.headers['x-request-id']);
		});

		it('does not return the internal message to the caller', async () => {
			const res = await triggerServerError();

			expect(res.status).toBe(500);
			expect(JSON.stringify(res.body)).not.toContain('database exploded');
			expect(res.body.message).toMatch(/something went wrong/i);
		});
	});
});
