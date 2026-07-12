import { existsSync } from 'fs';
import { defineConfig, devices } from '@playwright/test';

// This sandbox pre-installs Chromium outside Playwright's normal cache dir
// and skips `playwright install`; a normal machine/CI running
// `npx playwright install` won't have this path, so only use it when present.
const sandboxChromium = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: 4,
	reporter: [['list'], ['json', { outputFile: 'playwright-report/results.json' }]],
	use: {
		baseURL: 'http://localhost:4200',
		trace: 'retain-on-failure',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'mobile',
			// App.tsx gates the entire UI behind a mobile-viewport check
			// (UnsupportedPage otherwise) -- see e2e/mobile-gate.spec.ts.
			use: { ...devices['Pixel 7'], launchOptions: { executablePath } },
		},
	],
	webServer: {
		command: 'npm run dev -- --port 4200 --strictPort',
		url: 'http://localhost:4200',
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});
