const { verifyIndexes } = require('../../src/utils/verifyIndexes');

// Mongoose creates missing indexes at startup but never alters one that
// already exists: MongoDB answers createIndex with an IndexOptionsConflict
// and that rejection is swallowed. So a schema can read `unique: true,
// sparse: true` while the collection holds a plain unique index, with
// nothing anywhere saying so -- which is how the refreshToken index in #437
// stayed wrong long enough to break logout and signup.
const makeConnection = (models) => ({
	modelNames: () => Object.keys(models),
	model: (name) => models[name],
});

const makeModel = (declaredIndexes, actualIndexes) => ({
	schema: { indexes: () => declaredIndexes },
	collection: {
		indexes: jest.fn().mockResolvedValue(actualIndexes),
	},
});

describe('verifyIndexes', () => {
	it('reports an index whose real options no longer match the schema', async () => {
		const problems = await verifyIndexes(
			makeConnection({
				User: makeModel(
					[[{ refreshToken: 1 }, { unique: true, sparse: true }]],
					[
						{ name: '_id_', key: { _id: 1 } },
						// What production actually had: unique, not sparse.
						{ name: 'refreshToken_1', key: { refreshToken: 1 }, unique: true },
					]
				),
			})
		);

		expect(problems).toHaveLength(1);
		expect(problems[0]).toMatchObject({
			model: 'User',
			index: 'refreshToken_1',
			declared: { unique: true, sparse: true },
			actual: { unique: true },
		});
	});

	it('stays quiet when the database matches the schema', async () => {
		const problems = await verifyIndexes(
			makeConnection({
				User: makeModel(
					[[{ confirmationCode: 1 }, { unique: true, sparse: true }]],
					[
						{ name: '_id_', key: { _id: 1 } },
						{
							name: 'confirmationCode_1',
							key: { confirmationCode: 1 },
							unique: true,
							sparse: true,
						},
					]
				),
			})
		);

		expect(problems).toEqual([]);
	});

	// `unique: false` and an absent `unique` enforce the same thing; reporting
	// that as drift would bury the real findings in noise.
	it('does not treat an explicitly false option as a difference', async () => {
		const problems = await verifyIndexes(
			makeConnection({
				Donation: makeModel(
					[[{ userId: 1, donationDate: 1 }, { unique: true, background: false }]],
					[
						{ name: '_id_', key: { _id: 1 } },
						{
							name: 'userId_1_donationDate_1',
							key: { userId: 1, donationDate: 1 },
							unique: true,
							sparse: false,
						},
					]
				),
			})
		);

		expect(problems).toEqual([]);
	});

	it('ignores the _id index, which no schema declares', async () => {
		const problems = await verifyIndexes(
			makeConnection({ Event: makeModel([], [{ name: '_id_', key: { _id: 1 } }]) })
		);
		expect(problems).toEqual([]);
	});

	// A fresh database has no collections yet; that is not drift.
	it('skips a collection that does not exist yet', async () => {
		const model = makeModel([[{ email: 1 }, { unique: true }]], []);
		const err = new Error('ns does not exist');
		err.codeName = 'NamespaceNotFound';
		model.collection.indexes.mockRejectedValue(err);

		await expect(verifyIndexes(makeConnection({ User: model }))).resolves.toEqual([]);
	});

	// An index Mongoose has not finished building yet is not a mismatch.
	it('does not report a declared index that is simply absent', async () => {
		const problems = await verifyIndexes(
			makeConnection({
				User: makeModel(
					[[{ email: 1 }, { unique: true }]],
					[{ name: '_id_', key: { _id: 1 } }]
				)
			})
		);
		expect(problems).toEqual([]);
	});

	// This runs on the startup path, so it must not be able to take the app
	// down on its own.
	it('survives a model whose indexes cannot be read at all', async () => {
		const model = makeModel([[{ email: 1 }, { unique: true }]], []);
		model.collection.indexes.mockRejectedValue(new Error('not authorized'));

		await expect(verifyIndexes(makeConnection({ User: model }))).resolves.toEqual([]);
	});
});
