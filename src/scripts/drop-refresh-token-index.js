const mongoose = require('mongoose');

const User = require('../models/user');
const config = require('../utils/config');

// One-time migration for issue #437.
//
// User.refreshToken used to be declared unique (and sparse), and the
// deployed index is unique without being sparse -- MongoDB then indexes a
// missing field as null, so at most one user document may lack a refresh
// token. Logout leaves a user in exactly that state, so once logout began
// clearing the token (#404) the second logout failed with a duplicate-key
// error, and signup -- which also creates a document with no token --
// failed after it.
//
// The schema no longer declares the index, but Mongoose only ever creates
// indexes; it never removes one that has been dropped from a schema. This
// removes it.
//
// Safe to run more than once, and safe to run before deploying the schema
// change: uniqueness on this field enforced nothing (the value is a JWT
// this server signs carrying the user's own id, so two users cannot be
// issued the same string) and nothing queries by it, so dropping the index
// costs no reads.
const INDEX_NAME = 'refreshToken_1';

function getDatabaseUri() {
	const { host, user, password, name, sample } = config.database;
	return `${host}://${user}:${password}@${name}.${sample}.mongodb.net/${name}?retryWrites=true&w=majority`;
}

async function dropRefreshTokenIndex() {
	const indexes = await User.collection.indexes();
	const existing = indexes.find((index) => index.name === INDEX_NAME);

	if (!existing) {
		return { dropped: false, reason: 'not-present' };
	}

	await User.collection.dropIndex(INDEX_NAME);
	return { dropped: true, previousOptions: { unique: existing.unique, sparse: existing.sparse } };
}

async function run() {
	let isConnected = false;

	try {
		await mongoose.connect(getDatabaseUri());
		isConnected = true;

		const result = await dropRefreshTokenIndex();
		if (result.dropped) {
			console.log(
				`Dropped ${INDEX_NAME} (was ${JSON.stringify(result.previousOptions)}).`
			);
		} else {
			console.log(`${INDEX_NAME} is not present; nothing to drop.`);
		}
	} finally {
		if (isConnected) {
			await mongoose.disconnect();
		}
	}
}

if (require.main === module) {
	run().catch((error) => {
		console.error(`Unable to drop ${INDEX_NAME}: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { dropRefreshTokenIndex, run, INDEX_NAME };
