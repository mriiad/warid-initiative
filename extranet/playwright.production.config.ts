import { existsSync } from 'fs';
import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against the *built* bundle rather than the dev server.
 *
 * playwright.config.ts starts `vite dev`, which serves unbundled ES modules --
 * chunk splitting, minification and the module preload graph only exist in
 * `vite build` output, so a bundle that throws on load passes that suite
 * cleanly. This config builds and serves the real thing.
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
		command: 'npm run build && npx vite preview --port 4300 --strictPort',
		url: 'http://localhost:4300',
		reuseExistingServer: false,
		timeout: 180_000,
	},
});
