const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/profile', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Profile = require('../../src/models/profile');
const Donation = require('../../src/models/donation');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const USER_ID = '507f1f77bcf86cd799439011';
const ADMIN_ID = '507f1f77bcf86cd799439099';

describe('GET /api/user/profile', () => {
	it('returns just gender when the user has no profile yet', async () => {
		User.findById.mockReturnValue(resolveTo({ gender: 'male', profile: null }));
		const res = await request(app)
			.get('/api/user/profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ gender: 'male' });
	});

	it('returns the full profile once completed', async () => {
		User.findById.mockReturnValue(
			resolveTo({
				gender: 'female',
				phoneNumber: 600000000,
				email: 'a@example.com',
				profile: { firstname: 'A', lastname: 'B', birthdate: '2000-01-01', bloodGroup: 'O+', city: 'Casablanca' },
			})
		);
		const res = await request(app)
			.get('/api/user/profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body.firstname).toBe('A');
		expect(res.body.bloodGroup).toBe('O+');
	});
});

describe('GET /api/user/check-profile', () => {
	it('reports incomplete when there is no profile', async () => {
		User.findById.mockReturnValue(resolveTo({ profile: null }));
		const res = await request(app)
			.get('/api/user/check-profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body.isProfileComplete).toBe(false);
	});

	it('reports complete only when every required field is set', async () => {
		User.findById.mockReturnValue(
			resolveTo({
				profile: { firstname: 'A', lastname: 'B', birthdate: '2000-01-01', bloodGroup: 'O+', city: 'Casablanca' },
			})
		);
		const res = await request(app)
			.get('/api/user/check-profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body.isProfileComplete).toBeTruthy();
	});
});

describe('PATCH /api/users/:userId/admin (BUG regression for issue #204: ProfileComponent calls the wrong endpoint with userId="me")', () => {
	it('BUG: crashes with a Mongoose CastError when the frontend\'s literal "me" reaches an admin :userId route', async () => {
		// ProfileComponent.tsx line 485 calls updateProfile({ userId: 'me', ... })
		// which hits `PUT /api/users/me` (usersService.updateProfile ->
		// /api/users/${userId}) -- the ADMIN-ONLY updateUserById route, not the
		// self-service PATCH /api/user/profile route. Even when the caller IS
		// an admin (as mocked here), `User.findById('me')` throws
		// `CastError: Cast to ObjectId failed for value "me"` exactly as
		// reported in issue #204. For a non-admin caller this instead 403s via
		// checkIfAdmin -- so the self-service "update my profile" action is
		// broken for every single user.
		User.findById.mockImplementation((id) => {
			if (id === ADMIN_ID) return resolveTo({ _id: ADMIN_ID, isAdmin: true });
			return Promise.reject(
				Object.assign(new Error(`Cast to ObjectId failed for value "${id}" (type string) at path "_id" for model "User"`), {
					name: 'CastError',
				})
			);
		});
		const res = await request(app)
			.put('/api/users/me')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(500);
		expect(res.body.message).toMatch(/Cast to ObjectId failed for value "me"/);
	});

	it('BUG: a non-admin user gets 403 instead of updating their own profile', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, isAdmin: false }));
		const res = await request(app)
			.put('/api/users/me')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(403);
	});
});

describe('POST /api/searchUsers (admin only)', () => {
	it('rejects non-admin callers', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, isAdmin: false }));
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(USER_ID))
			.send({ username: 'bob' });
		expect(res.status).toBe(403);
	});

	it('returns matching users for an admin caller', async () => {
		User.findById.mockImplementation((id) => resolveTo({ _id: id, isAdmin: true }));
		User.find.mockReturnValue(
			resolveTo({
				select: () => [
					{
						toObject: () => ({ _id: 'u1', username: 'bob', isAdmin: false }),
						_id: 'u1',
						username: 'bob',
					},
				],
			})
		);
		// User.find(query).populate('profile').select(...) is a chained query;
		// keep it simple by directly resolving to an array with a select shim.
		User.find.mockReturnValue({
			populate: () => ({
				select: () =>
					Promise.resolve([{ toObject: () => ({ _id: 'u1', username: 'bob', isAdmin: false }), _id: 'u1' }]),
			}),
		});
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ username: 'bob' });
		expect(res.status).toBe(200);
		expect(res.body.users).toHaveLength(1);
	});
});

describe('PATCH /api/users/:userId/admin', () => {
	it('rejects promoting an already-admin user', async () => {
		User.findById.mockImplementation((id) => {
			if (id === ADMIN_ID) return resolveTo({ _id: ADMIN_ID, isAdmin: true });
			return resolveTo({ _id: 'target', isAdmin: true });
		});
		const res = await request(app)
			.patch('/api/users/target/admin')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(400);
	});
});

describe('DELETE /api/deleteUser/:username (admin only)', () => {
	it('rejects non-admin callers', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, isAdmin: false }));
		const res = await request(app)
			.delete('/api/deleteUser/bob')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(403);
	});
});

describe('GET /api/users/:userId/dashboard (BUG regression for issue #203)', () => {
	it('BUG: 404s a brand-new user instead of returning an empty-state dashboard', async () => {
		// getDashboard treats "no donations yet" the same as an error: it
		// returns 404 with errorMessage "No donations found for this user."
		// A first-time user visiting their dashboard therefore sees an error
		// page instead of an empty/welcome state.
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(404);
		expect(res.body.errorMessage).toMatch(/No donations found/);
	});

	it('returns donation stats for a user with donation history', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue({
			sort: () => ({
				populate: () =>
					Promise.resolve([
						{ _id: 'd1', donationDate: new Date('2026-01-01'), donationType: 'BLOOD', eventId: { title: 'Drive', isGeneric: false } },
					]),
			}),
		});
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body.stats.total).toBe(1);
	});
});
