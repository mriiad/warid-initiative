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
		host: process.env.DB_HOST || 'mongodb+srv',
		name: process.env.DB_NAME || 'warid',
		user: process.env.DB_USER || 'mriad',
		password: process.env.DB_PASSWORD || '',
		sample: process.env.DB_SAMPLE || 'j7pzkfb',
	},

	auth: {
		secretKey: process.env.SECRET_KEY || 'random-secret-key',
		jwtSecretKey: process.env.JWT_SECRET_KEY || 'RANDOMSECRETKEY',
		refreshSecretKey: process.env.REFRESH_SECRET_KEY || 'REFRESHSECRETKEY',
		jwtExpire: process.env.JWT_EXPIRE || '1d',
		refreshTokenExpire: process.env.REFRESH_TOKEN_EXPIRE || '7d',
		passwordResetExpireMinutes:
			parseInt(process.env.PASSWORD_RESET_EXPIRE_MINUTES) || 15,
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

module.exports = config;
