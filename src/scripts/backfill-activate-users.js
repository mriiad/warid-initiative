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
function getDatabaseUri() {
	const { host, user, password, name, sample } = config.database;
	return `${host}://${user}:${password}@${name}.${sample}.mongodb.net/${name}?retryWrites=true&w=majority`;
}

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
		await mongoose.connect(getDatabaseUri());
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
