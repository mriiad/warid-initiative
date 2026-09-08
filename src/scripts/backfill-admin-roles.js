const mongoose = require('mongoose');

const User = require('../models/user');
const config = require('../utils/config');

// One-time backfill for issue #183: every admin created before the role
// field existed has isAdmin: true and no role. requireAdminRole.js already
// treats that the same as 'principal' (full access), so nobody's access is
// at risk from skipping this -- but leaving it unset means the user list's
// per-role icon (issue #351) has nothing to show for them, and a principal
// reassigning someone's role can't tell what they currently hold. This
// makes that explicit by setting role: 'principal' on every admin that
// doesn't have a role recorded yet, matching the access they already have.
async function backfillAdminRoles() {
	const result = await User.updateMany(
		{ isAdmin: true, role: { $exists: false } },
		{ $set: { role: 'principal' } }
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

		const count = await backfillAdminRoles();
		console.log(`Backfilled role: 'principal' on ${count} existing admin(s).`);
	} finally {
		if (isConnected) {
			await mongoose.disconnect();
		}
	}
}

if (require.main === module) {
	run().catch((error) => {
		console.error(`Unable to backfill admin roles: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { backfillAdminRoles, run };
