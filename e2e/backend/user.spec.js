const request = require('supertest');
const { resolveTo, makeQuery } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/profile', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Profile = require('../../src/models/profile');
const Donation = require('../../src/models/donation');
const Event = require('../../src/models/event');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const USER_ID = '507f1f77bcf86cd799439011';
const ADMIN_ID = '507f1f77bcf86cd799439099';

// checkDonationEligibility() also checks age via the donor's Profile now, so
// an eligible donor in these tests needs an in-range birthdate on file.
const adultBirthdate = () => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - 30);
	d.setDate(d.getDate() - 1);
	return d;
};

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
				phoneNumber: '+212600000000',
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

describe('GET /api/users/:userId/dashboard (regression test for issue #203)', () => {
	it('returns an empty-state dashboard (200, empty donations) for a brand-new user', async () => {
		// getDashboard used to treat "no donations yet" the same as an
		// error, returning 404. A first-time user visiting their dashboard
		// saw an error page instead of an empty/welcome state. Fixed to
		// return 200 with an empty donations array.
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body.donations).toEqual([]);
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

describe('GET /api/users/profile/:userId (admin only)', () => {
	it('includes canDonate: true for a user with no donation history', async () => {
		User.findById.mockImplementation((id) => {
			if (id === ADMIN_ID) return resolveTo({ _id: ADMIN_ID, isAdmin: true });
			return resolveTo({
				_id: USER_ID,
				username: 'CIN000111',
				email: 'donor@example.com',
				phoneNumber: '+212600000000',
				isAdmin: false,
				gender: 'male',
				profile: { firstname: 'Amine', lastname: 'Bennani', bloodGroup: 'A+', city: 'Rabat' },
			});
		});
		Donation.find.mockReturnValue(resolveTo([]));
		Profile.findOne.mockReturnValue(resolveTo({ birthdate: adultBirthdate() }));
		const res = await request(app)
			.get(`/api/users/profile/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.canDonate).toBe(true);
	});

	it('includes canDonate: false for a user still inside the cooldown window', async () => {
		User.findById.mockImplementation((id) => {
			if (id === ADMIN_ID) return resolveTo({ _id: ADMIN_ID, isAdmin: true });
			return resolveTo({
				_id: USER_ID,
				username: 'CIN000111',
				isAdmin: false,
				gender: 'male',
				profile: { firstname: 'Amine', lastname: 'Bennani', bloodGroup: 'A+', city: 'Rabat' },
			});
		});
		Donation.find.mockReturnValue(resolveTo([{ donationDate: new Date() }]));
		Profile.findOne.mockReturnValue(resolveTo({ birthdate: adultBirthdate() }));
		const res = await request(app)
			.get(`/api/users/profile/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.canDonate).toBe(false);
	});
});

describe('GET /api/admin/stats', () => {
	it('rejects non-admin users', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, isAdmin: false }));
		const res = await request(app)
			.get('/api/admin/stats')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(403);
	});

	it('returns site-wide counts for admins', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		User.countDocuments.mockReturnValue(resolveTo(12));
		Event.countDocuments.mockReturnValue(resolveTo(3));
		Donation.countDocuments.mockReturnValue(resolveTo(27));

		const res = await request(app)
			.get('/api/admin/stats')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			totalUsers: 12,
			totalEvents: 3,
			totalDonations: 27,
		});
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		User.countDocuments.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.get('/api/admin/stats')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});
});

describe('GET /api/users', () => {
	it('returns paginated users with gender falling back to profile.gender', async () => {
		User.countDocuments.mockReturnValue(resolveTo(2));
		User.find.mockReturnValue(
			resolveTo([
				{
					toObject: () => ({ _id: 'u1', username: 'bob', gender: null }),
					gender: null,
					profile: { gender: 'male' },
				},
				{
					toObject: () => ({ _id: 'u2', username: 'ann', gender: 'female' }),
					gender: 'female',
					profile: null,
				},
			])
		);
		const res = await request(app).get('/api/users');
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(2);
		expect(res.body.users[0].gender).toBe('male');
		expect(res.body.users[1].gender).toBe('female');
	});

	it('returns 500 on a database error', async () => {
		User.countDocuments.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app).get('/api/users');
		expect(res.status).toBe(500);
	});
});

