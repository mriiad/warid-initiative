// These secrets used to fall back to constants written into config.js, so a
// deployment that forgot to set them booted normally and signed every token
// with a value published in this repository -- isAuth would then accept a
// token minted for any userId. See issue #394.
const loadConfig = (env) => {
	const saved = {
		jwt: process.env.JWT_SECRET_KEY,
		refresh: process.env.REFRESH_SECRET_KEY,
	};
	if ('JWT_SECRET_KEY' in env) {
		if (env.JWT_SECRET_KEY === undefined) delete process.env.JWT_SECRET_KEY;
		else process.env.JWT_SECRET_KEY = env.JWT_SECRET_KEY;
	}
	if ('REFRESH_SECRET_KEY' in env) {
		if (env.REFRESH_SECRET_KEY === undefined) delete process.env.REFRESH_SECRET_KEY;
		else process.env.REFRESH_SECRET_KEY = env.REFRESH_SECRET_KEY;
	}
	let config;
	jest.isolateModules(() => {
		config = require('../../src/utils/config');
	});
	process.env.JWT_SECRET_KEY = saved.jwt;
	process.env.REFRESH_SECRET_KEY = saved.refresh;
	return config;
};

describe('auth secrets (issue #394)', () => {
	it('reports both secrets as missing when neither is set', () => {
		const config = loadConfig({
			JWT_SECRET_KEY: undefined,
			REFRESH_SECRET_KEY: undefined,
		});
		expect(config.assertAuthSecrets()).toEqual([
			'JWT_SECRET_KEY is not set',
			'REFRESH_SECRET_KEY is not set',
		]);
	});

	it('leaves a missing secret undefined rather than defaulting it', () => {
		// The heart of the bug: any usable fallback is a signing key an
		// attacker can read off this repository.
		const config = loadConfig({
			JWT_SECRET_KEY: undefined,
			REFRESH_SECRET_KEY: undefined,
		});
		expect(config.auth.jwtSecretKey).toBeUndefined();
		expect(config.auth.refreshSecretKey).toBeUndefined();
	});

	it('rejects the constants this repository used to ship as defaults', () => {
		const config = loadConfig({
			JWT_SECRET_KEY: 'RANDOMSECRETKEY',
			REFRESH_SECRET_KEY: 'REFRESHSECRETKEY',
		});
		const problems = config.assertAuthSecrets();
		expect(problems).toHaveLength(2);
		problems.forEach((p) => expect(p).toMatch(/once shipped as a default/));
	});

	it('passes when both secrets are set to real values', () => {
		const config = loadConfig({
			JWT_SECRET_KEY: 'a-real-secret',
			REFRESH_SECRET_KEY: 'another-real-secret',
		});
		expect(config.assertAuthSecrets()).toEqual([]);
	});

	it('no longer exposes the unused auth.secretKey entry', () => {
		// Nothing in src/ read it; the only reference left was inside a
		// commented-out block in token-check.js.
		const config = loadConfig({});
		expect(config.auth.secretKey).toBeUndefined();
	});
});
