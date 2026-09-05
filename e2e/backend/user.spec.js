const request = require('supertest');
const { resolveTo, makeQuery } = require('./support/mongooseMock');
const {
	GENERIC_SERVER_ERROR,
} = require('../../src/middleware/error-handler');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/profile', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/emergency', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/participant', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Profile = require('../../src/models/profile');
const Donation = require('../../src/models/donation');
const Event = require('../../src/models/event');
const Emergency = require('../../src/models/emergency');
const Participant = require('../../src/models/participant');
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
		// The crash is the bug being documented here. The driver's own message
		// naming the model and the path stays server-side -- the error handler
		// logs it and returns a generic message, so probing this route doesn't
		// map out the schema.
		const body = JSON.stringify(res.body);
		expect(body).not.toContain('Cast to ObjectId');
		expect(body).not.toContain('model "User"');
		expect(res.body.message).toBe(GENERIC_SERVER_ERROR);
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

	// Search terms were interpolated into regexes raw. See issue #400.
	describe('treats search terms as literal text, not as regex (issue #400)', () => {
		// searchUsers answers 404 when nothing matches, so the profile lookup
		// has to yield a hit for the flow to reach User.find and let us
		// inspect the regex it built.
		const mockAdminAndCapture = () => {
			User.findById.mockImplementation((id) => resolveTo({ _id: id, isAdmin: true }));
			const captured = {};
			User.find.mockImplementation((q) => {
				Object.assign(captured, q);
				return {
					populate: () => ({
						select: () =>
							Promise.resolve([
								{ _id: 'u1', toObject: () => ({ _id: 'u1', username: 'bob' }) },
							]),
					}),
				};
			});
			Profile.find.mockImplementation((q) => {
				captured.profileQuery = q;
				return { select: () => Promise.resolve([{ user: 'u1' }]) };
			});
			return captured;
		};

		it('does not 500 on an unbalanced bracket', async () => {
			// `new RegExp('(')` throws SyntaxError before any query runs.
			mockAdminAndCapture();
			const res = await request(app)
				.post('/api/searchUsers')
				.set('Authorization', authHeader(ADMIN_ID))
				.send({ username: '(' });
			// Unescaped this threw SyntaxError before any query ran.
			expect(res.status).not.toBe(500);
		});

		it('matches a plus-addressed email literally', async () => {
			// Unescaped, '+' is a quantifier: searching "a+b@x.com" also
			// matched "aaab@xYcom".
			const captured = mockAdminAndCapture();
			const res = await request(app)
				.post('/api/searchUsers')
				.set('Authorization', authHeader(ADMIN_ID))
				.send({ email: 'a+b@x.com' });
			expect(res.status).not.toBe(500);
			expect(captured.email.$regex.test('aaab@xYcom')).toBe(false);
			expect(captured.email.$regex.test('a+b@x.com')).toBe(true);
		});

		it('escapes every term, not just some of them', async () => {
			// escapeRegex already existed but was applied to gender only.
			const captured = mockAdminAndCapture();
			await request(app)
				.post('/api/searchUsers')
				.set('Authorization', authHeader(ADMIN_ID))
				.send({
					username: 'a.b',
					email: 'c+d',
					firstname: 'e(f',
					lastname: 'g|h',
					phoneNumber: '+212',
				});
			expect(captured.username.$regex.source).toContain('a\\.b');
			expect(captured.email.$regex.source).toContain('c\\+d');
			expect(captured.profileQuery.firstname.$regex.source).toContain('e\\(f');
			expect(captured.profileQuery.lastname.$regex.source).toContain('g\\|h');
			// This one is evaluated by the MongoDB server, not by Node.
			expect(captured.$expr.$regexMatch.regex).toBe('\\+212');
		});

		it('builds a regex that cannot backtrack catastrophically', async () => {
			// Unescaped, '(a+)+$' took ~36s against a 30-char string and, being
			// single-threaded, blocked every other request with it. Asserting
			// the response is fast would prove nothing here -- the mocked
			// query never runs the pattern -- so run the regex the controller
			// actually built against an adversarial input and time that.
			const captured = mockAdminAndCapture();
			await request(app)
				.post('/api/searchUsers')
				.set('Authorization', authHeader(ADMIN_ID))
				.send({ username: '(a+)+$' });

			const built = captured.username.$regex;
			const adversarial = 'a'.repeat(30) + '!';
			const started = Date.now();
			built.test(adversarial);
			expect(Date.now() - started).toBeLessThan(1000);
			// And it still means what the admin typed, literally.
			expect(built.test('(a+)+$')).toBe(true);
		});
	});
});

