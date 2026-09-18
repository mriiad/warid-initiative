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
					// The raw specs, so repairDriftedIndexes can rebuild the
					// index from the schema and put the old one back if that
					// fails. Not part of what gets logged.
					schemaKeys: keys,
					schemaOptions: options,
					existingIndex: found,
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

/**
 * Indexes that no schema declares any more, and that must be removed from
 * databases which still carry them.
 *
 * Mongoose only ever *creates* indexes. Dropping one from a schema does
 * nothing to a database that already has it, so #437 shipped a fix that
 * could not take effect until somebody ran a migration by hand -- and
 * logout and signup stayed broken in production because that step is the
 * one that gets forgotten while the deploy is the one that happens.
 * See issue #447.
 *
 * Deliberately an explicit, reviewed list rather than syncIndexes(), which
 * drops everything a schema does not mention and would take out an index
 * added by hand for performance.
 *
 * Only for indexes that are *retired*. An index being *replaced* -- same
 * name, different options, like #439's userId_1_donationDate_1 -- stays a
 * manual migration: that one refuses to run while duplicates exist, because
 * a unique index cannot build over them, and dropping it here would throw
 * that check away and leave the collection unguarded.
 */
const RETIRED_INDEXES = [
	{
		model: 'User',
		name: 'refreshToken_1',
		// Unique but not sparse, so every user without a refresh token
		// collided on null: the second logout failed, and signup failed
		// after it. The field is still stored, just no longer indexed.
		issue: 437,
	},
];

/**
 * Drops the retired indexes above from whichever databases still have them.
 *
 * Idempotent, and does nothing on a database that is already correct.
 * Returns what it dropped so a caller (or a test) can assert on it rather
 * than scraping logs.
 */
const retireIndexes = async (connection) => {
	const dropped = [];

	for (const retired of RETIRED_INDEXES) {
		let model;
		try {
			model = connection.model(retired.model);
		} catch {
			// The model is not registered on this connection; nothing to do.
			continue;
		}

		try {
			const existing = await model.collection.indexes();
			if (!existing.some((index) => index.name === retired.name)) {
				continue;
			}

			await model.collection.dropIndex(retired.name);
			dropped.push({ model: retired.model, index: retired.name, issue: retired.issue });
			logger.warn(
				{ model: retired.model, index: retired.name, issue: retired.issue },
				`Dropped retired index ${retired.model}.${retired.name}: no schema declares it, ` +
					`and leaving it in place breaks writes (see issue #${retired.issue}).`
			);
		} catch (err) {
			// A missing collection is a fresh database, not a problem. Anything
			// else is worth a line but must not stop the app from starting.
			if (err.codeName !== 'NamespaceNotFound' && err.code !== 26) {
				logger.warn(
					{ err, model: retired.model, index: retired.name },
					'Could not retire index'
				);
			}
		}
	}

	return dropped;
};

/**
 * Brings a drifted index back in line with the schema that declares it.
 *
 * verifyIndexes only *reports* a disagreement, which was enough to find
 * User.refreshToken (#437) but not enough to fix it: the repair still
 * depended on somebody running a command, and production stayed broken until
 * somebody did. retireIndexes closed that gap for indexes no schema declares
 * any more. This closes it for indexes a schema *does* declare but whose
 * options in the database are wrong -- the case that leaves
 * `unique: true, sparse: true` in a model while the collection enforces a
 * plain unique index, and every document missing the field collides on null.
 *
 * Scope, deliberately narrow:
 *   - only indexes some schema declares, matched by their key signature, so
 *     an index added by hand for performance is never touched;
 *   - never `_id_`;
 *   - only when a SIGNIFICANT_OPTIONS value actually differs.
 *
 * If the schema's version cannot be built -- a unique index over a column
 * that now holds duplicates is the realistic case -- the old index is put
 * back, so a failed repair leaves the collection exactly as guarded as it
 * was rather than unguarded. That failure is logged at error with the
 * remedy, because it is the one case a human has to resolve.
 *
 * Never throws. A wrong index is worth fixing; it is not worth refusing to
 * start over, and this runs on the startup path.
 */
const repairDriftedIndexes = async (connection) => {
	const repaired = [];
	const problems = await verifyIndexes(connection);

	for (const problem of problems) {
		const model = connection.model(problem.model);
		const { existingIndex, schemaKeys, schemaOptions } = problem;

		// Rebuild the old index exactly, minus the server-managed fields, so
		// it can be restored if the schema's version will not build.
		const {
			key,
			name: _name,
			v: _v,
			ns: _ns,
			background: _background,
			...oldOptions
		} = existingIndex;

		try {
			await model.collection.dropIndex(existingIndex.name);
		} catch (err) {
			logger.warn(
				{ err, model: problem.model, index: existingIndex.name },
				'Could not drop a drifted index; leaving it in place'
			);
			continue;
		}

		try {
			await model.collection.createIndex(schemaKeys, schemaOptions);
			repaired.push({
				model: problem.model,
				index: existingIndex.name,
				was: problem.actual,
				now: problem.declared,
			});
			logger.warn(
				{
					model: problem.model,
					index: existingIndex.name,
					was: describe(problem.actual),
					now: describe(problem.declared),
				},
				`Rebuilt index ${problem.model}.${existingIndex.name} to match its schema.`
			);
		} catch (err) {
			// Put it back. A collection with the old, wrong index is still
			// better than one with no index at all.
			let restored = false;
			try {
				await model.collection.createIndex(key, oldOptions);
				restored = true;
			} catch (restoreErr) {
				logger.error(
					{ err: restoreErr, model: problem.model, index: existingIndex.name },
					`Could not restore ${problem.model}.${existingIndex.name} after a failed rebuild. ` +
						'The collection is now missing that index.'
				);
			}
			logger.error(
				{ err, model: problem.model, index: existingIndex.name, restored },
				`Could not rebuild ${problem.model}.${existingIndex.name} from its schema` +
					`${restored ? ' (the previous index was restored)' : ''}. ` +
					'A unique index cannot build over existing duplicates -- resolve those, then restart.'
			);
		}
	}

	return repaired;
};

module.exports = {
	verifyIndexes,
	retireIndexes,
	repairDriftedIndexes,
	RETIRED_INDEXES,
};
