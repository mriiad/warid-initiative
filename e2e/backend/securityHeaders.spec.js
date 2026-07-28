/**
 * The browser-facing half of this is in extranet/e2e-production, which loads
 * the real bundle behind these headers and fails on any CSP violation. This
 * spec pins the header values themselves, including the two that are wrong by
 * default for this deployment: HSTS before TLS, and upgrade-insecure-requests.
 */
const request = require('supertest');

const { buildApp } = require('./support/testApp');

const parseCsp = (header) =>
	Object.fromEntries(
		header
			.split(';')
			.map((directive) => directive.trim())
			.filter(Boolean)
			.map((directive) => {
				const [name, ...values] = directive.split(/\s+/);
				return [name, values];
			})
	);

describe('security headers', () => {
	let app;

	beforeEach(() => {
		app = buildApp();
	});

	// A route that returns 200 without touching auth or the database. It has to
	// be a real response: Express's finalhandler writes its own
	// `default-src 'none'` policy onto the built-in 404 page, replacing
	// helmet's, so asserting against a missing route would test nothing.
	const getHeaders = async () => (await request(app).get('/api-docs.json')).headers;

	it('sends a Content-Security-Policy that locks scripts to the app origin', async () => {
		const csp = parseCsp((await getHeaders())['content-security-policy']);

		expect(csp['default-src']).toEqual(["'self'"]);
		expect(csp['script-src']).toEqual(["'self'"]);
		expect(csp['object-src']).toEqual(["'none'"]);
		expect(csp['base-uri']).toEqual(["'self'"]);
		expect(csp['form-action']).toEqual(["'self'"]);
		expect(csp['connect-src']).toEqual(["'self'"]);
	});

	it('refuses to be framed at all rather than only cross-origin', async () => {
		// helmet's default is frame-ancestors 'self'; nothing here is meant
		// to be framed, including by the app itself.
		const csp = parseCsp((await getHeaders())['content-security-policy']);
		expect(csp['frame-ancestors']).toEqual(["'none'"]);
	});

	it('allows exactly what the frontend needs and nothing wider', async () => {
		const csp = parseCsp((await getHeaders())['content-security-policy']);

		// QR codes (QRCode.toDataURL) and base64 event photos.
		expect(csp['img-src']).toContain('data:');
		// MUI/emotion inject <style> elements at runtime.
		expect(csp['style-src']).toContain("'unsafe-inline'");
		// The one external origin index.html loads.
		expect(csp['style-src']).toContain('https://fonts.cdnfonts.com');
		expect(csp['font-src']).toContain('https://fonts.cdnfonts.com');

		// helmet's defaults end style-src and font-src with a blanket `https:`,
		// which allows those resources from any HTTPS origin.
		expect(csp['style-src']).not.toContain('https:');
		expect(csp['font-src']).not.toContain('https:');
		// Scripts must never gain an inline escape hatch.
		expect(csp['script-src']).not.toContain("'unsafe-inline'");
		expect(csp['script-src']).not.toContain("'unsafe-eval'");
	});

	it('omits upgrade-insecure-requests, which breaks a plain-HTTP deployment', async () => {
		const headers = await getHeaders();
		expect(headers['content-security-policy']).not.toContain(
			'upgrade-insecure-requests'
		);
	});

	it('sets the supporting headers helmet provides', async () => {
		const headers = await getHeaders();

		expect(headers['x-content-type-options']).toBe('nosniff');
		expect(headers['referrer-policy']).toBe('no-referrer');
		expect(headers['x-frame-options']).toBe('SAMEORIGIN');
		expect(headers['cross-origin-opener-policy']).toBe('same-origin');
		// Express advertises itself by default, which names the stack to scan for.
		expect(headers['x-powered-by']).toBeUndefined();
	});

	describe('HSTS', () => {
		afterEach(() => {
			delete process.env.HSTS_ENABLED;
			jest.resetModules();
		});

		it('is off by default, since the deployment still answers on plain HTTP', async () => {
			const headers = await getHeaders();
			expect(headers['strict-transport-security']).toBeUndefined();
		});

		it('is sent for a year once explicitly enabled', async () => {
			jest.resetModules();
			process.env.HSTS_ENABLED = 'true';
			const freshApp = require('./support/testApp').buildApp();

			const res = await request(freshApp).get('/api-docs.json');
			expect(res.headers['strict-transport-security']).toBe(
				'max-age=31536000; includeSubDomains'
			);
		});
	});
});