describe('PATCH /api/users/:userId/admin (role assignment, issue #183)', () => {
	it('reassigns an already-admin user to a different role rather than rejecting the request', async () => {
		// This route used to only ever promote a non-admin once and 400 on
		// anyone already an admin. Role assignment needs the opposite: a
		// principal reassigning someone's role IS an already-admin user.
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockImplementation((id) => {
			if (id === ADMIN_ID) return resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'principal' });
			return resolveTo({ _id: 'target', isAdmin: true, role: 'event', save });
		});
		const res = await request(app)
			.patch('/api/users/target/admin')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ role: 'emergency' });
		expect(res.status).toBe(200);
		expect(save).toHaveBeenCalled();
		expect(res.body.role).toBe('emergency');
	});

	it('rejects an invalid role', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'principal' }));
		const res = await request(app)
			.patch('/api/users/target/admin')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ role: 'superadmin' });
		expect(res.status).toBe(400);
	});

	it('defaults to principal when no role is sent in the body', async () => {
		// The existing frontend "make admin" action (UserDetailView.tsx) calls
		// this route with no body at all -- see the comment in
		// controllers/user.js. Preserves that exact behavior until issue #351's
		// role-picker UI ships and starts sending an explicit role.
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'principal' })
				: resolveTo({ _id: 'target', isAdmin: false, save })
		);
		const res = await request(app)
			.patch('/api/users/target/admin')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.role).toBe('principal');
		expect(save).toHaveBeenCalled();
	});

	it('rejects a non-principal admin, even though they pass the base admin check', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'event' }));
		const res = await request(app)
			.patch('/api/users/target/admin')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ role: 'emergency' });
		expect(res.status).toBe(403);
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

