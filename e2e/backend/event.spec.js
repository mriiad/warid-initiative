const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/participant', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Event = require('../../src/models/event');
const Donation = require('../../src/models/donation');
const Participant = require('../../src/models/participant');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const ADMIN_ID = '507f1f77bcf86cd799439011';

function mockAdmin() {
	User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true }));
}

describe('GET /api/events', () => {
	// The tests below assert on the filter object handed to Event.find, so
	// each needs a clean call log. clearAllMocks resets recorded calls
	// without touching the implementations each test sets up itself.
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// A query whose chain methods are spies, so the test can assert what the
	// controller asked the database for rather than only what came back.
	const spyQuery = (rows) => {
		const query = {
			sort: jest.fn(() => query),
			skip: jest.fn(() => query),
			limit: jest.fn(() => query),
			lean: jest.fn(() => query),
			then: (onResolve, onReject) =>
				Promise.resolve(rows).then(onResolve, onReject),
			catch: (onReject) => Promise.resolve(rows).catch(onReject),
		};
		return query;
	};

	it('lists events with pagination info', async () => {
		Event.countDocuments.mockReturnValue(resolveTo(2));
		Event.find.mockReturnValue(resolveTo([{ reference: 'WEVENT1' }, { reference: 'WEVENT2' }]));

		const res = await request(app).get('/api/events');
		expect(res.status).toBe(200);
		expect(res.body.totalItems).toBe(2);
		expect(res.body.events).toHaveLength(2);
	});

	// Without a sort the natural (insertion) order puts the oldest events on
	// page 1, so once five past events accumulated the donor list -- which
	// drops past events -- went permanently empty while upcoming ones sat on
	// later pages. See issue #417.
	it('orders events by date so the pages walk a meaningful sequence', async () => {
		const query = spyQuery([]);
		Event.countDocuments.mockReturnValue(resolveTo(0));
		Event.find.mockReturnValue(query);

		await request(app).get('/api/events');

		expect(query.sort).toHaveBeenCalledWith({ date: 1 });
	});

	it('returns every event when no filters are given', async () => {
		Event.countDocuments.mockReturnValue(resolveTo(30));
		Event.find.mockReturnValue(resolveTo([]));

		const res = await request(app).get('/api/events?page=2');

		expect(res.status).toBe(200);
		expect(Event.find).toHaveBeenCalledWith({});
		expect(Event.countDocuments).toHaveBeenCalledWith({});
		expect(res.body.totalItems).toBe(30);
	});

	// The donor list's filters. They live here rather than in the client
	// because the client could only filter the page it had already been
	// given, and then had no honest way to count the pages.
	it('filters out past events when asked for upcoming ones only', async () => {
		Event.countDocuments.mockReturnValue(resolveTo(7));
		Event.find.mockReturnValue(resolveTo([]));

		await request(app).get('/api/events?page=1&upcoming=true');

		const filter = Event.find.mock.calls[0][0];
		expect(filter.date.$gte).toBeInstanceOf(Date);
		// Start of today, so an event happening later today still counts.
		expect(filter.date.$gte.getHours()).toBe(0);
		expect(filter.date.$gte.getMinutes()).toBe(0);
	});

	it('excludes generic events when asked to', async () => {
		Event.countDocuments.mockReturnValue(resolveTo(4));
		Event.find.mockReturnValue(resolveTo([]));

		await request(app).get('/api/events?page=1&includeGeneric=false');

		expect(Event.find).toHaveBeenCalledWith({ isGeneric: { $ne: true } });
	});

	// The heart of the bug: totalItems has to describe the same set the page
	// was drawn from, or ceil(totalItems / perPage) is not a page count.
	it('counts the filtered set, not every event in the collection', async () => {
		Event.countDocuments.mockReturnValue(resolveTo(7));
		Event.find.mockReturnValue(resolveTo([]));

		const res = await request(app).get(
			'/api/events?page=1&upcoming=true&includeGeneric=false'
		);

		expect(res.body.totalItems).toBe(7);
		const countFilter = Event.countDocuments.mock.calls[0][0];
		const findFilter = Event.find.mock.calls[0][0];
		expect(countFilter).toEqual(findFilter);
		expect(findFilter.isGeneric).toEqual({ $ne: true });
		expect(findFilter.date.$gte).toBeInstanceOf(Date);
	});
});

