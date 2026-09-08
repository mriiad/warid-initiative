const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Application Configuration
 * Centralized configuration with environment variables and defaults
 */
const config = {
	server: {
		port: process.env.PORT || 3000,
		nodeEnv: process.env.NODE_ENV || 'development',
		// How many reverse proxies sit in front of the app. Express needs
		// this to resolve the real client IP from X-Forwarded-For; without
		// it every request behind a proxy looks like it came from the proxy
		// and shares one rate-limit bucket. Left off by default: trusting
		// the header on a directly-exposed deployment lets anyone spoof
		// their IP and sidestep the limits entirely.
		trustProxy: process.env.TRUST_PROXY_HOPS
			? parseInt(process.env.TRUST_PROXY_HOPS, 10)
			: false,
	},

	security: {
		// HSTS is only meaningful over TLS, and enabling it while the
		// deployment still answers on plain HTTP would pin browsers to a
		// scheme that doesn't work. Opt in once TLS is terminated in front.
		hstsEnabled: process.env.HSTS_ENABLED === 'true',
	},

	// Per-IP limits for the public endpoints. Disabled under test, where the
	// suites deliberately hammer these same routes; rateLimit.spec.js turns
	// them on explicitly to exercise the behaviour.
	rateLimit: {
		enabled:
			process.env.RATE_LIMIT_ENABLED === 'true' ||
			(process.env.RATE_LIMIT_ENABLED !== 'false' &&
				process.env.NODE_ENV !== 'test'),
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
		// Credential endpoints: brute-force surface.
		authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 10,
		// Endpoints that send mail. Abuse here can get the SMTP account
		// suspended by the provider, taking activation and password reset
		// down for everyone, so these are the tightest.
		mailMax: parseInt(process.env.RATE_LIMIT_MAIL_MAX) || 5,
		// Public writes that don't send mail or check credentials.
		publicWriteMax: parseInt(process.env.RATE_LIMIT_PUBLIC_WRITE_MAX) || 20,
	},

	frontend: {
		url: process.env.FRONTEND_URL || 'http://localhost:4200',
		protocol: process.env.FRONTEND_PROTOCOL || 'http',
		host: process.env.FRONTEND_HOST || 'localhost',
		port: process.env.FRONTEND_PORT || '4200',
	},

	database: {
		// DB_URI wins when set: the assembled form below can only ever address
		// Atlas (`.mongodb.net` is baked into it), so without this there is no
		// way to point anything -- least of all a destructive migration -- at
		// a local or staging database. See issue #441.
		uri: process.env.DB_URI,
		host: process.env.DB_HOST || 'mongodb+srv',
		name: process.env.DB_NAME || 'warid',
		user: process.env.DB_USER || 'mriad',
		password: process.env.DB_PASSWORD || '',
		sample: process.env.DB_SAMPLE || 'j7pzkfb',
	},

	auth: {
		// No fallback on purpose. These used to default to constants written
		// in this file ('RANDOMSECRETKEY' and friends), so a deployment that
		// forgot to set them booted normally and signed every token with a
		// value published in this repository -- anyone could mint a token for
		// any userId, and isAuth would accept it. Left undefined here and
		// checked by assertAuthSecrets() below, so a misconfigured deploy
		// fails loudly at startup instead of serving forgeable tokens.
		// See issue #394.
		jwtSecretKey: process.env.JWT_SECRET_KEY,
		refreshSecretKey: process.env.REFRESH_SECRET_KEY,
		jwtExpire: process.env.JWT_EXPIRE || '1d',
		refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '7d',
		passwordResetExpireMinutes:
			parseInt(process.env.PASSWORD_RESET_EXPIRE_MINUTES) || 15,
		// Long compared to the password-reset window on purpose -- an
		// activation link isn't a security-sensitive credential the way a
		// password reset is, and an inbox can easily go unchecked for a day
		// or two. A stale link is recoverable either way, via the resend
		// flow (issue #365).
		activationLinkExpireHours:
			parseInt(process.env.ACTIVATION_LINK_EXPIRE_HOURS) || 24,
	},

	email: {
		enabled: process.env.EMAIL_ENABLED !== 'false', // Default to enabled
		from: process.env.EMAIL_FROM || 'do-not-reply@warid.ma',
		// Where contact-form submissions are delivered. Configurable so a
		// staging deploy doesn't mail the real team.
		contactRecipient: process.env.CONTACT_EMAIL || 'team@warid.ma',
		smtp: {
			host: process.env.SMTP_HOST || 'smtp.gmail.com',
			port: parseInt(process.env.SMTP_PORT) || 465,
			secure: process.env.SMTP_SECURE === 'true',
			auth: {
				user: process.env.SMTP_USER || '',
				pass: process.env.SMTP_PASS || '',
			},
			tls: {
				ciphers: process.env.SMTP_CIPHERS || 'SSLv3',
				requireTLS: process.env.SMTP_REQUIRE_TLS === 'true',
			},
		},
	},

	constants: {
		passwordReset: {
			tokenLength: 32,
			expireMinutes: 15,
		},
		bcryptRounds: 12,
		timezone: 'UTC',
	},
};

