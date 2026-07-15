import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

// Regression guard for issue #239: several components called
// `http://localhost:3000` directly instead of going through
// `API_CONFIG`/`buildApiUrl` (which respects `VITE_API_URL`), so the app
// silently couldn't reach the backend anywhere but a dev machine. Scans
// every component source file for the literal string so a future PR can't
// reintroduce it without this test failing.
const COMPONENTS_DIR = path.resolve(__dirname, 'components');

const collectSourceFiles = (dir: string): string[] => {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			return collectSourceFiles(fullPath);
		}
		if (/\.(tsx?|jsx?)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) {
			return [fullPath];
		}
		return [];
	});
};

describe('no hardcoded API host in components', () => {
	it('never calls http://localhost:3000 directly -- use buildApiUrl(API_CONFIG...) instead', () => {
		const offenders = collectSourceFiles(COMPONENTS_DIR)
			.filter((file) => fs.readFileSync(file, 'utf-8').includes('http://localhost:3000'))
			.map((file) => path.relative(path.resolve(__dirname, '..'), file));

		expect(offenders).toEqual([]);
	});
});