describe('GET /api/events/:reference', () => {
	it('returns 404 for an unknown reference', async () => {
		Event.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app).get('/api/events/DOES-NOT-EXIST');
		expect(res.status).toBe(404);
	});

	it('strips the QR code for anonymous requests', async () => {
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT1', title: 'Drive', qrCode: 'data:image/png;base64,XXXX' })
		);
		const res = await request(app).get('/api/events/WEVENT1');
		expect(res.status).toBe(200);
		expect(res.body.event.qrCode).toBeUndefined();
	});

	// This endpoint is public and did its own inline check, which only ever
	// looked at isAdmin -- granting QR-code visibility to any admin role,
	// including one (Emergency Admin) with no event-management access at
	// all. See #371.
	it('strips the QR code for an Emergency Admin', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'emergency' }));
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT1', title: 'Drive', qrCode: 'data:image/png;base64,XXXX' })
		);
		const res = await request(app)
			.get('/api/events/WEVENT1')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.event.qrCode).toBeUndefined();
	});

	it('includes the QR code for an Event Admin', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'event' }));
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT1', title: 'Drive', qrCode: 'data:image/png;base64,XXXX' })
		);
		const res = await request(app)
			.get('/api/events/WEVENT1')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.event.qrCode).toBe('data:image/png;base64,XXXX');
	});

	it('includes the QR code for a Principal Admin', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'principal' }));
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT1', title: 'Drive', qrCode: 'data:image/png;base64,XXXX' })
		);
		const res = await request(app)
			.get('/api/events/WEVENT1')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.event.qrCode).toBe('data:image/png;base64,XXXX');
	});

	it('includes the QR code for a pre-#183 admin with no role assigned', async () => {
		mockAdmin(); // isAdmin: true, no role field.
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT1', title: 'Drive', qrCode: 'data:image/png;base64,XXXX' })
		);
		const res = await request(app)
			.get('/api/events/WEVENT1')
			.set('Authorization', authHeader(ADMIN_ID));
		expect(res.status).toBe(200);
		expect(res.body.event.qrCode).toBe('data:image/png;base64,XXXX');
	});
});

describe('POST /api/event (admin only)', () => {
	it('rejects requests without a token', async () => {
		const res = await request(app).post('/api/event').send({});
		expect(res.status).toBe(401);
	});

	it('rejects non-admin users', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: 'user-1', isAdmin: false }));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader('user-1'))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01');
		expect(res.status).toBe(403);
	});

	it('rejects a missing title with a validation error', async () => {
		mockAdmin();
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('location', 'Casablanca')
			.field('date', '2099-01-01');
		expect(res.status).toBe(422);
	});

	it('rejects a past date', async () => {
		mockAdmin();
		Event.exists.mockReturnValue(Promise.resolve(false));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2020-01-01');
		expect(res.status).toBe(400);
	});

	it('reports a duplicate event date as 409 (fixed: STATUS_CODE.CONFLICT now defined)', async () => {
		// httpStatusCode.js's STATUS_CODE map was missing a CONFLICT entry, so
		// `STATUS_CODE.CONFLICT` was `undefined` and error-handler.js's
		// `if (!error.statusCode) error.statusCode = STATUS_CODE.INTERNAL_SERVER`
		// silently downgraded every conflict here to 500. Same root cause
		// affected the "no generic event to reassign donations" path in
		// deleteEvent and the "already confirmed presence" path in
		// confirmPresence -- both now also return 409 correctly.
		mockAdmin();
		Event.exists.mockReturnValue(Promise.resolve(true));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01');
		expect(res.status).toBe(409);
		expect(res.body.message).toMatch(/already exists for this date/);
	});

	it('creates an event for a valid admin request', async () => {
		mockAdmin();
		Event.exists.mockReturnValue(Promise.resolve(false));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01')
			.field('isGeneric', 'false');
		expect(res.status).toBe(201);
		expect(res.body.event.reference).toBe('WEVENT20990101');
	});

	// Both of these used to bypass createEventHandler entirely: multer's own
	// error handling runs before the route handler, so a raw error reached
	// the shared error handler unconverted and produced a generic
	// "Something went wrong" instead of a message about the file. See #370.
	it('rejects a non-image upload with a friendly message, not a generic 500', async () => {
		mockAdmin();
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01')
			.attach('image', Buffer.from('not an image'), { filename: 'notes.txt', contentType: 'text/plain' });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/only image uploads are allowed/i);
	});

	it('rejects a file over 5MB with a friendly message, not a generic 500', async () => {
		mockAdmin();
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01')
			.attach('image', Buffer.alloc(6 * 1024 * 1024), { filename: 'big.png', contentType: 'image/png' });
		expect(res.status).toBe(412);
		expect(res.body.message).toMatch(/smaller than 5MB/i);
	});
});

