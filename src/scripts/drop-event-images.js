const mongoose = require('mongoose');

const Event = require('../models/event');
const config = require('../utils/config');

// One-time cleanup for issue #461: the image is gone from the Event schema,
// but removing a field from a schema does nothing to documents that already
// have it -- every event created before this still carries its Buffer.
//
// That matters for more than tidiness. The list and detail endpoints both
// read with .lean(), which returns the stored document as it is: Mongoose
// is not hydrating it, so nothing strips an attribute the schema no longer
// declares. Both queries therefore project '-image' explicitly, and those
// projections are the only thing standing between a legacy row and its
// bytes being served again. This removes the reason for them to exist.
//
// Safe to run more than once, and a no-op on a database whose events never
// had one.
async function dropEventImages() {
	const result = await Event.collection.updateMany(
		{ image: { $exists: true } },
		{ $unset: { image: '' } }
	);
	return result.modifiedCount ?? 0;
}

async function run() {
	let isConnected = false;

	try {
		// A missing DB_* variable falls back to the production cluster, so a
		// script that writes must be told explicitly where to run rather than
		// inheriting that default. See issue #441.
		const problems = config.assertExplicitDatabaseTarget();
		if (problems.length > 0) {
			problems.forEach((problem) => console.error(problem));
			process.exitCode = 1;
			return;
		}

		console.log(`Target: ${config.describeDatabaseTarget()}`);

		await mongoose.connect(config.getDatabaseUri());
		isConnected = true;

		const count = await dropEventImages();
		console.log(`Removed the image field from ${count} event(s).`);
	} finally {
		if (isConnected) {
			await mongoose.disconnect();
		}
	}
}

if (require.main === module) {
	run().catch((error) => {
		console.error(`Unable to drop event images: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { dropEventImages, run };
