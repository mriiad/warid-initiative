/**
 * Lightweight stand-in for a Mongoose Query/Document, used because this
 * sandbox cannot reach fastdl.mongodb.org (mongodb-memory-server's binary
 * download is blocked by egress policy) and must not touch the real
 * production Atlas cluster whose credentials are hardcoded in
 * src/utils/config.js. Every controller under test is real; only the data
 * access layer (the Mongoose Model objects) is replaced.
 */

// Chainable, thenable stand-in for a Mongoose Query.
function makeQuery(resolver) {
	const query = {
		sort: () => query,
		skip: () => query,
		limit: () => query,
		select: () => query,
		populate: () => query,
		lean: () => query,
		exec: () => Promise.resolve().then(resolver),
		distinct: () => makeQuery(resolver),
		then: (onResolve, onReject) =>
			Promise.resolve().then(resolver).then(onResolve, onReject),
		catch: (onReject) => Promise.resolve().then(resolver).catch(onReject),
	};
	return query;
}

/**
 * Creates a jest-mockable stand-in for a Mongoose Model.
 * Static query methods (find, findOne, findById, ...) default to resolving
 * `undefined`/`[]`; override per-test with `Model.findOne.mockReturnValue(...)`
 * etc. `new Model(data)` returns a plain object carrying the data plus a
 * mocked `.save()` that resolves to itself by default.
 */
function makeModelMock(defaultInstanceMethods = {}) {
	const Model = jest.fn().mockImplementation(function (data) {
		Object.assign(this, data || {});
		if (this._id === undefined) {
			this._id = `mock-id-${Math.random().toString(36).slice(2, 10)}`;
		}
		this.save = jest.fn().mockResolvedValue(this);
		this.toObject = jest.fn(() => ({ ...this }));
		Object.assign(this, defaultInstanceMethods);
		return this;
	});

	Model.find = jest.fn(() => makeQuery(() => []));
	Model.findOne = jest.fn(() => makeQuery(() => null));
	Model.findById = jest.fn(() => makeQuery(() => null));
	Model.findByIdAndUpdate = jest.fn(() => makeQuery(() => null));
	Model.findByIdAndDelete = jest.fn(() => makeQuery(() => null));
	Model.findOneAndUpdate = jest.fn(() => makeQuery(() => null));
	Model.findOneAndDelete = jest.fn(() => makeQuery(() => null));
	Model.updateMany = jest.fn(() => Promise.resolve({ modifiedCount: 0 }));
	Model.deleteOne = jest.fn(() => makeQuery(() => ({ deletedCount: 0 })));
	Model.deleteMany = jest.fn(() => makeQuery(() => ({ deletedCount: 0 })));
	Model.countDocuments = jest.fn(() => makeQuery(() => 0));
	Model.exists = jest.fn(() => Promise.resolve(false));
	Model.distinct = jest.fn(() => makeQuery(() => []));
	Model.create = jest.fn(() => Promise.resolve({}));

	return Model;
}

// Resolves a query mock (e.g. Model.find) to a fixed value in one call.
function resolveTo(value) {
	return makeQuery(() => value);
}

module.exports = { makeModelMock, makeQuery, resolveTo };
