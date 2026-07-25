const request = require('supertest');
const { resolveTo, makeQuery } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/emergency', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/profile', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Emergency = require('../../src/models/emergency');
const Donation = require('../../src/models/donation');
const Profile = require('../../src/models/profile');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const ADMIN_ID = '507f1f77bcf86cd799439099';

// checkDonationEligibility() (called per-candidate by getEmergencyMatchUsers)
// now also checks the donor's age via their Profile, so every candidate
// needs an eligible birthdate unless a test is specifically about age.
const birthdateForAge = (age) => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - age);
	d.setDate(d.getDate() - 1);
	return d;
};
const adultBirthdate = () => birthdateForAge(30);

describe('POST /api/emergency (public)', () => {
	it('creates an emergency without authentication', async () => {
		const res = await request(app)
			.post('/api/emergency')
			.send({ bloodGroup: 'O+', city: 'Casablanca', phoneNumber: '0600000000', details: 'Urgent' });
		expect(res.status).toBe(201);
	});
});

describe('GET /api/unconfirmedEmergencies (admin only)', () => {
	it('rejects non-admin callers', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: 'user-1', isAdmin: false }));
		const res = await request(app)
			.get('/api/unconfirmedEmergencies')
			.set('Authorization', authHeader('user-1'));
		expect(res.status).toBe(403);
	});

	it('lists unconfirmed emergencies for an admin', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		Emergency.find.mockReturnValue(resolveTo([{ bloodGroup: 'O+', city: 'Casablanca' }]));
		Emergency.countDocuments.mockReturnValue(resolveTo(1));
		const res = await request(app)
			.get('/api/unconfirmedEmergencies')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(1);
	});
});

