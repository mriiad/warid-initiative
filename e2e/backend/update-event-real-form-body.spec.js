const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/event', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/donation', () => require('./support/mongooseMock').makeModelMock());
jest.mock('../../src/models/participant', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const Event = require('../../src/models/event');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');

const app = buildApp();
const ADMIN_ID = '507f1f77bcf86cd799439011';

const FIXTURES = path.join(__dirname, 'support', 'fixtures');
const BODY = fs.readFileSync(path.join(FIXTURES, 'update-event-body.txt'));
const CONTENT_TYPE = fs
	.readFileSync(path.join(FIXTURES, 'update-event-content-type.txt'), 'utf8')
	.trim();

/**
 * The frontend and the backend for issue #462 were each tested on their own
 * side of the HTTP boundary and never against each other: the form's fix was
 * that it already omitted `date`, which was read from the source rather than
 * observed, and the controller's fix was tested with a body this file
 * constructed.
 *
 * The fixtures here are the real thing -- the exact multipart body and
 * Content-Type a Chromium browser produced by filling in the update form and
 * pressing save, captured from the running app. Replaying them drives the
 * real route stack: multer, the validator chain, and updateEvent.
 *
 * Re-capture with e2e/dom-check.spec.ts if the form's fields ever change; a
 * stale fixture would keep passing while the real form had moved on, which
 * is the one way this test can mislead.
 */
describe('PUT /api/event/:reference with the body a real browser sends (issue #462)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		User.findById.mockReturnValue(
			resolveTo({ _id: ADMIN_ID, isAdmin: true, role: 'event' })
		);
	});

	it('is a multipart body carrying no date and no image', () => {
		const text = BODY.toString('utf8');
		expect(CONTENT_TYPE).toMatch(/^multipart\/form-data; boundary=/);
		expect(text).toContain('name="title"');
		expect(text).toContain('name="isGeneric"');
		// The two the form stopped sending -- the premise both fixes rest on.
		expect(text).not.toContain('name="date"');
		expect(text).not.toContain('name="image"');
	});

	it('succeeds, and keeps the stored date', async () => {
		const storedDate = new Date('2099-01-01');
		Event.findOne.mockReturnValue(
			resolveTo({ reference: 'WEVENT20990101', date: storedDate })
		);
		let updatePayload = null;
		Event.findOneAndUpdate.mockImplementation((_query, update) => {
			updatePayload = update;
			return resolveTo({
				reference: 'WEVENT20990101',
				_id: 'evt-1',
				title: 'Agadir Drive (renamed)',
				date: storedDate,
				isGeneric: false,
			});
		});

		const res = await request(app)
			.put('/api/event/WEVENT20990101')
			.set('Authorization', authHeader(ADMIN_ID))
			.set('Content-Type', CONTENT_TYPE)
			.send(BODY);

		expect(res.status).toBe(200);
		expect(updatePayload.date.toISOString()).toBe(storedDate.toISOString());
		// And the fields the browser did send arrived intact, which is what
		// multer().none() is still there for.
		expect(updatePayload.title).toBe('Agadir Drive (renamed)');
		expect(updatePayload.location).toBe('Casablanca');
	});
});
