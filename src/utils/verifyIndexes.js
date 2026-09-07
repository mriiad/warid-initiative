const { logger } = require('./logger');

/**
 * Compares the indexes each schema declares against the ones the database
 * actually has, and reports the differences.
 *
 * Mongoose creates missing indexes at startup (autoIndex), but it will not
 * *alter* one that already exists under the same name with different
 * options -- MongoDB answers `createIndex` with an IndexOptionsConflict, and
 * that rejection is swallowed. So a schema can read `unique: true, sparse:
 * true` for years while the collection holds a plain unique index, and
 * nothing anywhere says so.
 *
 * That is not hypothetical: it is how a unique-but-not-sparse index on
 * User.refreshToken survived, which made "no active session" a state only
 * one user could be in and broke logout and signup once logout began
 * clearing the token. See issue #437.
 *
 * Diagnostic only. It never creates, drops or alters anything, and never
 * prevents startup -- a wrong index is worth knowing about, but it is not
 * worth refusing to serve over, and this must not be able to take the app
 * down on its own.
 */

// The options that change what an index *enforces*. Cosmetic differences
// (name, background, collation defaults) are not worth reporting.
const SIGNIFICANT_OPTIONS = [
	'unique',
	'sparse',
	'partialFilterExpression',
	'expireAfterSeconds',
];

const keySignature = (keys) =>
	Object.entries(keys)
		.map(([field, direction]) => `${field}:${direction}`)
		.join(',');

const significant = (options = {}) =>
	SIGNIFICANT_OPTIONS.reduce((acc, key) => {
		// `unique: false` and an absent `unique` mean the same thing, so they
		// must not read as a difference.
		if (options[key] !== undefined && options[key] !== false) {
			acc[key] = options[key];
		}
		return acc;
	}, {});

const describe = (options) =>
	Object.keys(options).length === 0 ? '(none)' : JSON.stringify(options);

/**
 * @returns {Promise<Array>} the problems found, so a caller (or a test) can
 * assert on them rather than scraping logs.
 */
const verifyIndexes = async (connection) => {
	const problems = [];

	for (const modelName of connection.modelNames()) {
		const model = connection.model(modelName);

		let existing;
		try {
			existing = await model.collection.indexes();
		} catch (err) {
			// A collection that doesn't exist yet has no indexes to disagree
			// with -- a fresh database, not a problem. Anything else is worth a
			// line, but still not worth failing over.
			if (err.codeName !== 'NamespaceNotFound' && err.code !== 26) {
				logger.warn(
					{ err, model: modelName },
					'Could not read indexes for comparison'
				);
			}
			continue;
		}

		const byKey = new Map(
			existing
				// _id_ is always present and never declared in a schema.
				.filter((index) => index.name !== '_id_')
				.map((index) => [keySignature(index.key), index])
		);

		for (const [keys, options] of model.schema.indexes()) {
			const signature = keySignature(keys);
			const declared = significant(options);
			const found = byKey.get(signature);

			if (!found) {
				// Mongoose may still be building it; only worth reporting
				// alongside the rest, not as an error on its own.
				continue;
			}

			const actual = significant(found);
			if (JSON.stringify(declared) !== JSON.stringify(actual)) {
				problems.push({
					model: modelName,
					index: found.name,
					keys: signature,
					declared,
					actual,
				});
			}
		}
	}

	if (problems.length > 0) {
		problems.forEach((problem) => {
			logger.warn(
				problem,
				`Index ${problem.model}.${problem.index} does not match the schema: ` +
					`declared ${describe(problem.declared)}, database has ${describe(problem.actual)}. ` +
					'Mongoose cannot change an existing index, so the schema is not in effect here.'
			);
		});
	} else {
		logger.info('Indexes match their schemas');
	}

	return problems;
};

module.exports = { verifyIndexes };