describe('PUT /api/user/update', () => {
	it('returns 404 when the user does not exist', async () => {
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.put('/api/user/update')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A', lastname: 'B', birthdate: '2000-01-01', bloodGroup: 'O+', city: 'Rabat' });
		expect(res.status).toBe(404);
	});

	it('updates an existing profile', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID }));
		const profileSave = jest.fn().mockResolvedValue(true);
		Profile.findOne.mockReturnValue(resolveTo({ save: profileSave }));
		const res = await request(app)
			.put('/api/user/update')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A', lastname: 'B', birthdate: '2000-01-01', bloodGroup: 'O+', city: 'Rabat' });
		expect(res.status).toBe(200);
		expect(profileSave).toHaveBeenCalled();
	});

	it('creates a new profile and links it to the user when none exists', async () => {
		const userSave = jest.fn().mockResolvedValue(true);
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, save: userSave }));
		Profile.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.put('/api/user/update')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A', lastname: 'B', birthdate: '2000-01-01', bloodGroup: 'O+', city: 'Rabat' });
		expect(res.status).toBe(200);
		expect(userSave).toHaveBeenCalled();
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.put('/api/user/update')
			.set('Authorization', authHeader(USER_ID))
			.send({});
		expect(res.status).toBe(500);
	});
});

describe('PATCH /api/user/profile', () => {
	it('returns 404 when the user does not exist', async () => {
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(404);
	});

	it('returns 404 when the user has no profile yet', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, profile: null }));
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(404);
	});

	it('updates only the fields provided', async () => {
		const profileSave = jest.fn().mockResolvedValue(true);
		const userSave = jest.fn().mockResolvedValue(true);
		User.findById.mockReturnValue(
			resolveTo({
				_id: USER_ID,
				save: userSave,
				profile: { firstname: 'Old', lastname: 'Name', save: profileSave },
			})
		);
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'New', phoneNumber: '0600000001' });
		expect(res.status).toBe(200);
		expect(profileSave).toHaveBeenCalled();
		expect(userSave).toHaveBeenCalled();
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(500);
	});
});

describe('GET /api/user/check-profile additional branches', () => {
	it('returns 404 when the user does not exist', async () => {
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.get('/api/user/check-profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(404);
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.get('/api/user/check-profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(500);
	});
});

describe('GET /api/user/profile additional branches', () => {
	it('returns 404 when the user does not exist', async () => {
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.get('/api/user/profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(404);
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.get('/api/user/profile')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(500);
	});
});

describe('POST /api/searchUsers additional branches', () => {
	beforeEach(() => {
		User.findById.mockImplementation((id) => resolveTo({ _id: id, isAdmin: true }));
	});

	it('filters by email, isAdmin and phoneNumber', async () => {
		User.find.mockReturnValue({
			populate: () => ({
				select: () =>
					Promise.resolve([
						{ toObject: () => ({ _id: 'u1', email: 'a@example.com', isAdmin: true }), _id: 'u1' },
					]),
			}),
		});
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ email: 'a@example.com', isAdmin: 'true', phoneNumber: '0600' });
		expect(res.status).toBe(200);
		expect(res.body.users).toHaveLength(1);
	});

	it('resolves an age range provided as a two-item array and includes users within range', async () => {
		User.find.mockReturnValue({
			populate: () => ({
				select: () =>
					Promise.resolve([
						{
							toObject: () => ({ _id: 'u1' }),
							_id: 'u1',
							profile: { birthdate: '1990-01-01' },
						},
					]),
			}),
		});
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ age: ['18', '99'] });
		expect(res.status).toBe(200);
		expect(res.body.users).toHaveLength(1);
	});

	it('returns 404 when firstname/lastname/bloodGroup filters match no profiles', async () => {
		Profile.find.mockReturnValue(resolveTo([]));
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ firstname: 'Nobody' });
		expect(res.status).toBe(404);
	});

	it('filters by gender across user and profile records', async () => {
		Profile.find.mockReturnValue(resolveTo([{ user: 'u1' }]));
		User.find.mockReturnValue({
			populate: () => ({
				select: () => Promise.resolve([{ toObject: () => ({ _id: 'u1' }), _id: 'u1' }]),
			}),
		});
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ gender: 'female' });
		expect(res.status).toBe(200);
	});

	it('excludes users who are not eligible for donation when availableForDonation is requested', async () => {
		User.find.mockReturnValue({
			populate: () => ({
				select: () =>
					Promise.resolve([{ toObject: () => ({ _id: 'u1' }), _id: 'u1', profile: null }]),
			}),
		});
		Donation.find.mockReturnValue(resolveTo([{ donationDate: new Date() }]));
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ availableForDonation: 'true' });
		expect(res.status).toBe(404);
	});

	it('returns 404 when the age post-filter removes every result', async () => {
		User.find.mockReturnValue({
			populate: () => ({
				select: () =>
					Promise.resolve([{ toObject: () => ({ _id: 'u1' }), _id: 'u1', profile: null }]),
			}),
		});
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ minAge: 18 });
		expect(res.status).toBe(404);
	});

	it('returns 500 on a database error', async () => {
		User.find.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.post('/api/searchUsers')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ username: 'bob' });
		expect(res.status).toBe(500);
	});
});

