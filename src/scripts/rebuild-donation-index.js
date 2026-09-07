const mongoose = require('mongoose');

const Donation = require('../models/donation');
const config = require('../utils/config');

// One-time migration for issue #439.
//
// The unique index on (userId, donationDate) added in #405 is plain unique.
// userId is optional -- deleteUser anonymises a deleted donor's donations by
// unsetting it (#406) -- and a plain index records a missing field as null,
// so two anonymised donations sharing a donationDate collide. Deleting a
// second user who donated on the same day as an already-deleted one failed
// with a duplicate key error.
//
// The schema now declares a partial index, which drops the anonymised rows
// from the index and keeps the double-submit guard for every real donor. But
// Mongoose only ever creates indexes: it cannot change one that already
// exists, and MongoDB answers that attempt with an IndexOptionsConflict that
// is swallowed. So the old index has to be dropped explicitly; Mongoose then
// builds the new one on the next start.
//
// Idempotent, and safe to run before the schema change ships -- the window
// in between is simply unguarded, which is what the app did before #405.
const INDEX_NAME = 'userId_1_donationDate_1';

function getDatabaseUri() {
	const { host, user, password, name, sample } = config.database;
	return `${host}://${user}:${password}@${name}.${sample}.mongodb.net/${name}?retryWrites=true&w=majority`;
}

// The new index cannot build while duplicates exist, and Mongoose logs that
// failure without surfacing it -- the same trap #405 was already flagged for.
// Reported rather than repaired: choosing which of two real donation records
// to keep is not a decision a migration should make on its own.
async function findBlockingDuplicates() {
	return Donation.aggregate([
		{ $match: { userId: { $exists: true, $ne: null } } },
		{
			$group: {
				_id: { userId: '$userId', donationDate: '$donationDate' },
				count: { $sum: 1 },
				ids: { $push: '$_id' },
			},
		},
		{ $match: { count: { $gt: 1 } } },
	]);
}

async function rebuildDonationIndex() {
	const indexes = await Donation.collection.indexes();
	const existing = indexes.find((index) => index.name === INDEX_NAME);

	if (existing && existing.partialFilterExpression) {
		return { changed: false, reason: 'already-partial' };
	}

	const duplicates = await findBlockingDuplicates();
	if (duplicates.length > 0) {
		return { changed: false, reason: 'duplicates-present', duplicates };
	}

	if (existing) {
		await Donation.collection.dropIndex(INDEX_NAME);
	}

	await Donation.collection.createIndex(
		{ userId: 1, donationDate: 1 },
		{ unique: true, partialFilterExpression: { userId: { $exists: true } } }
	);

	return { changed: true, droppedOld: Boolean(existing) };
}

async function run() {
	let isConnected = false;

	try {
		await mongoose.connect(getDatabaseUri());
		isConnected = true;

		const result = await rebuildDonationIndex();

		if (result.changed) {
			console.log(
				result.droppedOld
					? `Replaced ${INDEX_NAME} with a partial unique index.`
					: `Created ${INDEX_NAME} as a partial unique index.`
			);
		} else if (result.reason === 'already-partial') {
			console.log(`${INDEX_NAME} is already partial; nothing to do.`);
		} else {
			console.error(
				`Refusing to rebuild ${INDEX_NAME}: ${result.duplicates.length} duplicate ` +
					'(userId, donationDate) group(s) exist. A unique index cannot build over ' +
					'them, and choosing which record to keep is not this script\'s call.'
			);
			result.duplicates.forEach((group) => {
				console.error(
					`  userId=${group._id.userId} donationDate=${group._id.donationDate} ` +
						`ids=${group.ids.join(', ')}`
				);
			});
			process.exitCode = 1;
		}
	} finally {
		if (isConnected) {
			await mongoose.disconnect();
		}
	}
}

if (require.main === module) {
	run().catch((error) => {
		console.error(`Unable to rebuild ${INDEX_NAME}: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { rebuildDonationIndex, findBlockingDuplicates, run, INDEX_NAME };
