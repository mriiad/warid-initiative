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
