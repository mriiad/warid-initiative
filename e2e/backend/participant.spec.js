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

describe('POST /api/event/confirmPresence', () => {
	// The feature never worked: the frontend POSTed while the route was
	// registered as PUT (404), that PUT was itself shadowed by the earlier
	// admin-only `PUT /api/event/:reference` (403 for donors), and the
	// handler read req.body.reference while the client sends { eventId }.
	it('is reachable over POST and records a Participant, not a Donation', async () => {
		Event.findById.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		Participant.findOne.mockReturnValue(resolveTo(null));
		const donationsBefore = Donation.mock.calls.length;

		const res = await request(app)
			.post('/api/event/confirmPresence')
			.set('Authorization', authHeader(USER_ID))
			.send({ eventId: 'evt-1' });

		expect(res.status).toBe(200);
		expect(Participant).toHaveBeenCalledWith(
			expect.objectContaining({ userId: USER_ID, eventId: 'evt-1' })
		);
		// Crucially it must NOT create a Donation: that would count as a real
		// donation everywhere and start a 60/90-day cooldown for someone who
		// did not actually donate.
		expect(Donation.mock.calls.length).toBe(donationsBefore);
	});

	it('does not require the caller to be an admin', async () => {
		Event.findById.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		Participant.findOne.mockReturnValue(resolveTo(null));

		const res = await request(app)
			.post('/api/event/confirmPresence')
			.set('Authorization', authHeader(USER_ID))
			.send({ eventId: 'evt-1' });

		expect(res.status).not.toBe(403);
	});

	it('returns 404 for an unknown event', async () => {
		Event.findById.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.post('/api/event/confirmPresence')
			.set('Authorization', authHeader(USER_ID))
			.send({ eventId: 'nope' });
		expect(res.status).toBe(404);
	});

	it('returns 400 when no eventId is supplied', async () => {
		const res = await request(app)
			.post('/api/event/confirmPresence')
			.set('Authorization', authHeader(USER_ID))
			.send({});
		expect(res.status).toBe(400);
	});

	it('returns 409 when presence was already confirmed', async () => {
		Event.findById.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		Participant.findOne.mockReturnValue(resolveTo({ _id: 'p-1' }));
		const res = await request(app)
			.post('/api/event/confirmPresence')
			.set('Authorization', authHeader(USER_ID))
			.send({ eventId: 'evt-1' });
		expect(res.status).toBe(409);
	});

	it('requires authentication', async () => {
		const res = await request(app).post('/api/event/confirmPresence').send({ eventId: 'evt-1' });
		expect(res.status).toBe(401);
	});
});
