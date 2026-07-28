const os = require('os');

const pino = require('pino');

const config = require('./config');

/**
 * Application logger.
 *
 * Output is line-delimited JSON so a log collector can index fields rather
 * than regex over prose. For readable local output, pipe it:
 *
 *     npm start | npx pino-pretty
 *
 * Nothing is written under NODE_ENV=test -- the suites deliberately drive
 * error paths, and a few hundred stack traces would bury real failures.
 * logging.spec.js sets LOG_LEVEL explicitly to assert on the output.
 */

/**
 * Fields scrubbed from anything handed to the logger, wherever they appear.
 *
 * This app holds donor names, phone numbers, blood groups and donation
 * history, and logs are routinely shipped to third-party collectors and read
 * by people who have no business seeing credentials. Redaction is applied at
 * the logger rather than at each call site, so a future `logger.info({ user })`
 * can't leak a password hash or a live reset token by accident.
 */
const REDACT_PATHS = [
	'req.headers.authorization',
	'req.headers.cookie',
	'password',
	'newPassword',
	'confirmPassword',
	'*.password',
	'token',
	'resetToken',
	'passwordResetToken',
	'*.passwordResetToken',
	'accessToken',
	'refreshToken',
];

const resolveLevel = () => {
	if (process.env.LOG_LEVEL) {
		return process.env.LOG_LEVEL;
	}
	return config.server.nodeEnv === 'test' ? 'silent' : 'info';
};

const buildLogger = (destination = process.stdout) =>
	pino(
		{
			level: resolveLevel(),
			redact: { paths: REDACT_PATHS, censor: '[redacted]' },
			// `time` over pino's default epoch millis: a human reading a log
			// line shouldn't have to convert it.
			timestamp: pino.stdTimeFunctions.isoTime,
			formatters: {
				level: (label) => ({ level: label }),
			},
			// pino's default base is { pid, hostname }; keep both -- in a
			// container the hostname is what identifies which instance a line
			// came from -- and add the environment alongside them.
			base: {
				pid: process.pid,
				hostname: os.hostname(),
				env: config.server.nodeEnv,
			},
		},
		destination
	);

const logger = buildLogger();

module.exports = { logger, buildLogger, REDACT_PATHS };
