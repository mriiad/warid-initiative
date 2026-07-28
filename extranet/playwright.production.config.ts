import { existsSync } from 'fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against the *built* bundle, served the way production serves it.
 *
 * playwright.config.ts starts `vite dev`, which serves unbundled ES modules --
 * chunk splitting, minification and the module preload graph only exist in
 * `vite build` output, so a bundle that throws on load passes that suite
 * cleanly.
 *
 * The server here is the project's own Express SPA server rather than `vite
 * preview`, because that is what actually serves the frontend in production
 * (app.js does express.static on extranet/build) and it is the only target
 * that sends the security headers. A Content-Security-Policy that blocks a
 * stylesheet or an image is invisible to every other suite.
 *
 * Kept separate rather than added as a second project so the main suite isn't
 * made to wait on a production build on every run.
 */

// This sandbox pre-installs Chromium outside Playwright's normal cache dir
// and skips `playwright install`; a normal machine/CI running
// `npx playwright install` won't have this path, so only use it when present.
const sandboxChromium = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

export default defineConfig({
	testDir: './e2e-production',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: 1,
	reporter: [['list']],
	use: {
		baseURL: 'http://localhost:4300',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'production',
			// App.tsx gates the entire UI behind a mobile-viewport check.
			use: { ...devices['Pixel 7'], launchOptions: { executablePath } },
		},
	],
	webServer: {
		// Build here rather than relying on a stale build/ directory, so the
		// suite always tests the current source.
		command: 'npm run build && node ../e2e/backend/support/spaServer.js',
		url: 'http://localhost:4300',
		env: {
			SPA_PORT: '4300',
			// Mirror the Dockerfile, which builds with VITE_API_URL="" so the
			// SPA calls its own origin. Without it the build falls back to the
			// http://localhost:3000 default in src/config/env-config.ts and
			// every API call becomes cross-origin -- which is both wrong for
			// the shipped image and blocked by connect-src 'self'.
			VITE_API_URL: '',
		},
		reuseExistingServer: false,
		timeout: 180_000,
	},
});