describe('DELETE /api/deleteUser/:username additional branches', () => {
	beforeEach(() => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
	});

	it('returns 404 when the user does not exist', async () => {
		User.findOneAndDelete.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.delete('/api/deleteUser/ghost')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('deletes an existing user', async () => {
		User.findOneAndDelete.mockReturnValue(resolveTo({ username: 'bob' }));
		const res = await request(app)
			.delete('/api/deleteUser/bob')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
	});

	it('returns 500 on a database error', async () => {
		User.findOneAndDelete.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.delete('/api/deleteUser/bob')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});
});

describe('GET /api/users/profile/:userId additional branches', () => {
	it('returns 404 when the target user does not exist', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo(null)
		);
		const res = await request(app)
			.get(`/api/users/profile/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: makeQuery(() => {
						throw new Error('db down');
				  })
		);
		const res = await request(app)
			.get(`/api/users/profile/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});
});

describe('PUT /api/users/:userId (admin only)', () => {
	it('returns 404 when the target user does not exist', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo(null)
		);
		const res = await request(app)
			.put(`/api/users/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(404);
	});

	it('updates an existing profile', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: resolveTo({ _id: id, save: jest.fn().mockResolvedValue(true) })
		);
		const profileSave = jest.fn().mockResolvedValue(true);
		Profile.findOne.mockReturnValue(resolveTo({ firstname: 'Old', save: profileSave }));
		const res = await request(app)
			.put(`/api/users/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ firstname: 'New', phoneNumber: '0600000001' });
		expect(res.status).toBe(200);
		expect(profileSave).toHaveBeenCalled();
	});

	it('creates a new profile when none exists and profile fields are provided', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: resolveTo({ _id: id, save: jest.fn().mockResolvedValue(true) })
		);
		Profile.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.put(`/api/users/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ firstname: 'New' });
		expect(res.status).toBe(200);
	});

	it('skips profile creation when none exists and no profile fields are provided', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: resolveTo({ _id: id, save: jest.fn().mockResolvedValue(true) })
		);
		Profile.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.put(`/api/users/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ phoneNumber: '0600000009' });
		expect(res.status).toBe(200);
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: makeQuery(() => {
						throw new Error('db down');
				  })
		);
		const res = await request(app)
			.put(`/api/users/${USER_ID}`)
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ firstname: 'A' });
		expect(res.status).toBe(500);
	});
});

describe('PATCH /api/users/:userId/admin additional branches', () => {
	it('returns 404 when the target user does not exist', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo(null)
		);
		const res = await request(app)
			.patch(`/api/users/${USER_ID}/admin`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('promotes a non-admin user', async () => {
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: resolveTo({ _id: id, isAdmin: false, save })
		);
		const res = await request(app)
			.patch(`/api/users/${USER_ID}/admin`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(save).toHaveBeenCalled();
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: makeQuery(() => {
						throw new Error('db down');
				  })
		);
		const res = await request(app)
			.patch(`/api/users/${USER_ID}/admin`)
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});
});

describe('GET /api/users/:userId/dashboard additional branches', () => {
	it('returns 404 when the user does not exist', async () => {
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(404);
	});

	it('returns an error response when the lookup fails', async () => {
		User.findById.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(500);
	});
});
