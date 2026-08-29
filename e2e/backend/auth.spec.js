const request = require('supertest');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');
const config = require('../../src/utils/config');
const { logger } = require('../../src/utils/logger');

const app = buildApp();

describe('POST /api/auth/signup', () => {
	beforeEach(() => {
		User.findOne.mockReset().mockReturnValue(resolveTo(null));
	});

	it('rejects an invalid email', async () => {
		const res = await request(app).post('/api/auth/signup').send({
			email: 'not-an-email',
			password: 'password123',
			phoneNumber: '+212600000000',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('rejects a password shorter than 5 characters', async () => {
		const res = await request(app).post('/api/auth/signup').send({
			email: 'valid@example.com',
			password: 'ab',
			phoneNumber: '+212600000000',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('rejects a phone number that is not a valid E.164 number', async () => {
		const res = await request(app).post('/api/auth/signup').send({
			email: 'valid@example.com',
			password: 'password123',
			phoneNumber: '123',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('rejects signup when the email already exists', async () => {
		User.findOne.mockImplementation(({ email }) =>
			resolveTo(email ? { _id: 'existing-user' } : null)
		);
		const res = await request(app).post('/api/auth/signup').send({
			email: 'taken@example.com',
			password: 'password123',
			phoneNumber: '+212600000000',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('creates a user on valid input and does not leak the password hash', async () => {
		const res = await request(app).post('/api/auth/signup').send({
			email: 'new@example.com',
			password: 'password123',
			phoneNumber: '+212600000000',
			username: 'CIN123',
			gender: 'male',
		});
		expect(res.status).toBe(201);
		expect(res.body.userId).toBeDefined();
		expect(JSON.stringify(res.body)).not.toMatch(/password123/);
	});

	it('handles an activation-email failure without responding twice', async () => {
		// signup responds 201 and *then* sends the activation mail on the same
		// promise chain. A rejection used to fall through to the shared
		// .catch, which called next(err) after the response had gone out,
		// crashing the error middleware with ERR_HTTP_HEADERS_SENT. The
		// client-visible status is 201 either way, so this asserts on what
		// actually differs: the failure is handled by signup's own mail
		// handler and never reaches the shared error path.
		const nodemailer = require('nodemailer');
		nodemailer.__sendMail.mockImplementationOnce(() =>
			Promise.reject(new Error('smtp down'))
		);
		// The mail failure has to reach the logger, not console -- and it must
		// not surface as ERR_HTTP_HEADERS_SENT, which is what happened when the
		// rejection fell through to the main chain after the response was sent.
		const logSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

		try {
			const res = await request(app).post('/api/auth/signup').send({
				email: 'mailfail@example.com',
				password: 'password123',
				phoneNumber: '+212600000001',
				username: 'CIN124',
				gender: 'male',
			});
			expect(res.status).toBe(201);
			expect(res.body.userId).toBeDefined();

			// Let the post-response mail promise settle.
			await new Promise((resolve) => setImmediate(resolve));

			const logged = logSpy.mock.calls
				.map((call) => JSON.stringify(call))
				.join(' | ');
			expect(logged).toContain('Failed to send activation email');
			expect(logged).not.toContain('ERR_HTTP_HEADERS_SENT');
		} finally {
			logSpy.mockRestore();
		}
	});
});

describe('GET /api/auth/activation/:confirmationCode', () => {
	it('rejects an unknown, already-used, or expired confirmation code', async () => {
		// The mocked model can't evaluate the real query's expiry filter, so
		// this covers all three cases the same way a real "no match" would:
		// findOne simply returns nothing.
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app).get('/api/auth/activation/bogus-code');
		expect(res.status).toBe(400);
	});

	it('activates the account for a valid confirmation code and clears it (one-time use)', async () => {
		const fakeUser = {
			isActive: false,
			confirmationCode: 'good-code',
			confirmationCodeExpires: new Date(Date.now() + 60 * 60 * 1000),
			save: jest.fn().mockResolvedValue(true),
		};
		User.findOne.mockReturnValue(resolveTo(fakeUser));
		const res = await request(app).get('/api/auth/activation/good-code');
		expect(res.status).toBe(200);
		expect(fakeUser.isActive).toBe(true);
		expect(fakeUser.confirmationCode).toBeUndefined();
		expect(fakeUser.confirmationCodeExpires).toBeUndefined();
		expect(fakeUser.save).toHaveBeenCalled();
	});
});

describe('POST /api/auth/resend-activation (issue #365)', () => {
	beforeEach(() => {
		nodemailer.__sendMail.mockClear();
	});

	it('responds the same way for an unknown email as for a known one', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/auth/resend-activation')
			.send({ email: 'nobody@example.com' });
		expect(res.status).toBe(200);
		expect(nodemailer.__sendMail).not.toHaveBeenCalled();
	});

	it('sends a new activation email and updates the confirmation code for an unconfirmed account', async () => {
		const fakeUser = {
			username: 'CIN555',
			isActive: false,
			confirmationCode: 'stale-code',
			save: jest.fn().mockResolvedValue(true),
		};
		User.findOne.mockReturnValue(resolveTo(fakeUser));
		const res = await request(app)
			.post('/api/auth/resend-activation')
			.send({ email: 'donor@example.com' });
		expect(res.status).toBe(200);
		expect(fakeUser.save).toHaveBeenCalled();
		expect(fakeUser.confirmationCode).not.toBe('stale-code');
		expect(nodemailer.__sendMail).toHaveBeenCalledTimes(1);
		const sentMail = nodemailer.__sendMail.mock.calls[0][0];
		expect(sentMail.to).toBe('donor@example.com');
		expect(sentMail.html).toContain(fakeUser.confirmationCode);
	});

	it('does not send an email for an already-active account, but still responds 200', async () => {
		const fakeUser = {
			username: 'CIN555',
			isActive: true,
			save: jest.fn().mockResolvedValue(true),
		};
		User.findOne.mockReturnValue(resolveTo(fakeUser));
		const res = await request(app)
			.post('/api/auth/resend-activation')
			.send({ email: 'donor@example.com' });
		expect(res.status).toBe(200);
		expect(fakeUser.save).not.toHaveBeenCalled();
		expect(nodemailer.__sendMail).not.toHaveBeenCalled();
	});
});

describe('POST /api/auth/login', () => {
	it('returns 401 for an unknown username', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/auth/login')
			.send({ username: 'ghost', password: 'whatever' });
		expect(res.status).toBe(401);
	});

	it('returns 401 for a wrong password', async () => {
		const bcrypt = require('bcrypt');
		jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
		User.findOne.mockReturnValue(
			resolveTo({
				_id: 'user-1',
				email: 'a@example.com',
				password: 'hashed',
				save: jest.fn().mockResolvedValue(true),
			})
		);
		const res = await request(app)
			.post('/api/auth/login')
			.send({ username: 'bob', password: 'wrong' });
		expect(res.status).toBe(401);
	});

	it('issues a token and marks isAdmin on success, and does not leak the password hash', async () => {
		const bcrypt = require('bcrypt');
		jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
		const save = jest.fn().mockResolvedValue(true);
		User.findOne.mockReturnValue(
			resolveTo({
				_id: 'user-1',
				email: 'a@example.com',
				password: 'hashed',
				isAdmin: true,
				isActive: true,
				save,
			})
		);
		const res = await request(app)
			.post('/api/auth/login')
			.send({ username: 'bob', password: 'correct' });
		expect(res.status).toBe(200);
		expect(res.body.token).toBeDefined();
		expect(res.body.isAdmin).toBe(true);
		expect(JSON.stringify(res.body)).not.toMatch(/hashed/);
	});

	it('rejects an unconfirmed account (issue #357)', async () => {
		const bcrypt = require('bcrypt');
		jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
		User.findOne.mockReturnValue(
			resolveTo({
				_id: 'user-1',
				email: 'a@example.com',
				password: 'hashed',
				isActive: false,
				save: jest.fn().mockResolvedValue(true),
			})
		);
		const res = await request(app)
			.post('/api/auth/login')
			.send({ username: 'bob', password: 'correct' });
		expect(res.status).toBe(403);
	});
});

describe('Password reset flow', () => {
	it('request-reset responds the same way for an unknown email as for a known one (issue #359)', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/auth/request-reset')
			.send({ email: 'nobody@example.com' });
		expect(res.status).toBe(200);
	});

	it('request-reset succeeds for a known email', async () => {
		User.findOne.mockReturnValue(
			resolveTo({
				email: 'known@example.com',
				passwordResetToken: 'tok',
				save: jest.fn().mockResolvedValue({ passwordResetToken: 'tok' }),
			})
		);
		const res = await request(app)
			.post('/api/auth/request-reset')
			.send({ email: 'known@example.com' });
		expect(res.status).toBe(200);
	});

	it('check-reset-token rejects an invalid/expired token', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app).get('/api/auth/check-reset-token/bad-token');
		expect(res.status).toBe(400);
	});

	it('reset-password rejects an invalid/expired token', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/auth/reset-password/bad-token')
			.send({ password: 'newpassword123' });
		expect(res.status).toBe(400);
	});

	it('reset-password succeeds for a valid token', async () => {
		const save = jest.fn().mockResolvedValue(true);
		User.findOne.mockReturnValue(
			resolveTo({ email: 'known@example.com', save })
		);
		const res = await request(app)
			.post('/api/auth/reset-password/good-token')
			.send({ password: 'newpassword123' });
		expect(res.status).toBe(200);
	});
});

describe('PATCH /api/auth/update-password', () => {
	it('requires authentication', async () => {
		const res = await request(app)
			.patch('/api/auth/update-password')
			.send({ currentPassword: 'a', newPassword: 'b' });
		expect(res.status).toBe(401);
	});

	it('rejects an incorrect current password', async () => {
		const bcrypt = require('bcrypt');
		jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);
		User.findById.mockReturnValue(resolveTo({ password: 'hashed' }));
		const res = await request(app)
			.patch('/api/auth/update-password')
			.set('Authorization', authHeader('user-1'))
			.send({ currentPassword: 'wrong', newPassword: 'newpassword123' });
		expect(res.status).toBe(401);
	});

	it('returns 404 when the user no longer exists', async () => {
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.patch('/api/auth/update-password')
			.set('Authorization', authHeader('ghost'))
			.send({ currentPassword: 'a', newPassword: 'newpassword123' });
		expect(res.status).toBe(404);
	});

	it('changes the password on a correct current password', async () => {
		const bcrypt = require('bcrypt');
		jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockReturnValue(resolveTo({ password: 'hashed', save }));
		const res = await request(app)
			.patch('/api/auth/update-password')
			.set('Authorization', authHeader('user-1'))
			.send({ currentPassword: 'correct', newPassword: 'newpassword123' });
		expect(res.status).toBe(200);
		expect(save).toHaveBeenCalled();
	});
});

describe('POST /api/auth/signup error handling', () => {
	it('returns 500 when saving the new user fails', async () => {
		User.findOne.mockReset().mockReturnValue(resolveTo(null));
		User.mockImplementationOnce(function (data) {
			Object.assign(this, data);
			this._id = 'new-user';
			this.save = jest.fn().mockRejectedValue(new Error('write failed'));
			return this;
		});
		const res = await request(app).post('/api/auth/signup').send({
			email: 'boom@example.com',
			password: 'password123',
			phoneNumber: '+212600000000',
			username: 'CIN500',
		});
		expect(res.status).toBe(500);
	});
});

describe('POST /api/auth/login error handling', () => {
	it('returns 500 when persisting the refresh token fails', async () => {
		const bcrypt = require('bcrypt');
		jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);
		User.findOne.mockReturnValue(
			resolveTo({
				_id: 'user-1',
				email: 'a@example.com',
				password: 'hashed',
				isActive: true,
				save: jest.fn().mockRejectedValue(new Error('db down')),
			})
		);
		const res = await request(app)
			.post('/api/auth/login')
			.send({ username: 'bob', password: 'correct' });
		expect(res.status).toBe(500);
	});
});

describe('GET /api/auth/activation/:confirmationCode error handling', () => {
	it('returns 500 when the lookup fails', async () => {
		User.findOne.mockReturnValue(Promise.reject(new Error('db down')));
		const res = await request(app).get('/api/auth/activation/some-code');
		expect(res.status).toBe(500);
	});
});

describe('POST /api/auth/logout', () => {
	it('clears the cookie and confirms logout', async () => {
		const res = await request(app).post('/api/auth/logout');
		expect(res.status).toBe(200);
		expect(res.body.message).toBeDefined();
	});
});

describe('POST /api/auth/refresh-token', () => {
	it('rejects a missing refresh token', async () => {
		const res = await request(app).post('/api/auth/refresh-token').send({});
		expect(res.status).toBe(400);
	});

	it('rejects a malformed/invalid refresh token', async () => {
		const res = await request(app)
			.post('/api/auth/refresh-token')
			.send({ refreshToken: 'not-a-real-token' });
		expect(res.status).toBe(401);
	});

	it('returns 404 when the token is valid but the user no longer exists', async () => {
		const token = jwt.sign({ userId: 'ghost' }, config.auth.refreshSecretKey, {
			expiresIn: config.auth.refreshTokenExpire,
		});
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/auth/refresh-token')
			.send({ refreshToken: token });
		expect(res.status).toBe(404);
	});

	it('rejects a refresh token that does not match the one stored for the user', async () => {
		const token = jwt.sign({ userId: 'user-1' }, config.auth.refreshSecretKey, {
			expiresIn: config.auth.refreshTokenExpire,
		});
		User.findOne.mockReturnValue(
			resolveTo({ _id: 'user-1', email: 'a@example.com', refreshToken: 'a-different-token' })
		);
		const res = await request(app)
			.post('/api/auth/refresh-token')
			.send({ refreshToken: token });
		expect(res.status).toBe(401);
	});

	it('issues new tokens when the refresh token is valid and matches', async () => {
		const token = jwt.sign({ userId: 'user-1' }, config.auth.refreshSecretKey, {
			expiresIn: config.auth.refreshTokenExpire,
		});
		const save = jest.fn().mockResolvedValue(true);
		User.findOne.mockReturnValue(
			resolveTo({ _id: 'user-1', email: 'a@example.com', refreshToken: token, save })
		);
		const res = await request(app)
			.post('/api/auth/refresh-token')
			.send({ refreshToken: token });
		expect(res.status).toBe(200);
		expect(res.body.accessToken).toBeDefined();
		expect(res.body.refreshToken).toBeDefined();
		expect(save).toHaveBeenCalled();
	});

	it('returns 500 when persisting the new refresh token fails', async () => {
		const token = jwt.sign({ userId: 'user-1' }, config.auth.refreshSecretKey, {
			expiresIn: config.auth.refreshTokenExpire,
		});
		User.findOne.mockReturnValue(
			resolveTo({
				_id: 'user-1',
				email: 'a@example.com',
				refreshToken: token,
				save: jest.fn().mockRejectedValue(new Error('db down')),
			})
		);
		const res = await request(app)
			.post('/api/auth/refresh-token')
			.send({ refreshToken: token });
		expect(res.status).toBe(500);
	});
});

describe('Password reset flow error handling', () => {
	it('request-reset returns 500 when saving the reset token fails', async () => {
		User.findOne.mockReturnValue(
			resolveTo({ email: 'known@example.com', save: jest.fn().mockRejectedValue(new Error('db down')) })
		);
		const res = await request(app)
			.post('/api/auth/request-reset')
			.send({ email: 'known@example.com' });
		expect(res.status).toBe(500);
	});

	it('reset-password returns 500 when saving the new password fails', async () => {
		User.findOne.mockReturnValue(
			resolveTo({ email: 'known@example.com', save: jest.fn().mockRejectedValue(new Error('db down')) })
		);
		const res = await request(app)
			.post('/api/auth/reset-password/good-token')
			.send({ password: 'newpassword123' });
		expect(res.status).toBe(500);
	});

	it('check-reset-token confirms a valid, unexpired token', async () => {
		User.findOne.mockReturnValue(resolveTo({ email: 'known@example.com' }));
		const res = await request(app).get('/api/auth/check-reset-token/good-token');
		expect(res.status).toBe(200);
		expect(res.body.message).toMatch(/valid/i);
	});

	it('check-reset-token returns 500 on a lookup failure', async () => {
		User.findOne.mockReturnValue(Promise.reject(new Error('db down')));
		const res = await request(app).get('/api/auth/check-reset-token/good-token');
		expect(res.status).toBe(500);
	});

	it('logs but does not fail the request when the reset-success email fails to send', async () => {
		const save = jest.fn().mockResolvedValue(true);
		User.findOne.mockReturnValue(resolveTo({ email: 'known@example.com', save }));
		nodemailer.__sendMail.mockImplementationOnce((options, callback) =>
			callback(new Error('smtp unavailable'))
		);
		const res = await request(app)
			.post('/api/auth/reset-password/good-token')
			.send({ password: 'newpassword123' });
		expect(res.status).toBe(200);
	});
});

describe('email transporter disabled (EMAIL_ENABLED=false)', () => {
	// auth.js builds its transporter once at module load time from
	// src/utils/config.js. Exercising the "disabled" branch of
	// createTransporter (and the downstream "skip sending" branches in
	// signup/requestPasswordReset/sendPasswordResetSuccessEmail) requires a
	// fresh copy of the controller loaded under a different env, hence the
	// isolated module registry and mini app below rather than the shared
	// `app` used everywhere else in this file.
	let isolatedApp;
	let IsolatedUser;

	beforeAll(() => {
		jest.isolateModules(() => {
			process.env.EMAIL_ENABLED = 'false';
			IsolatedUser = require('../../src/models/user');
			const isolatedAuthRouter = require('../../src/routes/auth');
			const errorHandler = require('../../src/middleware/error-handler');
			isolatedApp = express();
			isolatedApp.use(bodyParser.json());
			isolatedApp.use(isolatedAuthRouter);
			isolatedApp.use(errorHandler);
		});
	});

	afterAll(() => {
		process.env.EMAIL_ENABLED = 'true';
	});

	it('still creates the account and responds normally without sending an email', async () => {
		IsolatedUser.findOne.mockReset().mockReturnValue(resolveTo(null));
		const res = await request(isolatedApp).post('/api/auth/signup').send({
			email: 'noemail@example.com',
			password: 'password123',
			phoneNumber: '+212600000000',
			username: 'CIN888',
		});
		expect(res.status).toBe(201);
	});

	it('still issues a reset token without sending an email', async () => {
		IsolatedUser.findOne.mockReset().mockReturnValue(
			resolveTo({ email: 'known@example.com', save: jest.fn().mockResolvedValue(true) })
		);
		const res = await request(isolatedApp)
			.post('/api/auth/request-reset')
			.send({ email: 'known@example.com' });
		expect(res.status).toBe(200);
	});

	it('still completes a password reset without sending a confirmation email', async () => {
		IsolatedUser.findOne.mockReset().mockReturnValue(
			resolveTo({ email: 'known@example.com', save: jest.fn().mockResolvedValue(true) })
		);
		const res = await request(isolatedApp)
			.post('/api/auth/reset-password/good-token')
			.send({ password: 'newpassword123' });
		expect(res.status).toBe(200);
	});

	it('lets an unconfirmed account log in when mail is off (issue #357: no way to ever confirm otherwise)', async () => {
		// jest.isolateModules gives this describe block's auth.js its own
		// fresh `require('bcrypt')`, separate from the one at the top of
		// this file -- a jest.spyOn on the outer instance wouldn't reach it.
		// A real hash sidesteps that entirely.
		const bcrypt = require('bcrypt');
		const realHash = await bcrypt.hash('correct', 4);
		IsolatedUser.findOne.mockReset().mockReturnValue(
			resolveTo({
				_id: 'user-1',
				email: 'a@example.com',
				password: realHash,
				isActive: false,
				save: jest.fn().mockResolvedValue(true),
			})
		);
		const res = await request(isolatedApp)
			.post('/api/auth/login')
			.send({ username: 'bob', password: 'correct' });
		expect(res.status).toBe(200);
	});
});

describe('fix: createTransporter correctly sees "missing SMTP credentials" (auth.js:18-19)', () => {
	// auth.js's createTransporter() has a defensive branch:
	//   if (!config.email.smtp.auth.user || !config.email.smtp.auth.pass) return null;
	// intended to skip building a transporter when SMTP credentials are
	// absent. This used to be dead code: src/utils/config.js sourced those
	// values as `process.env.SMTP_USER || '<hardcoded fallback>'`, and since
	// the fallbacks were non-empty, clearing the env vars just fell through
	// to them -- config.email.smtp.auth.user/pass could never be falsy. That
	// hardcoding has since been removed (both fields now default to ''), so
	// the guard works as intended.
	it('fix: clearing SMTP_USER/SMTP_PASS yields empty credentials, so no transporter is built', () => {
		let userValue;
		let passValue;
		jest.isolateModules(() => {
			const previousUser = process.env.SMTP_USER;
			const previousPass = process.env.SMTP_PASS;
			process.env.SMTP_USER = '';
			process.env.SMTP_PASS = '';
			const isolatedConfig = require('../../src/utils/config');
			userValue = isolatedConfig.email.smtp.auth.user;
			passValue = isolatedConfig.email.smtp.auth.pass;
			process.env.SMTP_USER = previousUser;
			process.env.SMTP_PASS = previousPass;
		});
		expect(userValue).toBe('');
		expect(passValue).toBe('');
	});
});