describe('PUT /api/event/:reference (admin only, BUG regression for issue #205/#202)', () => {
	it('returns 404 when the event does not exist', async () => {
		mockAdmin();
		Event.findOne.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.put('/api/event/WEVENT-MISSING')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'New title')
			.field('location', 'Rabat')
			.field('date', '2099-01-01');
		expect(res.status).toBe(404);
	});

	it('rejects changing the event date (reference/date coupling)', async () => {
		mockAdmin();
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT20990101', date: new Date('2099-01-01') })
		);
		const res = await request(app)
			.put('/api/event/WEVENT20990101')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'New title')
			.field('location', 'Rabat')
			.field('date', '2099-02-02');
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/inconsistency/);
	});

	it('updates title/location/description for a same-date update', async () => {
		mockAdmin();
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT20990101', date: new Date('2099-01-01'), image: null })
		);
		Event.findOneAndUpdate.mockReturnValue(
			resolveTo({
				reference: 'WEVENT20990101',
				_id: 'evt-1',
				title: 'New title',
				subtitle: undefined,
				location: 'Rabat',
				date: new Date('2099-01-01'),
				isGeneric: false,
			})
		);
		const res = await request(app)
			.put('/api/event/WEVENT20990101')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'New title')
			.field('location', 'Rabat')
			.field('date', '2099-01-01');
		expect(res.status).toBe(200);
		expect(res.body.event.title).toBe('New title');
	});
});

