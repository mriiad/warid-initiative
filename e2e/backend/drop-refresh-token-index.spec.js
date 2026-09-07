jest.mock('../../src/models/user', () =>
	require('./support/mongooseMock').makeModelMock()
);

const User = require('../../src/models/user');
const {
	dropRefreshTokenIndex,
	INDEX_NAME,
} = require('../../src/scripts/drop-refresh-token-index');

// The deployed refreshToken_1 index is unique without being sparse, so
// MongoDB indexes a missing field as null and at most one user document may
// lack a refresh token. Logout leaves a user in exactly that state, so once
// logout began clearing the token (#404) the second logout failed with a
// duplicate-key error and signup failed after it. See issue #437.
describe('dropRefreshTokenIndex', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		User.collection = {
			indexes: jest.fn(),
			dropIndex: jest.fn().mockResolvedValue(undefined),
		};
	});

	it('drops the index and reports what it used to enforce', async () => {
		User.collection.indexes.mockResolvedValue([
			{ name: '_id_', key: { _id: 1 } },
			{ name: INDEX_NAME, key: { refreshToken: 1 }, unique: true },
		]);

		const result = await dropRefreshTokenIndex();

		expect(User.collection.dropIndex).toHaveBeenCalledWith(INDEX_NAME);
		expect(result.dropped).toBe(true);
		// Recorded so the run's output says whether the index really was the
		// non-sparse one this migration exists for.
		expect(result.previousOptions).toEqual({ unique: true, sparse: undefined });
	});

	// Re-running a migration must be uneventful, and it has to be safe to run
	// against a database that never had the index.
	it('does nothing when the index is not there', async () => {
		User.collection.indexes.mockResolvedValue([{ name: '_id_', key: { _id: 1 } }]);

		const result = await dropRefreshTokenIndex();

		expect(User.collection.dropIndex).not.toHaveBeenCalled();
		expect(result).toEqual({ dropped: false, reason: 'not-present' });
	});

	it('leaves every other index alone', async () => {
		User.collection.indexes.mockResolvedValue([
			{ name: '_id_', key: { _id: 1 } },
			{ name: 'email_1', key: { email: 1 }, unique: true },
			{ name: 'confirmationCode_1', key: { confirmationCode: 1 }, unique: true, sparse: true },
			{ name: INDEX_NAME, key: { refreshToken: 1 }, unique: true },
		]);

		await dropRefreshTokenIndex();

		expect(User.collection.dropIndex).toHaveBeenCalledTimes(1);
		expect(User.collection.dropIndex).toHaveBeenCalledWith(INDEX_NAME);
	});
});

describe('User.refreshToken schema', () => {
	const RealUser = jest.requireActual('../../src/models/user');

	it('no longer declares a unique index', () => {
		const declared = RealUser.schema
			.indexes()
			.filter(([keys]) => Object.keys(keys).includes('refreshToken'));
		expect(declared).toEqual([]);
	});

	// The field itself has to stay: it is the one piece of server-side session
	// state, and what logout revokes.
	it('still stores the token, and still keeps it out of query results', () => {
		const path = RealUser.schema.path('refreshToken');
		expect(path).toBeDefined();
		expect(path.options.select).toBe(false);
	});
});
