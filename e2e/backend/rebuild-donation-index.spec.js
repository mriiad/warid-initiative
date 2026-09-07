jest.mock('../../src/models/donation', () =>
	require('./support/mongooseMock').makeModelMock()
);

const Donation = require('../../src/models/donation');
const {
	rebuildDonationIndex,
	INDEX_NAME,
} = require('../../src/scripts/rebuild-donation-index');

const PARTIAL = { userId: { $exists: true } };

// The index added in #405 is plain unique, while userId is optional because
// deleteUser anonymises a deleted donor's donations by unsetting it (#406).
// A plain index records a missing field as null, so two anonymised donations
// sharing a donationDate collide -- which is the ordinary case at a blood
// drive. See issue #439.
describe('rebuildDonationIndex', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Donation.collection = {
			indexes: jest.fn(),
			dropIndex: jest.fn().mockResolvedValue(undefined),
			createIndex: jest.fn().mockResolvedValue(INDEX_NAME),
		};
		Donation.aggregate = jest.fn().mockResolvedValue([]);
	});

	it('replaces a plain unique index with a partial one', async () => {
		Donation.collection.indexes.mockResolvedValue([
			{ name: '_id_', key: { _id: 1 } },
			{ name: INDEX_NAME, key: { userId: 1, donationDate: 1 }, unique: true },
		]);

		const result = await rebuildDonationIndex();

		expect(Donation.collection.dropIndex).toHaveBeenCalledWith(INDEX_NAME);
		expect(Donation.collection.createIndex).toHaveBeenCalledWith(
			{ userId: 1, donationDate: 1 },
			{ unique: true, partialFilterExpression: PARTIAL }
		);
		expect(result).toEqual({ changed: true, droppedOld: true });
	});

	it('creates the index when it is missing entirely', async () => {
		Donation.collection.indexes.mockResolvedValue([{ name: '_id_', key: { _id: 1 } }]);

		const result = await rebuildDonationIndex();

		expect(Donation.collection.dropIndex).not.toHaveBeenCalled();
		expect(Donation.collection.createIndex).toHaveBeenCalled();
		expect(result).toEqual({ changed: true, droppedOld: false });
	});

	// Re-running a migration has to be uneventful.
	it('does nothing when the index is already partial', async () => {
		Donation.collection.indexes.mockResolvedValue([
			{
				name: INDEX_NAME,
				key: { userId: 1, donationDate: 1 },
				unique: true,
				partialFilterExpression: PARTIAL,
			},
		]);

		const result = await rebuildDonationIndex();

		expect(Donation.collection.dropIndex).not.toHaveBeenCalled();
		expect(Donation.collection.createIndex).not.toHaveBeenCalled();
		expect(result).toEqual({ changed: false, reason: 'already-partial' });
	});

	// A unique index cannot build over existing duplicates, and Mongoose logs
	// that failure without surfacing it. Refusing loudly beats dropping the
	// old index and silently ending up with no constraint at all.
	it('refuses to drop the old index while duplicates would block the new one', async () => {
		Donation.collection.indexes.mockResolvedValue([
			{ name: INDEX_NAME, key: { userId: 1, donationDate: 1 }, unique: true },
		]);
		Donation.aggregate.mockResolvedValue([
			{ _id: { userId: 'u1', donationDate: '2026-03-01' }, count: 2, ids: ['d1', 'd2'] },
		]);

		const result = await rebuildDonationIndex();

		expect(Donation.collection.dropIndex).not.toHaveBeenCalled();
		expect(Donation.collection.createIndex).not.toHaveBeenCalled();
		expect(result.reason).toBe('duplicates-present');
		expect(result.duplicates).toHaveLength(1);
	});

	// Anonymised rows are exactly what must not block the rebuild.
	it('does not count anonymised donations as duplicates', async () => {
		Donation.collection.indexes.mockResolvedValue([
			{ name: INDEX_NAME, key: { userId: 1, donationDate: 1 }, unique: true },
		]);

		await rebuildDonationIndex();

		const [[pipeline]] = Donation.aggregate.mock.calls;
		expect(pipeline[0].$match).toEqual({ userId: { $exists: true, $ne: null } });
	});
});

describe('Donation index declaration', () => {
	const RealDonation = jest.requireActual('../../src/models/donation');

	it('is partial, so anonymised donations cannot collide with each other', () => {
		const [[keys, options]] = RealDonation.schema.indexes();

		expect(keys).toEqual({ userId: 1, donationDate: 1 });
		expect(options.unique).toBe(true);
		expect(options.partialFilterExpression).toEqual(PARTIAL);
	});

	// sparse would not work here and must not be reintroduced as a "fix": on a
	// compound index it only skips documents missing *every* indexed field,
	// and donationDate is required, so nothing would ever be skipped.
	it('does not rely on sparse, which cannot help a compound index', () => {
		const [[, options]] = RealDonation.schema.indexes();
		expect(options.sparse).toBeUndefined();
	});
});
