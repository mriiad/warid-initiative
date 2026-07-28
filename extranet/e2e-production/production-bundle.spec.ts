import { readFileSync, readdirSync } from 'fs';
import path from 'path';

import { test, expect } from '@playwright/test';

/**
 * The rest of the E2E suite runs against the Vite dev server, which serves
 * unbundled ES modules with none of Express's headers. Chunk splitting only
 * happens in `vite build`, so nothing there was ever exercised against what
 * actually ships -- a bundle that threw on load still passed every check,
 * because `npm run build` verifies the build compiles, not that it runs.
 *
 * These tests run against the built output served by the project's own Express
 * SPA server, which is how production serves it: real chunks, real security
 * headers.
 */

const ASSETS_DIR = path.join(__dirname, '..', 'build', 'assets');

test.describe('production bundle', () => {
	test('boots and renders the landing page', async ({ page }) => {
		const pageErrors: string[] = [];
		page.on('pageerror', (error) => pageErrors.push(String(error)));

		await page.goto('/home');

		// A bundle that throws while evaluating leaves #root empty and the
		// user staring at a white screen, with a 200 on every asset.
		await expect(page.locator('#root')).not.toBeEmpty();
		await expect(page.locator('body')).not.toContainText('Cannot GET');
		expect(await page.locator('body').innerText()).not.toHaveLength(0);

		expect(pageErrors).toEqual([]);
	});

	test('navigates between routes without a chunk-load failure', async ({ page }) => {
		// Route screens are lazy chunks; a broken split can load the entry
		// fine and only fail once a route chunk is fetched.
		const pageErrors: string[] = [];
		page.on('pageerror', (error) => pageErrors.push(String(error)));

		await page.goto('/home');
		await expect(page.locator('#root')).not.toBeEmpty();

		await page.goto('/login');
		await expect(page.locator('#root')).not.toBeEmpty();

		expect(pageErrors).toEqual([]);
	});

	test('renders the real bundle without tripping the Content-Security-Policy', async ({
		page,
	}) => {
		// A CSP that blocks a stylesheet, font or image doesn't throw -- the
		// page just comes out wrong -- so listen for the violation event the
		// browser fires instead of inferring it from the rendering.
		await page.addInitScript(() => {
			(window as unknown as { __cspViolations: string[] }).__cspViolations = [];
			document.addEventListener('securitypolicyviolation', (event) => {
				(window as unknown as { __cspViolations: string[] }).__cspViolations.push(
					`${event.violatedDirective} blocked ${event.blockedURI}`
				);
			});
		});

		await page.goto('/home');
		await expect(page.locator('#root')).not.toBeEmpty();

		const violations = await page.evaluate(
			() => (window as unknown as { __cspViolations: string[] }).__cspViolations
		);
		expect(violations).toEqual([]);
	});

	test('serves the security headers on the document', async ({ request }) => {
		const response = await request.get('/home');
		const headers = response.headers();

		const csp = headers['content-security-policy'];
		expect(csp).toBeTruthy();
		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("script-src 'self'");
		expect(csp).toContain("object-src 'none'");
		expect(csp).toContain("frame-ancestors 'none'");
		// Would rewrite asset URLs to https:// on a plain-HTTP deployment.
		expect(csp).not.toContain('upgrade-insecure-requests');

		expect(headers['x-content-type-options']).toBe('nosniff');
		expect(headers['referrer-policy']).toBe('no-referrer');

		// HSTS is opt-in; sending it before TLS is terminated in front pins
		// browsers to a scheme the server doesn't answer on.
		expect(headers['strict-transport-security']).toBeUndefined();
	});

	test('emits no circular imports between vendor chunks', async () => {
		// Two chunks that import each other form an ES module cycle, and one
		// side then runs before the other's bindings are initialised. This is
		// the precise failure the assertions above surface as a blank page;
		// checking it directly says *why*.
		const chunks = readdirSync(ASSETS_DIR).filter((file) => file.endsWith('.js'));
		const importsOf = new Map<string, string[]>(
			chunks.map((chunk) => {
				const source = readFileSync(path.join(ASSETS_DIR, chunk), 'utf8');
				const matches = source.matchAll(/from\s*"\.\/([^"]+\.js)"/g);
				return [chunk, [...matches].map((match) => match[1])];
			})
		);

		const cycles: string[] = [];
		for (const [chunk, imported] of importsOf) {
			for (const dependency of imported) {
				if (importsOf.get(dependency)?.includes(chunk)) {
					cycles.push([chunk, dependency].sort().join(' <-> '));
				}
			}
		}

		expect([...new Set(cycles)]).toEqual([]);
	});
});
