const rateLimit = require('express-rate-limit');

const config = require('../utils/config');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

/**
 * Per-IP rate limiters for the public endpoints.
 *
 * Everything reachable without a token is a free lever for an abuser: the
 * credential routes can be brute-forced, and request-reset / contact-us both
 * send mail through the shared SMTP account -- sustained abuse there can get
 * that account suspended by the provider, which takes account activation and
 * password reset down for every real user.
 */
const buildLimiter = (max) =>
	rateLimit({
		windowMs: config.rateLimit.windowMs,
		limit: max,
		// Return the standard RateLimit-* headers and drop the legacy
		// X-RateLimit-* ones.
		standardHeaders: 'draft-7',
		legacyHeaders: false,
		// Checked per request rather than at construction time so tests can
		// toggle the flag and re-require the module.
		skip: () => !config.rateLimit.enabled,
		handler: (req, res) => {
			res.status(STATUS_CODE.TOO_MANY_REQUESTS).json({
				errorMessage: 'Too many requests. Please try again later.',
			});
		},
	});

// Login, signup, refresh-token, reset-password: credential/token brute force.
const authLimiter = buildLimiter(config.rateLimit.authMax);

// request-reset and contact-us: both send mail on every accepted request.
const mailLimiter = buildLimiter(config.rateLimit.mailMax);

// Public writes that neither send mail nor handle credentials (emergency).
const publicWriteLimiter = buildLimiter(config.rateLimit.publicWriteMax);

module.exports = { authLimiter, mailLimiter, publicWriteLimiter };
