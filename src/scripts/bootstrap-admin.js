const mongoose = require('mongoose');

const User = require('../models/user');
const config = require('../utils/config');

const USERNAME_OPTION = '--username';

function parseUsername(args) {
	if (args.length !== 2 || args[0] !== USERNAME_OPTION) {
		throw new Error(
			'Usage: npm run bootstrap:admin -- --username <registered-username>'
		);
	}

	const username = args[1].trim();
	if (!username) {
		throw new Error('The bootstrap username must not be empty.');
	}

	return username;
}

async function bootstrapFirstAdmin(username) {
	const existingAdmin = await User.exists({ isAdmin: true });
	if (existingAdmin) {
		throw new Error(
			'Bootstrap refused because an administrator already exists. Use the protected admin API for subsequent promotions.'
		);
	}

	const user = await User.findOne({ username });
	if (!user) {
		throw new Error(`No registered user found with username "${username}".`);
	}

	user.isAdmin = true;
	// The very first admin has nobody above them to assign a role, so they
	// start as Principal (full access) -- see issue #183.
	user.role = 'principal';
	await user.save();

	return user;
}

async function run(args = process.argv.slice(2)) {
	const username = parseUsername(args);
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

		const user = await bootstrapFirstAdmin(username);
		console.log(`First administrator created successfully: ${user.username}`);
	} finally {
		if (isConnected) {
			await mongoose.disconnect();
		}
	}
}

if (require.main === module) {
	run().catch((error) => {
		console.error(`Unable to bootstrap the first administrator: ${error.message}`);
		process.exitCode = 1;
	});
}

module.exports = { bootstrapFirstAdmin, parseUsername, run };