describe('DELETE /api/event (admin only)', () => {
	it('returns 404 for an unknown reference', async () => {
		mockAdmin();
		Event.findOneAndDelete.mockReturnValue(resolveTo(null));
		const res = await request(app)
			.delete('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ reference: 'DOES-NOT-EXIST' });
		expect(res.status).toBe(404);
	});

	// Donations were reassigned to the generic event so donation history/
	// eligibility stays intact, but nothing cleaned up Participant records
	// for the deleted event -- left dangling, referencing an eventId that no
	// longer exists. See #375.
	it('also deletes Participant records for the deleted event (no donations to reassign)', async () => {
		mockAdmin();
		Event.findOneAndDelete.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		Donation.find.mockReturnValue(resolveTo([]));
		Participant.deleteMany.mockReturnValue(resolveTo({ deletedCount: 2 }));
		const res = await request(app)
			.delete('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ reference: 'WEVENT1' });
		expect(res.status).toBe(200);
		expect(Participant.deleteMany).toHaveBeenCalledWith({ eventId: 'evt-1' });
	});

	it('also deletes Participant records for the deleted event (donations reassigned)', async () => {
		mockAdmin();
		Event.findOneAndDelete.mockReturnValue(resolveTo({ _id: 'evt-1', reference: 'WEVENT1' }));
		Donation.find.mockReturnValue(resolveTo([{ _id: 'don-1' }]));
		Event.findOne.mockReturnValue(resolveTo({ _id: 'generic-evt', isGeneric: true }));
		Donation.findByIdAndUpdate.mockReturnValue(resolveTo({}));
		Participant.deleteMany.mockReturnValue(resolveTo({ deletedCount: 1 }));
		const res = await request(app)
			.delete('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.send({ reference: 'WEVENT1' });
		expect(res.status).toBe(200);
		expect(Participant.deleteMany).toHaveBeenCalledWith({ eventId: 'evt-1' });
	});
});

describe('POST /api/event/confirmPresence', () => {
	it('requires authentication', async () => {
		// Was asserting against .put(...) here, which never actually reached
		// this route -- PUT /api/event/:reference (registered earlier) matched
		// first with reference="confirmPresence" and 401'd from *its* isAuth
		// check instead. Passed for the wrong reason; see the routing comment
		// on POST /api/event/confirmPresence in src/routes/event.js.
		const res = await request(app).post('/api/event/confirmPresence').send({ reference: 'WEVENT1' });
		expect(res.status).toBe(401);
	});
});

describe('Event routes are role-gated (issue #183)', () => {
	it('an Event Admin can create an event', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'event' }));
		Event.exists.mockReturnValue(Promise.resolve(false));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01');
		expect(res.status).toBe(201);
	});

	it('an Emergency Admin is refused event creation', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'emergency' }));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01');
		expect(res.status).toBe(403);
	});

	it('a Principal Admin can still create an event (full access)', async () => {
		User.findById.mockReturnValue(resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'principal' }));
		Event.exists.mockReturnValue(Promise.resolve(false));
		const res = await request(app)
			.post('/api/event')
			.set('Authorization', authHeader(ADMIN_ID))
			.field('title', 'Drive')
			.field('location', 'Casablanca')
			.field('date', '2099-01-01');
		expect(res.status).toBe(201);
	});
});

describe('GET /api/event/:reference/participants/details (issue #406)', () => {
	// Anonymised donations (donor account deleted) carry no userId, and
	// distinct() folds every one of them into a single null -- counting that
	// would report "1 donor" for any number of them. The query must exclude
	// them so the figure counts identifiable donors and never invents one.
	it('excludes donations whose donor was deleted from the donater count', async () => {
		mockAdmin();
		Event.findOne.mockReturnValue(
			resolveTo({ _id: 'evt-1', reference: 'WEVENT1', isGeneric: false })
		);
		const distinctCalls = [];
		Donation.distinct.mockImplementation((field, filter) => {
			distinctCalls.push({ field, filter });
			return Promise.resolve(['u1', 'u2']);
		});
		Participant.countDocuments.mockReturnValue(resolveTo(2));
		Participant.find.mockReturnValue({ distinct: () => Promise.resolve(['u1']) });

		const res = await request(app)
			.get('/api/event/WEVENT1/participants/details')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.status).toBe(200);
		const allDonatersCall = distinctCalls[0];
		expect(allDonatersCall.field).toBe('userId');
		expect(allDonatersCall.filter).toEqual(
			expect.objectContaining({ userId: { $ne: null } })
		);
	});

	it('excludes them on the generic event too', async () => {
		mockAdmin();
		Event.findOne.mockReturnValue(
			resolveTo({ _id: 'evt-generic', reference: 'WGENERIC', isGeneric: true })
		);
		const distinctCalls = [];
		Donation.distinct.mockImplementation((field, filter) => {
			distinctCalls.push({ field, filter });
			return Promise.resolve(['u1']);
		});

		const res = await request(app)
			.get('/api/event/WGENERIC/participants/details')
			.set('Authorization', authHeader(ADMIN_ID));

		expect(res.status).toBe(200);
		expect(distinctCalls[0].filter).toEqual(
			expect.objectContaining({ userId: { $ne: null } })
		);
	});
});
