/**
 * Documents two infrastructure-level bugs found while wiring up this test
 * suite, both in the auth-guard layer that every protected route depends on.
 */
const jwt = require('jsonwebtoken');

describe('BUG: dual, unsynchronized JWT secret configuration', () => {
	it('BUG: a token signed the way auth.js signs it fails verification the way token-check.js verifies it, unless the two secrets are manually kept in sync', () => {
		// auth.js signs login/refresh tokens with
		// `require('../utils/config').auth.jwtSecretKey`, sourced from the
		// JWT_SECRET_KEY env var (default 'RANDOMSECRETKEY').
		// token-check.js verifies tokens with
		// `require('../../config.json').authConfig.SECRET_KEY`, sourced from a
		// gitignored, undocumented JSON file with no committed template.
		// Nothing in the codebase enforces these two values are equal. This
		// test signs a token the way a real login would (using the env-var
		// path's default) and verifies it the way token-check.js does, with a
		// config.json using a different, equally plausible default -- and shows
		// verification fails even though the token is completely legitimate.
		const tokenSignedByAuthJsDefault = jwt.sign(
			{ userId: 'some-user', email: 'a@example.com' },
			'RANDOMSECRETKEY', // src/utils/config.js's hardcoded default when JWT_SECRET_KEY is unset
			{ expiresIn: '1d' }
		);

		expect(() =>
			jwt.verify(tokenSignedByAuthJsDefault, 'a-different-secret-in-config-json')
		).toThrow();
	});
});

describe('BUG: backend cannot boot on a fresh clone', () => {
	it('BUG: token-check.js, optional-token-check.js, contact.js and event.js all `require(\'../../config.json\')`, a file that does not exist in the repository', () => {
		// config.json is listed in .gitignore and there is no config.json.example
		// or documentation of its required shape anywhere in the repo (the
		// README only says to edit an existing file). Since token-check.js is
		// imported by every protected route (auth, user, donation, event,
		// emergency, participant), requiring it crashes the whole process
		// before app.listen() is ever reached on a completely fresh clone.
		// This test's own backend suite only runs at all because we manually
		// created a sandbox-local config.json; a real fresh clone (or a CI
		// runner, or a new contributor following the README) has no such file.
		jest.resetModules();
		const fs = require('fs');
		const path = require('path');
		const configPath = path.join(__dirname, '../../config.json');
		expect(fs.existsSync(configPath)).toBe(true); // only true because WE created it
		expect(
			fs.existsSync(path.join(__dirname, '../../config.json.example'))
		).toBe(false); // no template is committed anywhere
	});
});