// The values these used to fall back to. Rejected explicitly so that
// copying one out of this file's history into an env var doesn't quietly
// restore the same forgeable-token problem. See issue #394.
const KNOWN_INSECURE_SECRETS = new Set([
	'RANDOMSECRETKEY',
	'REFRESHSECRETKEY',
	'random-secret-key',
]);

/**
 * Fails fast when an auth secret is missing or is one of the constants
 * this file used to default to.
 *
 * Deliberately a function rather than a check at module load: config.js is
 * imported by scripts and test setup that have no business exiting, so the
 * assertion belongs at server startup (src/app.js), next to the equally
 * fatal database-connection check.
 *
 * Returns the list of problems rather than throwing, so the caller decides
 * how to report and exit.
 */
const assertAuthSecrets = () => {
	const problems = [];
	for (const [name, value] of [
		['JWT_SECRET_KEY', config.auth.jwtSecretKey],
		['REFRESH_SECRET_KEY', config.auth.refreshSecretKey],
	]) {
		if (!value) {
			problems.push(`${name} is not set`);
		} else if (KNOWN_INSECURE_SECRETS.has(value)) {
			problems.push(
				`${name} is set to a value this repository once shipped as a default; choose a new secret`
			);
		}
	}
	return problems;
};

/**
 * The one place the connection string is built. It used to be copy-pasted
 * into app.js and every script, so "where does this actually connect?" had
 * six answers. See issue #441.
 */
const getDatabaseUri = () => {
	if (config.database.uri) {
		return config.database.uri;
	}
	const { host, user, password, name, sample } = config.database;
	return `${host}://${user}:${password}@${name}.${sample}.mongodb.net/${name}?retryWrites=true&w=majority`;
};

/**
 * The target, safe to print: enough to answer "am I about to touch
 * production?" and never the password.
 */
const describeDatabaseTarget = () => {
	if (config.database.uri) {
		// Strip any user:password@ before the host.
		return config.database.uri.replace(/\/\/[^@/]*@/, '//');
	}
	const { host, name, sample } = config.database;
	return `${host}://${name}.${sample}.mongodb.net/${name}`;
};

/**
 * Every part of the assembled URI has a production default, so a missing or
 * mistyped variable silently resolves to the live cluster. The app keeps
 * those defaults -- changing that would alter how existing deployments boot
 * -- but a script that drops indexes must be told explicitly where to run.
 *
 * Same reasoning as assertAuthSecrets (issue #394): a misconfiguration
 * should fail loudly instead of quietly doing the wrong thing somewhere
 * important. Returns the problems rather than throwing, so the caller
 * decides how to report and exit.
 */
const REQUIRED_DB_VARS = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_SAMPLE'];

// Captured when this module loads, like every other value here. The check
// cannot ask process.env at call time: config.database already resolved its
// defaults at load, so the two would be answering about different
// environments -- and a script could then be told its configuration is fine
// while holding a URI assembled from something else.
const explicitDbVars = new Set(
	['DB_URI', ...REQUIRED_DB_VARS].filter((name) => process.env[name])
);

const assertExplicitDatabaseTarget = () => {
	if (explicitDbVars.has('DB_URI')) {
		return [];
	}
	const missing = REQUIRED_DB_VARS.filter((name) => !explicitDbVars.has(name));
	if (missing.length === 0) {
		return [];
	}
	return [
		`Refusing to guess which database to use: ${missing.join(', ')} not set. ` +
			'Set DB_URI to a full connection string, or set every DB_* variable ' +
			'explicitly. Unset variables fall back to the production cluster.',
	];
};

module.exports = config;
module.exports.assertAuthSecrets = assertAuthSecrets;
module.exports.getDatabaseUri = getDatabaseUri;
module.exports.describeDatabaseTarget = describeDatabaseTarget;
module.exports.assertExplicitDatabaseTarget = assertExplicitDatabaseTarget;
