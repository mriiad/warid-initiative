// Every part of the assembled URI has a production default, and `.mongodb.net`
// is baked into it -- so a destructive migration could neither be pointed at a
// local database nor prevented from silently reaching the live one. See #441.
const DB_VARS = ['DB_URI', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SAMPLE'];

const loadConfig = (env) => {
	const saved = {};
	DB_VARS.forEach((name) => {
		saved[name] = process.env[name];
		delete process.env[name];
	});
	Object.entries(env).forEach(([name, value]) => {
		process.env[name] = value;
	});

	jest.resetModules();
	const config = require('../../src/utils/config');

	DB_VARS.forEach((name) => {
		if (saved[name] === undefined) delete process.env[name];
		else process.env[name] = saved[name];
	});
	return config;
};

describe('getDatabaseUri', () => {
	it('uses DB_URI verbatim when it is set, so a local database is reachable', () => {
		const config = loadConfig({ DB_URI: 'mongodb://localhost:27017/warid' });
		expect(config.getDatabaseUri()).toBe('mongodb://localhost:27017/warid');
	});

	it('falls back to the assembled Atlas string when DB_URI is absent', () => {
		const config = loadConfig({
			DB_HOST: 'mongodb+srv',
			DB_NAME: 'stagingdb',
			DB_USER: 'someone',
			DB_PASSWORD: 'pw',
			DB_SAMPLE: 'abc123',
		});
		expect(config.getDatabaseUri()).toBe(
			'mongodb+srv://someone:pw@stagingdb.abc123.mongodb.net/stagingdb?retryWrites=true&w=majority'
		);
	});
});

describe('describeDatabaseTarget', () => {
	// This gets printed, so it must never carry the password.
	it('never includes the password from an assembled URI', () => {
		const config = loadConfig({
			DB_HOST: 'mongodb+srv',
			DB_NAME: 'warid',
			DB_USER: 'someone',
			DB_PASSWORD: 'hunter2',
			DB_SAMPLE: 'abc123',
		});
		const target = config.describeDatabaseTarget();
		expect(target).not.toContain('hunter2');
		expect(target).toContain('warid.abc123.mongodb.net');
	});

	it('strips credentials out of a DB_URI too', () => {
		const config = loadConfig({
			DB_URI: 'mongodb://alice:hunter2@cluster.example.com:27017/warid',
		});
		const target = config.describeDatabaseTarget();
		expect(target).not.toContain('hunter2');
		expect(target).not.toContain('alice');
		expect(target).toBe('mongodb://cluster.example.com:27017/warid');
	});

	it('says enough to tell production from a local database', () => {
		expect(loadConfig({ DB_URI: 'mongodb://localhost:27017/warid' }).describeDatabaseTarget())
			.toContain('localhost');
	});
});

describe('assertExplicitDatabaseTarget', () => {
	// The case the guard exists for: a developer with only DB_PASSWORD set,
	// intending a local dry run, would otherwise connect to the live cluster.
	it('refuses when only the password is set, naming what is missing', () => {
		const config = loadConfig({ DB_PASSWORD: 'pw' });
		const problems = config.assertExplicitDatabaseTarget();

		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('DB_HOST');
		expect(problems[0]).toContain('DB_NAME');
		expect(problems[0]).toContain('DB_USER');
		expect(problems[0]).toContain('DB_SAMPLE');
		// And says why it matters.
		expect(problems[0]).toContain('production');
	});

	it('refuses when nothing at all is set', () => {
		expect(loadConfig({}).assertExplicitDatabaseTarget()).toHaveLength(1);
	});

	it('accepts DB_URI on its own', () => {
		const config = loadConfig({ DB_URI: 'mongodb://localhost:27017/warid' });
		expect(config.assertExplicitDatabaseTarget()).toEqual([]);
	});

	it('accepts a fully specified DB_* set', () => {
		const config = loadConfig({
			DB_HOST: 'mongodb+srv',
			DB_NAME: 'warid',
			DB_USER: 'someone',
			DB_PASSWORD: 'pw',
			DB_SAMPLE: 'abc123',
		});
		expect(config.assertExplicitDatabaseTarget()).toEqual([]);
	});

	// A partially specified set is the mistyped-variable case: DB_NAME absent
	// silently means 'warid', which is exactly what must not pass.
	it('refuses a partially specified set rather than filling the gaps in', () => {
		const config = loadConfig({
			DB_HOST: 'mongodb+srv',
			DB_USER: 'someone',
			DB_PASSWORD: 'pw',
			DB_SAMPLE: 'abc123',
		});
		const problems = config.assertExplicitDatabaseTarget();
		expect(problems).toHaveLength(1);
		expect(problems[0]).toContain('DB_NAME');
	});
});
