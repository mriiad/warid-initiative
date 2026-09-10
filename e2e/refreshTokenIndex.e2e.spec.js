const mongoose = require('mongoose');
const User = require('../src/models/user');
const { dropRefreshTokenIndex, INDEX_NAME } = require('../src/scripts/drop-refresh-token-index');
const { retireIndexes } = require('../src/utils/verifyIndexes');

/**
 * Against a real mongod, not a mock.
 *
 * Everything in #437, #439 and #447 rests on one claim about MongoDB that
 * had never actually been executed anywhere in this repo: a unique index
 * that is not sparse records a *missing* field as null, so two documents
 * that both lack the field collide. It was reasoned from the documentation.
 * These tests run it.
 *
 * The first one reproduces the production failure a tester captured:
 *   { "message": "That refreshToken is already in use.", "statusCode": 409,
 *     "code": "DUPLICATE_VALUE", "params": { "field": "refreshToken" } }
 */
const usersCollection = () => mongoose.connection.db.collection('users');

const makeUser = (username) => ({
	username,
	email: `${username}@test.com`,
	password: 'hashed',
	phoneNumber: '+212600000000',
	gender: 'male',
	isAdmin: false,
	isActive: true,
});

const indexNames = async () =>
	(await usersCollection().indexes()).map((index) => index.name);

// The index as production has it: unique, and NOT sparse.
const createBrokenIndex = () =>
	usersCollection().createIndex({ refreshToken: 1 }, { unique: true, name: INDEX_NAME });

describe('E2E: the refreshToken index (issues #437, #447)', () => {
	afterEach(async () => {
		if (await indexNames().then((names) => names.includes(INDEX_NAME))) {
			await usersCollection().dropIndex(INDEX_NAME);
		}
	});

	it('reproduces the outage: a second user with no refresh token is refused', async () => {
		await createBrokenIndex();

		// One user with no refreshToken -- fine, it takes the single null slot.
		await usersCollection().insertOne(makeUser('first'));

		// A second is a duplicate key, because a non-sparse index records both
		// missing fields as null. This is signup failing in production.
		let error = null;
		try {
			await usersCollection().insertOne(makeUser('second'));
		} catch (err) {
			error = err;
		}

		expect(error).not.toBeNull();
		expect(error.code).toBe(11000);
		expect(JSON.stringify(error.keyPattern || error.keyValue)).toContain('refreshToken');
	});

	it('reproduces the other half: logging out collides once someone else is logged out', async () => {
		await createBrokenIndex();

		// Two users who are logged in, so each holds a distinct token.
		await usersCollection().insertOne({ ...makeUser('alice'), refreshToken: 'token-alice' });
		await usersCollection().insertOne({ ...makeUser('bob'), refreshToken: 'token-bob' });

		// Alice logs out: her token is unset, and she takes the null slot.
		await usersCollection().updateOne({ username: 'alice' }, { $unset: { refreshToken: 1 } });

		// Bob logs out. This is the exact write logout performs.
		let error = null;
		try {
			await usersCollection().updateOne({ username: 'bob' }, { $unset: { refreshToken: 1 } });
		} catch (err) {
			error = err;
		}

		expect(error).not.toBeNull();
		expect(error.code).toBe(11000);
	});

	it('the migration drops it, and both operations then succeed', async () => {
		await createBrokenIndex();
		expect(await indexNames()).toContain(INDEX_NAME);

		const result = await dropRefreshTokenIndex();
		expect(result.dropped).toBe(true);
		expect(await indexNames()).not.toContain(INDEX_NAME);

		// Signup: several users with no refresh token now coexist.
		await usersCollection().insertMany([makeUser('a'), makeUser('b'), makeUser('c')]);
		expect(await usersCollection().countDocuments()).toBe(3);

		// Logout: unsetting a token no longer collides with an absent one.
		await usersCollection().updateOne({ username: 'a' }, { $set: { refreshToken: 'tok' } });
		await usersCollection().updateOne({ username: 'a' }, { $unset: { refreshToken: 1 } });
		expect(await usersCollection().countDocuments({ refreshToken: { $exists: false } })).toBe(3);
	});

	it('the migration is safe to run twice, and when the index was never there', async () => {
		expect(await dropRefreshTokenIndex()).toEqual({ dropped: false, reason: 'not-present' });

		await createBrokenIndex();
		expect((await dropRefreshTokenIndex()).dropped).toBe(true);
		expect(await dropRefreshTokenIndex()).toEqual({ dropped: false, reason: 'not-present' });
	});

	// #447: the repair must not depend on someone remembering the command.
	it('startup retires the index on its own, so a deploy is enough', async () => {
		await createBrokenIndex();

		const retired = await retireIndexes(mongoose.connection);

		expect(retired).toEqual([
			expect.objectContaining({ model: 'User', index: INDEX_NAME }),
		]);
		expect(await indexNames()).not.toContain(INDEX_NAME);

		// And the outage is over: two tokenless users coexist.
		await usersCollection().insertMany([makeUser('x'), makeUser('y')]);
		expect(await usersCollection().countDocuments()).toBe(2);
	});

	it('startup retirement does nothing on a database that is already correct', async () => {
		expect(await retireIndexes(mongoose.connection)).toEqual([]);
	});

	// The indexes the schemas still declare must survive.
	it('leaves the indexes that are still in use alone', async () => {
		await User.init();
		await createBrokenIndex();

		await retireIndexes(mongoose.connection);

		const names = await indexNames();
		expect(names).toContain('username_1');
		expect(names).toContain('email_1');
		expect(names).not.toContain(INDEX_NAME);
	});
});
