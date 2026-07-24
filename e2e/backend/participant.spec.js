const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/participant', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/profile', () => require('./support/mongooseMock').makeModelMock());

const Event = require('../../src/models/event');
const Participant = require('../../src/models/participant');
const Donation = require('../../src/models/donation');
const User = require('../../src/models/user');
const Profile = require('../../src/models/profile');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const USER_ID = '507f1f77bcf86cd799439011';

// checkDonationEligibility() (called to gate event participation) also
// checks age via the participant's Profile now.
const adultBirthdate = () => {
	const d = new Date();
	d.setFullYear(d.getFullYear() - 30);
	d.setDate(d.getDate() - 1);
	return d;
};

describe('POST /api/participate/:reference', () => {
	it('requires authentication', async () => {
		const res = await request(app).post('/api/participate/WEVENT1');
		expect(res.status).toBe(401);
	});

	it('returns 404 for an unknown event', async () => {
		Event.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/participate/DOES-NOT-EXIST')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(404);
	});

	it('registers an eligible user as a participant', async () => {
		Event.findOne.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));
		Profile.findOne.mockReturnValue(resolveTo({ birthdate: adultBirthdate() }));
		const res = await request(app)
			.post('/api/participate/WEVENT1')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(201);
	});

	it('blocks a not-yet-eligible user with the next eligible date', async () => {
		Event.findOne.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([{ donationDate: new Date() }]));
		Profile.findOne.mockReturnValue(resolveTo({ birthdate: adultBirthdate() }));
		const res = await request(app)
			.post('/api/participate/WEVENT1')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(403);
		expect(res.body.message).toMatch(/cannot donate yet/);
	});
});

describe('GET /api/check/:reference', () => {
	it('reports no participation for a fresh event/user pair', async () => {
		Event.findOne.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		Participant.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.get('/api/check/WEVENT1')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(200);
		expect(res.body.hasParticipated).toBe(false);
	});
});
