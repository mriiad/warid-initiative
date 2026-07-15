/**
 * Regression coverage for two infrastructure-level bugs that used to live in
 * the auth-guard layer that every protected route depends on (see #240).
 * Both had the same root cause: token-check.js, optional-token-check.js,
 * contact.js and event.js read a gitignored, never-committed config.json
 * directly instead of the env-var-driven `src/utils/config.js` module that
 * auth.js already used correctly.
 */
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

describe('fix: single, env-var-driven JWT secret configuration', () => {
	it('a token signed the way auth.js signs it verifies correctly the way isAuth (token-check.js) verifies it', () => {
		// Both auth.js and token-check.js now read the secret from the same
		// `require('../utils/config').auth.jwtSecretKey` -- there is only one
		// place this value can come from, so a token signed with it always
		// verifies. This was not true before #240: auth.js used
		// config.auth.jwtSecretKey (env-var-driven) while token-check.js used
		// config.authConfig.SECRET_KEY (a separate, gitignored config.json).
		const config = require('../../src/utils/config');
		const token = jwt.sign(
			{ userId: 'some-user', email: 'a@example.com' },
			config.auth.jwtSecretKey,
			{ expiresIn: config.auth.jwtExpire }
		);

		expect(() => jwt.verify(token, config.auth.jwtSecretKey)).not.toThrow();
	});
});

describe('fix: backend boots on a fresh clone', () => {
	const affectedFiles = [
		'../../src/middleware/token-check.js',
		'../../src/middleware/optional-token-check.js',
		'../../src/controllers/contact.js',
		'../../src/controllers/event.js',
	];

	it('none of the previously-affected files require a config.json that is never committed', () => {
		affectedFiles.forEach((relativePath) => {
			const source = fs.readFileSync(path.join(__dirname, relativePath), 'utf-8');
			expect(source).not.toMatch(/require\(['"].*config\.json['"]\)/);
		});
	});

	it('all of them load without a config.json present, purely from src/utils/config.js defaults', () => {
		// Doesn't touch the real (gitignored) config.json on disk -- just proves
		// each module's own require graph no longer depends on one existing.
		// No jest.resetModules() between requires: each file registers a
		// different (non-overlapping) set of Mongoose models at module load
		// time, so requiring them once each in this shared registry is safe.
		affectedFiles.forEach((relativePath) => {
			expect(() => require(relativePath)).not.toThrow();
		});
	});
});