describe('PATCH /api/emergencies/:id/confirm (admin only)', () => {
	it('returns 404 for an unknown emergency', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		Emergency.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.patch('/api/emergencies/does-not-exist/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('confirms a known emergency', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		const save = jest.fn().mockResolvedValue(true);
		Emergency.findById.mockReturnValue(resolveTo({ isConfirmed: false, save }));
		const res = await request(app)
			.patch('/api/emergencies/em-1/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(save).toHaveBeenCalled();
	});
});

describe('PATCH /api/emergencies/:emergencyId/matchedUsers/:userId/confirm (admin only)', () => {
	it('returns 404 when the target user does not exist', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo(null)
		);
		Emergency.findById.mockReturnValue(resolveTo({ contactedUsers: [], save: jest.fn() }));
		const res = await request(app)
			.patch('/api/emergencies/em-1/matchedUsers/ghost/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('returns 404 when the emergency does not exist', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		Emergency.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.patch('/api/emergencies/does-not-exist/matchedUsers/user-1/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('adds a not-yet-contacted user to contactedUsers', async () => {
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo({ _id: id })
		);
		const emergency = { contactedUsers: [], save };
		Emergency.findById.mockReturnValue(resolveTo(emergency));
		const res = await request(app)
			.patch('/api/emergencies/em-1/matchedUsers/user-1/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(emergency.contactedUsers).toContain('user-1');
		expect(save).toHaveBeenCalled();
	});

	it('does not duplicate an already-contacted user', async () => {
		const save = jest.fn().mockResolvedValue(true);
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo({ _id: id })
		);
		const emergency = { contactedUsers: ['user-1'], save };
		Emergency.findById.mockReturnValue(resolveTo(emergency));
		const res = await request(app)
			.patch('/api/emergencies/em-1/matchedUsers/user-1/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(emergency.contactedUsers).toEqual(['user-1']);
	});

	it('returns 500 when saving fails', async () => {
		User.findById.mockImplementation((id) =>
			id === ADMIN_ID ? resolveTo({ _id: ADMIN_ID, isAdmin: true }) : resolveTo({ _id: id })
		);
		Emergency.findById.mockReturnValue(
			resolveTo({ contactedUsers: [], save: jest.fn().mockRejectedValue(new Error('db down')) })
		);
		const res = await request(app)
			.patch('/api/emergencies/em-1/matchedUsers/user-1/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});
});

describe('GET /api/emergencies/:id/matchingUsers (admin only)', () => {
	beforeEach(() => {
		Donation.find.mockReturnValue(resolveTo([]));
		Profile.findOne.mockReturnValue(resolveTo({ birthdate: adultBirthdate() }));
	});

	it('returns 404 when the emergency does not exist', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		Emergency.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.get('/api/emergencies/does-not-exist/matchingUsers')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(404);
	});

	it('matches users by blood group and city, excludes already-contacted users, and checks donation eligibility', async () => {
		Emergency.findById.mockReturnValue(
			resolveTo({
				_id: 'em-1',
				bloodGroup: 'O+',
				city: 'Casablanca',
				contactedUsers: ['already-contacted'],
			})
		);
		User.find.mockReturnValue(
			resolveTo([
				{
					_id: 'match-1',
					phoneNumber: '0600000001',
					gender: 'male',
					profile: { bloodGroup: 'O+', city: 'Casablanca', firstname: 'A', lastname: 'B' },
				},
				{
					_id: 'wrong-blood-group',
					phoneNumber: '0600000002',
					gender: 'male',
					profile: { bloodGroup: 'A+', city: 'Casablanca', firstname: 'C', lastname: 'D' },
				},
				{
					_id: 'already-contacted',
					phoneNumber: '0600000003',
					gender: 'male',
					profile: { bloodGroup: 'O+', city: 'Casablanca', firstname: 'E', lastname: 'F' },
				},
			])
		);
		User.findById.mockImplementation((id) =>
			resolveTo(id === ADMIN_ID ? { _id: ADMIN_ID, isAdmin: true } : { _id: id, gender: 'male' })
		);
		const res = await request(app)
			.get('/api/emergencies/em-1/matchingUsers')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(1);
		expect(res.body.matchingUsers[0]._id).toBe('match-1');
		expect(res.body.matchingUsers[0].bloodGroup).toBe('O+');
	});

	it('matches donors by ABO/Rh compatibility, not exact blood-group equality', async () => {
		// AB+ is the universal recipient: every blood group is a compatible
		// donor for it. O- is the universal donor: it must show up for any
		// requested blood group, even blood groups it doesn't literally equal.
		Emergency.findById.mockReturnValue(
			resolveTo({ _id: 'em-1', bloodGroup: 'AB+', city: 'Casablanca', contactedUsers: [] })
		);
		User.find.mockReturnValue(
			resolveTo([
				{
					_id: 'donor-o-negative',
					phoneNumber: '0600000001',
					gender: 'male',
					profile: { bloodGroup: 'O-', city: 'Casablanca', firstname: 'A', lastname: 'B' },
				},
				{
					_id: 'donor-b-positive',
					phoneNumber: '0600000002',
					gender: 'male',
					profile: { bloodGroup: 'B+', city: 'Casablanca', firstname: 'C', lastname: 'D' },
				},
			])
		);
		User.findById.mockImplementation((id) =>
			resolveTo(id === ADMIN_ID ? { _id: ADMIN_ID, isAdmin: true } : { _id: id, gender: 'male' })
		);
		const res = await request(app)
			.get('/api/emergencies/em-1/matchingUsers')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(2);
		expect(res.body.matchingUsers.map((u) => u._id).sort()).toEqual([
			'donor-b-positive',
			'donor-o-negative',
		]);
	});

	it('only matches O- donors for an O- emergency (the most restrictive case)', async () => {
		Emergency.findById.mockReturnValue(
			resolveTo({ _id: 'em-1', bloodGroup: 'O-', city: 'Casablanca', contactedUsers: [] })
		);
		User.find.mockReturnValue(
			resolveTo([
				{
					_id: 'donor-o-negative',
					phoneNumber: '0600000001',
					gender: 'male',
					profile: { bloodGroup: 'O-', city: 'Casablanca', firstname: 'A', lastname: 'B' },
				},
				{
					_id: 'donor-o-positive',
					phoneNumber: '0600000002',
					gender: 'male',
					profile: { bloodGroup: 'O+', city: 'Casablanca', firstname: 'C', lastname: 'D' },
				},
			])
		);
		User.findById.mockImplementation((id) =>
			resolveTo(id === ADMIN_ID ? { _id: ADMIN_ID, isAdmin: true } : { _id: id, gender: 'male' })
		);
		const res = await request(app)
			.get('/api/emergencies/em-1/matchingUsers')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(1);
		expect(res.body.matchingUsers[0]._id).toBe('donor-o-negative');
	});

	it('excludes users who are not currently eligible to donate', async () => {
		Emergency.findById.mockReturnValue(
			resolveTo({ _id: 'em-1', bloodGroup: 'O+', city: 'Casablanca', contactedUsers: [] })
		);
		User.find.mockReturnValue(
			resolveTo([
				{
					_id: 'not-eligible',
					phoneNumber: '0600000001',
					gender: 'male',
					profile: { bloodGroup: 'O+', city: 'Casablanca', firstname: 'A', lastname: 'B' },
				},
			])
		);
		User.findById.mockImplementation((id) =>
			resolveTo(id === ADMIN_ID ? { _id: ADMIN_ID, isAdmin: true } : { _id: id, gender: 'male' })
		);
		Donation.find.mockReturnValue(resolveTo([{ donationDate: new Date() }]));
		const res = await request(app)
			.get('/api/emergencies/em-1/matchingUsers')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(0);
	});
});

describe('error handling', () => {
	it('getUnconfirmedEmergencies returns 500 on a database error', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		Emergency.find.mockReturnValue(
			makeQuery(() => {
				throw new Error('db down');
			})
		);
		const res = await request(app)
			.get('/api/unconfirmedEmergencies')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});

	it('createEmergency returns 500 when saving fails', async () => {
		Emergency.mockImplementationOnce(function (data) {
			Object.assign(this, data);
			this.save = jest.fn().mockRejectedValue(new Error('db down'));
			return this;
		});
		const res = await request(app)
			.post('/api/emergency')
			.send({ bloodGroup: 'O+', city: 'Casablanca', phoneNumber: '0600000000', details: 'Urgent' });
		expect(res.status).toBe(500);
	});

	it('confirmEmergency returns 500 when saving fails', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
		Emergency.findById.mockReturnValue(
			resolveTo({ isConfirmed: false, save: jest.fn().mockRejectedValue(new Error('db down')) })
		);
		const res = await request(app)
			.patch('/api/emergencies/em-1/confirm')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(500);
	});
});
