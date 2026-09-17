import { existsSync } from 'fs';
import { defineConfig, devices } from '@playwright/test';

// Regenerates docs/screenshots/ for the README. Separate from
// playwright.config.ts (whose testDir is ./e2e) so the capture run is never
// part of the test suite:
//
//   npx playwright test --config=playwright.shots.config.ts
const sandboxChromium = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

export default defineConfig({
	testDir: './e2e-shots',
	// Serial: the captures share one output directory and there is no reason
	// to contend for CPU while waiting on animations to settle.
	workers: 1,
	retries: 0,
	reporter: [['list']],
	use: { baseURL: 'http://localhost:4200' },
	projects: [
		{
			name: 'mobile',
			use: {
				...devices['Pixel 7'],
				// Pixel 7's real 2.625 device pixel ratio yields 1082px-wide
				// PNGs, several times larger than anything a README renders.
				// 1.5 keeps them sharp on a retina display at a third of the
				// bytes. The CSS viewport is unchanged, so App.tsx's mobile
				// gate still sees a phone.
				deviceScaleFactor: 1.5,
				launchOptions: { executablePath },
			},
		},
	],
	webServer: {
		command: 'npm run dev -- --port 4200 --strictPort',
		url: 'http://localhost:4200',
		reuseExistingServer: true,
		timeout: 120_000,
	},
});
