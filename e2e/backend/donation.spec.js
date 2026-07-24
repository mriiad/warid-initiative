const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/profile', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Donation = require('../../src/models/donation');
const Profile = require('../../src/models/profile');
const Event = require('../../src/models/event');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const USER_ID = '507f1f77bcf86cd799439011';

describe('GET / (regression: dead handler previously hung every request to the site root)', () => {
	it('does not hang and does not swallow the request before later middleware/routes', async () => {
		// donationRouter used to register `.get('/', (req, res, next) => {})`,
		// an empty handler that never called res.send() or next(). Mounted
		// ahead of express.static + the SPA fallback in the real app.js, it
		// silently captured every GET / and hung the request forever -- the
		// production site's actual homepage URL never resolved.
		await request(app).get('/').timeout(2000);
	});
});

describe('GET /api/donation/canDonate (fix: endpoint used to be completely broken)', () => {
	it('fix: reports eligibility instead of 500ing (never-donated user)', async () => {
		// src/controllers/donation.js `canDonate` used to call the bare
		// identifier `checkDonationEligibility(req.userId)` instead of
		// `exports.checkDonationEligibility(...)`. Only
		// `exports.checkDonationEligibility` exists on the module -- there was
		// no bare `checkDonationEligibility` in scope -- so this threw
		// `ReferenceError: checkDonationEligibility is not defined` on every
		// single call, regardless of mocked data. This endpoint backs the
		// eligibility badge/button shown to donors.
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));

		const res = await request(app)
			.get('/api/donation/canDonate')
			.set('Authorization', authHeader(USER_ID));

		expect(res.status).toBe(200);
		expect(res.body.canDonate).toBe(true);
	});

	it('fix: reports the real eligibility based on the user\'s donation history', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([{ donationDate: new Date() }]));

		const res = await request(app)
			.get('/api/donation/canDonate')
			.set('Authorization', authHeader(USER_ID));

		expect(res.status).toBe(200);
		expect(res.body.canDonate).toBe(false);
		expect(res.body.lastDonationDate).toBeTruthy();
	});
});

describe('POST /api/donation (regression test for issue #200)', () => {
	it('accepts a brand-new, fully-eligible user (fixed: eligibility promise is now awaited)', async () => {
		// A user who has never donated before: checkDonationEligibility()
		// resolves { canDonate: true, nextDonationDate: null }. donate() and
		// the checkExistingDonation() helper it calls both now correctly
		// await exports.checkDonationEligibility(...), so the request succeeds.
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));
		Event.findOne.mockReturnValue(resolveTo({ _id: 'event-1', isGeneric: true }));

		const res = await request(app)
			.post('/api/donation')
			.set('Authorization', authHeader(USER_ID))
			.send({ bloodGroup: 'O+', donationDate: new Date().toISOString(), donationType: 'BLOOD' });

		expect(res.status).toBe(201);
	});

	it('rejects a not-yet-eligible existing user with the real next-eligible date (not "undefined")', async () => {
		const recentDonationDate = new Date();
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([{ donationDate: recentDonationDate }]));

		const res = await request(app)
			.post('/api/donation')
			.set('Authorization', authHeader(USER_ID))
			.send({ bloodGroup: 'O+', donationDate: new Date().toISOString(), donationType: 'BLOOD' });

		expect(res.status).toBe(403);
		expect(res.body.errorMessage).not.toContain('undefined');
		expect(res.body.errorMessage).toMatch(/starting \d{2}\/\d{2}\/\d{4}/);
	});

	it('rejects a donation dated in the future', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([]));
		const tomorrow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

		const res = await request(app)
			.post('/api/donation')
			.set('Authorization', authHeader(USER_ID))
			.send({ bloodGroup: 'O+', donationDate: tomorrow.toISOString(), donationType: 'BLOOD' });

		expect(res.status).toBe(400);
		expect(res.body.errorMessage).toMatch(/future/i);
	});

	it('rejects a backdated donation that falls inside the rest period of the previous one, even if the donor is eligible again today', async () => {
		// Male cooldown is 60 days. The donor's last donation was 65 days ago,
		// so they're eligible to donate again as of today -- but they must
		// not be able to register the *new* donation with a date that's still
		// within 60 days of the *previous* one (e.g. backdating it to 5 days
		// after their last donation).
		const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
		const recentDonationDate = daysAgo(65);
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([{ donationDate: recentDonationDate }]));
		const backdatedWithinRestPeriod = new Date(recentDonationDate.getTime() + 5 * 24 * 60 * 60 * 1000);

		const res = await request(app)
			.post('/api/donation')
			.set('Authorization', authHeader(USER_ID))
			.send({
				bloodGroup: 'O+',
				donationDate: backdatedWithinRestPeriod.toISOString(),
				donationType: 'BLOOD',
			});

		expect(res.status).toBe(403);
		expect(res.body.errorMessage).toMatch(/rest period/i);
	});

	it('accepts a returning, eligible donor recording today\'s donation', async () => {
		const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, gender: 'male' }));
		Donation.find.mockReturnValue(resolveTo([{ donationDate: daysAgo(65) }]));
		Event.findOne.mockReturnValue(resolveTo({ _id: 'event-1', isGeneric: true }));

		const res = await request(app)
			.post('/api/donation')
			.set('Authorization', authHeader(USER_ID))
			.send({ bloodGroup: 'O+', donationDate: new Date().toISOString(), donationType: 'BLOOD' });

		expect(res.status).toBe(201);
	});
});

describe('GET /api/donation', () => {
	it('BUG: reports "No donation found" for a user who has donated, if their Profile is missing', async () => {
		Donation.find.mockReturnValue(
			resolveTo([{ donationDate: new Date(), eventId: 'event-1', toObject: () => ({}) }])
		);
		Profile.findOne.mockReturnValue(resolveTo(null));

		const res = await request(app)
			.get('/api/donation')
			.set('Authorization', authHeader(USER_ID));

		// A donation exists but has no matching Profile document -> the
		// handler throws "User profile not found." (404), which is a
		// confusing message for a request whose actual problem is a missing
		// profile, not a missing donation.
		expect(res.status).toBe(404);
		expect(res.body.errorMessage).toBe('User profile not found.');
	});

	it('returns donation details merged with profile blood group and event info', async () => {
		Donation.find.mockReturnValue(
			resolveTo([
				{
					donationDate: new Date('2026-01-01'),
					eventId: 'event-1',
					toObject: () => ({ donationDate: new Date('2026-01-01') }),
				},
			])
		);
		Profile.findOne.mockReturnValue(
			resolveTo({ select: () => Profile.findOne() })
		);
		// Profile.findOne(...).select('bloodGroup') needs to resolve to a doc.
		Profile.findOne.mockReturnValue({
			select: () => require('./support/mongooseMock').resolveTo({ bloodGroup: 'O+' }),
		});
		Event.findById.mockReturnValue(resolveTo({ title: 'Blood Drive', reference: 'WEVENT1', isGeneric: false }));

		const res = await request(app)
			.get('/api/donation')
			.set('Authorization', authHeader(USER_ID));

		expect(res.status).toBe(200);
		expect(res.body.bloodGroup).toBe('O+');
		expect(res.body.event.title).toBe('Blood Drive');
	});
});

describe('GET /api/donation/:username (admin only)', () => {
	it('rejects non-admin users with 403', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: USER_ID, isAdmin: false }));
		const res = await request(app)
			.get('/api/donation/someuser')
			.set('Authorization', authHeader(USER_ID));
		expect(res.status).toBe(403);
	});
});