describe('contact-field validation on profile updates (issue #396)', () => {
	// Signup validated email and phone carefully; the endpoints that change
	// them had no validator chain at all, and the schema declares email as a
	// bare String. Email is the only account-recovery channel, so a
	// malformed address quietly makes the account unrecoverable.
	const mockSelf = () => {
		const profileSave = jest.fn().mockResolvedValue(true);
		const userSave = jest.fn().mockResolvedValue(true);
		User.findById.mockReturnValue(
			resolveTo({
				_id: USER_ID,
				isAdmin: true,
				save: userSave,
				profile: { save: profileSave },
			})
		);
		return { profileSave, userSave };
	};

	it('rejects a malformed email on PATCH /api/user/profile and stores nothing', async () => {
		const { userSave } = mockSelf();
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ email: 'not-an-email' });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/valid email/i);
		expect(userSave).not.toHaveBeenCalled();
	});

	it('rejects a malformed email on the admin PUT /api/users/:userId', async () => {
		mockSelf();
		const res = await request(app)
			.put(`/api/users/${USER_ID}`)
			.set('Authorization', authHeader(USER_ID))
			.send({ email: 'still-not-an-email' });
		expect(res.status).toBe(400);
	});

	it('rejects a phone number that is not a phone number', async () => {
		const { userSave } = mockSelf();
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ phoneNumber: 'call me maybe' });
		expect(res.status).toBe(400);
		expect(userSave).not.toHaveBeenCalled();
	});

	it('still accepts both the E.164 and the local phone formats in use', async () => {
		// The admin edit form posts local-format numbers and older records
		// hold them, so this rule is deliberately looser than signup's.
		for (const phoneNumber of ['+212600000000', '0600000001']) {
			mockSelf();
			const res = await request(app)
				.patch('/api/user/profile')
				.set('Authorization', authHeader(USER_ID))
				.send({ phoneNumber });
			expect(res.status).toBe(200);
		}
	});

	it('leaves an update with no contact fields alone', async () => {
		mockSelf();
		const res = await request(app)
			.patch('/api/user/profile')
			.set('Authorization', authHeader(USER_ID))
			.send({ firstname: 'New' });
		expect(res.status).toBe(200);
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

	// The :userId param used to be ignored entirely -- asking for someone
	// else's dashboard silently returned your own. See issue #397.
	it('refuses another user\'s dashboard instead of silently returning your own', async () => {
		const OTHER_ID = '507f1f77bcf86cd799439022';
		User.findById.mockReturnValue(resolveTo({ _id: OTHER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));
		const res = await request(app)
			.get(`/api/users/${OTHER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(403);
		// Crucially it must not have answered with the caller's own data.
		expect(res.body.donations).toBeUndefined();
		expect(res.body.stats).toBeUndefined();
	});

	it('reports a missing user with the key the frontend actually reads', async () => {
		// Was `errorMessage`, which the shared error toast never looks at.
		User.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(404);
		expect(res.body.message).toBeDefined();
		expect(res.body.errorMessage).toBeUndefined();
	});

	it('routes an unexpected failure through the shared error handler', async () => {
		// Used to answer directly with { errorMessage: err.message }, handing
		// the client raw driver text and logging nothing.
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockImplementation(() => {
			throw new Error('db down');
		});
		const res = await request(app)
			.get(`/api/users/${USER_ID}/dashboard`)
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(500);
		expect(res.body.message).toBe(GENERIC_SERVER_ERROR);
		expect(res.body.errorMessage).toBeUndefined();
		expect(JSON.stringify(res.body)).not.toContain('db down');
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

	it('returns site-wide counts for admins, including total emergencies (issue #302)', async () => {
		// The 4th admin-dashboard stat card used to duplicate totalDonations
		// instead of showing a distinct metric -- this pins the fix.
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		User.countDocuments.mockReturnValue(resolveTo(12));
		Event.countDocuments.mockReturnValue(resolveTo(3));
		Donation.countDocuments.mockReturnValue(resolveTo(27));
		Emergency.countDocuments.mockReturnValue(resolveTo(5));

		const res = await request(app)
			.get('/api/admin/stats')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			totalUsers: 12,
			totalEvents: 3,
			totalDonations: 27,
			totalEmergencies: 5,
		});
	});

	it('counts every emergency, confirmed or not (issue #302)', async () => {
		// Distinct from GET /api/unconfirmedEmergencies, which filters on
		// isConfirmed: false -- this card is a running total, matching the
		// other three (totalUsers/totalEvents/totalDonations).
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		User.countDocuments.mockReturnValue(resolveTo(0));
		Event.countDocuments.mockReturnValue(resolveTo(0));
		Donation.countDocuments.mockReturnValue(resolveTo(0));
		Emergency.countDocuments.mockReturnValue(resolveTo(9));

		const res = await request(app)
			.get('/api/admin/stats')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.body.totalEmergencies).toBe(9);
		expect(Emergency.countDocuments).toHaveBeenCalledWith();
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

describe('GET /api/users (admin only -- regression for issue #312: this route had no auth at all)', () => {
	it('rejects an unauthenticated caller', async () => {
		const res = await request(app).get('/api/users');
		expect(res.status).toBe(401);
	});

	it('rejects a non-admin caller', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, isAdmin: false }));
		const res = await request(app)
			.get('/api/users')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(403);
	});

	it('returns paginated users with gender falling back to profile.gender', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
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
		const res = await request(app)
			.get('/api/users')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(2);
		expect(res.body.users[0].gender).toBe('male');
		expect(res.body.users[1].gender).toBe('female');
	});

	it('returns 500 on a database error', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		User.countDocuments.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.get('/api/users')
			.set('Authorization', authHeader(ADMIN_ID));
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

	// Previously nothing cleaned up the deleted user's Profile -- a
	// permanently orphaned document, unbounded and never queried again. See
	// #375.
	// Donations and participations used to be left pointing at the deleted
	// user, and both are read as counts, so admin statistics silently
	// included people who no longer exist. See issue #406.
	it('anonymises the deleted user\'s donations rather than removing them', async () => {
		User.findOneAndDelete.mockReturnValue(resolveTo({ _id: 'user-bob-id', username: 'bob' }));
		Profile.deleteOne.mockReturnValue(resolveTo({ deletedCount: 1 }));
		Donation.updateMany.mockReturnValue(Promise.resolve({ modifiedCount: 2 }));
		Participant.deleteMany.mockReturnValue(resolveTo({ deletedCount: 1 }));

		const res = await request(app)
			.delete('/api/deleteUser/bob')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.status).toBe(200);
		// Kept, with the link to the person severed: the blood really was
		// collected, so it stays in the association's historical totals.
		expect(Donation.updateMany).toHaveBeenCalledWith(
			{ userId: 'user-bob-id' },
			{ $unset: { userId: 1 } }
		);
		expect(Donation.deleteMany).not.toHaveBeenCalled();
	});

	it('removes the deleted user\'s event participations', async () => {
		User.findOneAndDelete.mockReturnValue(resolveTo({ _id: 'user-bob-id', username: 'bob' }));
		Profile.deleteOne.mockReturnValue(resolveTo({ deletedCount: 1 }));
		Donation.updateMany.mockReturnValue(Promise.resolve({ modifiedCount: 0 }));
		Participant.deleteMany.mockReturnValue(resolveTo({ deletedCount: 1 }));

		const res = await request(app)
			.delete('/api/deleteUser/bob')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.status).toBe(200);
		// A registration means nothing without the person, and it would
		// otherwise hold that (userId, eventId) unique slot forever.
		expect(Participant.deleteMany).toHaveBeenCalledWith({ userId: 'user-bob-id' });
	});

	it('also deletes the profile belonging to the deleted user', async () => {
		User.findOneAndDelete.mockReturnValue(resolveTo({ _id: 'user-bob-id', username: 'bob' }));
		Profile.deleteOne.mockReturnValue(resolveTo({ deletedCount: 1 }));
		const res = await request(app)
			.delete('/api/deleteUser/bob')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(Profile.deleteOne).toHaveBeenCalledWith({ user: 'user-bob-id' });
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
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ role: 'emergency' });
		expect(res.status).toBe(404);
	});

	it('promotes a non-admin user to the given role', async () => {
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID
				? resolveTo({ _id: ADMIN_ID, isAdmin: true })
				: resolveTo({ _id: id, isAdmin: false, save })
		);
		const res = await request(app)
			.patch(`/api/users/${USER_ID}/admin`)
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ role: 'event' });
		expect(res.status).toBe(200);
		expect(save).toHaveBeenCalled();
		expect(res.body.role).toBe('event');
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
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ role: 'emergency' });
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

describe('User-management routes are Principal-Admin-only (issue #183)', () => {
	it('an Event Admin is refused the users list', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'event' }));
		const res = await request(app)
			.get('/api/users')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(403);
	});

	it('an Emergency Admin is refused the users list', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'emergency' }));
		const res = await request(app)
			.get('/api/users')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(403);
	});

	it('a Principal Admin can reach the users list', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'principal' }));
		User.countDocuments.mockReturnValue(resolveTo(0));
		User.find.mockReturnValue({
			populate: () => ({ skip: () => ({ limit: () => Promise.resolve([]) }) }),
		});
		const res = await request(app)
			.get('/api/users')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
	});

	it('any admin role can still reach the dashboard stats -- not principal-restricted', async () => {
		// #183: "the event admin sees only the dashboard and the event icon",
		// "the emergency admin sees only the dashboard and a list icon" -- the
		// dashboard itself stays reachable by every admin role.
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'event' }));
		const res = await request(app)
			.get('/api/admin/stats')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
	});
});
