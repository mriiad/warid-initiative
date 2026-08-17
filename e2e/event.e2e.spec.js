const request = require('supertest');
const jwt = require('jsonwebtoken');
const User = require('../src/models/user');
const Event = require('../src/models/event');
const config = require('../src/utils/config');

function signToken(userId, email = 'user@test.com') {
	return jwt.sign(
		{ email, userId: userId.toString() },
		config.auth.jwtSecretKey,
		{
			expiresIn: config.auth.jwtExpire,
		}
	);
}

describe('E2E: Event APIs', () => {
	let app;
	let admin;
	let user;
	let adminToken;
	let userToken;

	beforeEach(async () => {
		app = global.__buildApp();

		admin = await User.create({
			username: 'admin',
			email: 'admin@test.com',
			password: 'hashed',
			isAdmin: true,
			isActive: true,
			phoneNumber: '0000000',
			firstName: 'Admin',
			lastName: 'User',
			gender: 'male',
		});

		user = await User.create({
			username: 'normaluser',
			email: 'user@test.com',
			password: 'hashed',
			isAdmin: false,
			isActive: true,
			phoneNumber: '0000001',
			firstName: 'Normal',
			lastName: 'User',
			gender: 'male',
		});

		adminToken = signToken(admin._id, admin.email);
		userToken = signToken(user._id, user.email);
	});

	test('Non-admin cannot create event', async () => {
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', `Bearer ${userToken}`)
			.field('title', 'Community Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-08-20')
			.field('description', 'desc')
			.field('isGeneric', 'false');

		expect(res.status).toBe(403);
		expect(res.body.message).toMatch(/Admin/);
	});

	test('Admin can create an event; a second event on the same date is rejected', async () => {
		const res1 = await request(app)
			.post('/api/event')
			.set('Authorization', `Bearer ${adminToken}`)
			.field('title', 'E1')
			.field('location', 'Casa')
			.field('date', '2099-08-20')
			.field('description', 'desc')
			.field('isGeneric', 'false');
		expect(res1.status).toBe(201);
		expect(res1.body.event.reference).toBe('WEVENT20990820');

		// The event reference is derived from the date (WEVENT + YYYYMMDD),
		// so a second event on the same date would collide. The controller
		// rejects this outright instead of generating a suffix.
		const res2 = await request(app)
			.post('/api/event')
			.set('Authorization', `Bearer ${adminToken}`)
			.field('title', 'E2')
			.field('location', 'Casa')
			.field('date', '2099-08-20')
			.field('description', 'desc')
			.field('isGeneric', 'false');
		expect(res2.status).toBe(409);
		expect(res2.body.message).toMatch(/already exists for this date/);
	});

	test('GET /api/events returns paginated list', async () => {
		await Event.create({
			reference: 'WEVENT20250821',
			title: 'E1',
			location: 'Casa',
			date: new Date('2025-08-21'),
			isGeneric: false,
		});
		const res = await request(app).get('/api/events?page=1');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body.events)).toBe(true);
		expect(res.body.totalItems).toBe(1);
	});
});
