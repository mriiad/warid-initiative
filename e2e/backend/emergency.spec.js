const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/emergency', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Emergency = require('../../src/models/emergency');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const ADMIN_ID = '507f1f77bcf86cd799439099';

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
});
