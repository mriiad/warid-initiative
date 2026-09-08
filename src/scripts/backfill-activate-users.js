const mongoose = require('mongoose');

const User = require('../models/user');
const config = require('../utils/config');

// One-time backfill for issue #357: login now refuses an account with
// isActive: false once mail is configured (see requestPasswordReset in
// auth.js). Every account created before that check existed has isActive:
// false and was never required to click the activation link to log in --
// without this, they'd all be locked out the moment this deploys, with no
// way back in (clicking a stale activation link they were never sent isn't
// an option). This marks every existing account active, matching the access
// they already have; only accounts created after this backfill runs are
// actually gated on confirming their email.
async function backfillActivateUsers() {
	const result = await User.updateMany(
		{ isActive: false },
		{ $set: { isActive: true } }
	);
	return result.modifiedCount ?? result.nModified ?? 0;
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

		const count = await backfillActivateUsers();
		console.log(`Backfilled isActive: true on ${count} existing account(s).`);
	} finally {
		if (isConnected) {
			await mongoose.disconnect();
		}
	}
}

if (require.main === module) {
	run().catch((error) => {
		console.error(`Unable to backfill account activation: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { backfillActivateUsers, run };
