const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();

describe('POST /api/auth/signup', () => {
	beforeEach(() => {
		User.findOne.mockReset().mockReturnValue(resolveTo(null));
	});

	it('rejects an invalid email', async () => {
		const res = await request(app).put('/api/auth/signup').send({
			email: 'not-an-email',
			password: 'password123',
			phoneNumber: '0600000000',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('rejects a password shorter than 5 characters', async () => {
		const res = await request(app).put('/api/auth/signup').send({
			email: 'valid@example.com',
			password: 'ab',
			phoneNumber: '0600000000',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('rejects a phone number shorter than 10 digits', async () => {
		const res = await request(app).put('/api/auth/signup').send({
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
		const res = await request(app).put('/api/auth/signup').send({
			email: 'taken@example.com',
			password: 'password123',
			phoneNumber: '0600000000',
			username: 'CIN123',
		});
		expect(res.status).toBe(400);
	});

	it('creates a user on valid input and does not leak the password hash', async () => {
		const res = await request(app).put('/api/auth/signup').send({
			email: 'new@example.com',
			password: 'password123',
			phoneNumber: '0600000000',
			username: 'CIN123',
			gender: 'male',
		});
		expect(res.status).toBe(201);
		expect(res.body.userId).toBeDefined();
		expect(JSON.stringify(res.body)).not.toMatch(/password123/);
	});
});

describe('GET /api/auth/activation/:confirmationCode', () => {
	it('returns 404 for an unknown confirmation code', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app).get('/api/auth/activation/bogus-code');
		expect(res.status).toBe(404);
	});

	it('activates the account for a known confirmation code', async () => {
		const fakeUser = { isActive: false, save: jest.fn().mockResolvedValue(true) };
		User.findOne.mockReturnValue(resolveTo(fakeUser));
		const res = await request(app).get('/api/auth/activation/good-code');
		expect(res.status).toBe(200);
		expect(fakeUser.isActive).toBe(true);
		expect(fakeUser.save).toHaveBeenCalled();
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
});

describe('Password reset flow', () => {
	it('request-reset returns 404 for unknown email (leaks whether an email is registered)', async () => {
		User.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/auth/request-reset')
			.send({ email: 'nobody@example.com' });
		expect(res.status).toBe(404);
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
});
