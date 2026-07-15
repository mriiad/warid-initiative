const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () =>
	require('./support/mongooseMock').makeModelMock()
);

const User = require('../../src/models/user');
const {
	bootstrapFirstAdmin,
	parseUsername,
} = require('../../src/scripts/bootstrap-admin');

describe('first administrator bootstrap', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('promotes the selected registered user when no administrator exists', async () => {
		const user = {
			username: 'AB123456',
			isAdmin: false,
			save: jest.fn().mockResolvedValue(undefined),
		};
		User.exists.mockResolvedValue(false);
		User.findOne.mockReturnValue(resolveTo(user));

		const result = await bootstrapFirstAdmin('AB123456');

		expect(User.exists).toHaveBeenCalledWith({ isAdmin: true });
		expect(User.findOne).toHaveBeenCalledWith({ username: 'AB123456' });
		expect(user.isAdmin).toBe(true);
		expect(user.save).toHaveBeenCalledTimes(1);
		expect(result).toBe(user);
	});

	it('refuses to promote another user when an administrator already exists', async () => {
		User.exists.mockResolvedValue({ _id: 'existing-admin' });

		await expect(bootstrapFirstAdmin('AB123456')).rejects.toThrow(
			'administrator already exists'
		);
		expect(User.findOne).not.toHaveBeenCalled();
	});

	it('fails without changing data when the selected user does not exist', async () => {
		User.exists.mockResolvedValue(false);
		User.findOne.mockReturnValue(resolveTo(null));

		await expect(bootstrapFirstAdmin('missing-user')).rejects.toThrow(
			'No registered user found with username "missing-user".'
		);
	});
});

describe('bootstrap command arguments', () => {
	it('reads and trims the required username', () => {
		expect(parseUsername(['--username', '  AB123456  '])).toBe('AB123456');
	});

	it.each([
		{ args: [] },
		{ args: ['--username'] },
		{ args: ['--email', 'admin@example.com'] },
		{ args: ['--username', 'AB123456', '--force'] },
	])('rejects unsupported arguments: $args', ({ args }) => {
		expect(() => parseUsername(args)).toThrow(
			'Usage: npm run bootstrap:admin'
		);
	});

	it('rejects an empty username', () => {
		expect(() => parseUsername(['--username', '   '])).toThrow(
			'username must not be empty'
		);
	});
});
