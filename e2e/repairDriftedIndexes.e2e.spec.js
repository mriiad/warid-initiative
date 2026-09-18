const mongoose = require('mongoose');

// Required for its side effect: registering the User model on the connection.
// repairDriftedIndexes walks connection.modelNames(), so without this there is
// no schema to compare the database against and every test here would pass by
// finding nothing to do.
require('../src/models/user');
const { repairDriftedIndexes, verifyIndexes } = require('../src/utils/verifyIndexes');

/**
 * Against a real mongod, not a mock.
 *
 * #437 found a schema declaring `unique: true, sparse: true` over a database
 * holding a plain unique index, and #447 made the *retirement* of an index no
 * schema declares self-healing. Neither fixed the case where the schema still
 * declares the index and the database simply has it wrong: verifyIndexes only
 * logged that, so the repair depended on somebody running a command.
 *
 * User.confirmationCode carries exactly the declaration refreshToken had, and
 * verifyUser clears it on activation -- so a drifted confirmationCode_1 makes
 * the second account activation fail with a duplicate key on null. These
 * tests reproduce that and prove a restart repairs it.
 */
const usersCollection = () => mongoose.connection.db.collection('users');

const makeUser = (username, extra = {}) => ({
	username,
	email: `${username}@test.com`,
	password: 'hashed',
	phoneNumber: '+212600000000',
	gender: 'male',
	isAdmin: false,
	isActive: true,
	...extra,
});

const indexNamed = async (name) =>
	(await usersCollection().indexes()).find((index) => index.name === name);

// The index as a drifted database has it: unique, and NOT sparse.
const createDriftedIndex = () =>
	usersCollection().createIndex(
		{ confirmationCode: 1 },
		{ unique: true, name: 'confirmationCode_1' }
	);

describe('E2E: repairing a drifted index', () => {
	afterEach(async () => {
		const existing = await usersCollection().indexes();
		for (const index of existing) {
			if (index.name !== '_id_') {
				await usersCollection().dropIndex(index.name);
			}
		}
	});

	it('reproduces the outage: a second activated account collides on the cleared code', async () => {
		await createDriftedIndex();

		// Two users activate, which clears the field on both.
		await usersCollection().insertOne(makeUser('first'));

		let error = null;
		try {
			await usersCollection().insertOne(makeUser('second'));
		} catch (err) {
			error = err;
		}

		expect(error).not.toBeNull();
		expect(error.code).toBe(11000);
		expect(JSON.stringify(error.keyPattern)).toContain('confirmationCode');
	});

	it('verifyIndexes reports the drift but does not touch it', async () => {
		await createDriftedIndex();

		const problems = await verifyIndexes(mongoose.connection);
		const found = problems.find((p) => p.index === 'confirmationCode_1');

		expect(found).toBeDefined();
		expect(found.declared).toEqual({ unique: true, sparse: true });
		expect(found.actual).toEqual({ unique: true });

		// Still wrong: reporting is not repairing.
		const after = await indexNamed('confirmationCode_1');
		expect(after.sparse).toBeUndefined();
	});

	it('rebuilds it to match the schema', async () => {
		await createDriftedIndex();

		const repaired = await repairDriftedIndexes(mongoose.connection);

		expect(repaired).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ model: 'User', index: 'confirmationCode_1' }),
			])
		);

		const after = await indexNamed('confirmationCode_1');
		expect(after.unique).toBe(true);
		expect(after.sparse).toBe(true);
	});

	it('ends the outage: several activated accounts coexist afterwards', async () => {
		await createDriftedIndex();
		await repairDriftedIndexes(mongoose.connection);

		await usersCollection().insertOne(makeUser('first'));
		await usersCollection().insertOne(makeUser('second'));
		await usersCollection().insertOne(makeUser('third'));

		expect(await usersCollection().countDocuments()).toBe(3);
	});

	it('still refuses two accounts sharing a real confirmation code', async () => {
		// The repair must not weaken the guarantee: uniqueness has to hold for
		// documents that do have a value, which is the whole point of the index.
		await createDriftedIndex();
		await repairDriftedIndexes(mongoose.connection);

		await usersCollection().insertOne(makeUser('first', { confirmationCode: 'abc123' }));

		let error = null;
		try {
			await usersCollection().insertOne(makeUser('second', { confirmationCode: 'abc123' }));
		} catch (err) {
			error = err;
		}

		expect(error).not.toBeNull();
		expect(error.code).toBe(11000);
	});

	it('is idempotent, and a no-op on a database that is already correct', async () => {
		await usersCollection().createIndex(
			{ confirmationCode: 1 },
			{ unique: true, sparse: true, name: 'confirmationCode_1' }
		);

		const first = await repairDriftedIndexes(mongoose.connection);
		const second = await repairDriftedIndexes(mongoose.connection);

		expect(first).toEqual([]);
		expect(second).toEqual([]);

		const after = await indexNamed('confirmationCode_1');
		expect(after.sparse).toBe(true);
	});

	it('leaves an index no schema declares alone', async () => {
		// Someone adds an index by hand for a slow query. It is not drift, and
		// repairing must never be an excuse to remove it -- that is the line
		// syncIndexes() crosses and this deliberately does not.
		await usersCollection().createIndex({ gender: 1 }, { name: 'gender_1' });

		await repairDriftedIndexes(mongoose.connection);

		expect(await indexNamed('gender_1')).toBeDefined();
	});

	it('restores the previous index when the schema version cannot be built', async () => {
		// A unique index cannot build over existing duplicates. The rebuild
		// fails, and the collection must be left as guarded as it was rather
		// than with no index at all.
		await usersCollection().createIndex(
			{ username: 1 },
			{ name: 'username_1', unique: true, sparse: true }
		);
		// The schema declares username unique and NOT sparse, so this is drift.
		await usersCollection().insertOne(makeUser('alice'));
		await usersCollection().insertOne({ email: 'nobody@test.com', password: 'x' });
		await usersCollection().insertOne({ email: 'nobody2@test.com', password: 'x' });

		await repairDriftedIndexes(mongoose.connection);

		// Two documents without a username make the non-sparse rebuild
		// impossible, so the sparse one must still be there.
		const after = await indexNamed('username_1');
		expect(after).toBeDefined();
		expect(after.unique).toBe(true);
	});

	it('never throws, whatever it finds', async () => {
		await createDriftedIndex();
		await expect(repairDriftedIndexes(mongoose.connection)).resolves.toBeDefined();
	});
});
