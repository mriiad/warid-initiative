const request = require('supertest');
const express = require('express');
const errorMiddleware = require('../../src/middleware/error-handler');

// Minimal app: one route per error shape under test, wired straight to the
// real error middleware -- no mocked models needed since these errors are
// never actually thrown by a real Mongoose document in these tests, only
// shaped like the ones Mongoose does throw.
const buildApp = () => {
	const app = express();
	app.get('/throw/:kind', (req, res, next) => {
		const { kind } = req.params;
		if (kind === 'validation') {
			const err = new Error('Emergency validation failed: bloodGroup: `XX` is not a valid enum value for path `bloodGroup`.');
			err.name = 'ValidationError';
			err.errors = {
				bloodGroup: { message: '`XX` is not a valid enum value for path `bloodGroup`.' },
			};
			return next(err);
		}
		if (kind === 'validation-custom-message') {
			const err = new Error('Emergency validation failed: phoneNumber: Phone Number is required');
			err.name = 'ValidationError';
			err.errors = {
				phoneNumber: { message: 'Phone Number is required' },
			};
			return next(err);
		}
		if (kind === 'duplicate-key') {
			const err = new Error(
				'E11000 duplicate key error collection: warid.users index: email_1 dup key: { email: "taken@example.com" }'
			);
			err.code = 11000;
			err.keyPattern = { email: 1 };
			err.keyValue = { email: 'taken@example.com' };
			return next(err);
		}
		if (kind === 'duplicate-key-no-pattern') {
			// Some drivers/versions surface E11000 without keyPattern/keyValue.
			const err = new Error('E11000 duplicate key error');
			err.code = 11000;
			return next(err);
		}
		if (kind === 'unrelated') {
			return next(new Error('db down'));
		}
		return res.status(200).json({ ok: true });
	});
	app.use(errorMiddleware);
	return app;
};

describe('error-handler: translating Mongoose errors (issue #368)', () => {
	const app = buildApp();

	it('translates a ValidationError to 400 with the failing field\'s own message', async () => {
		const res = await request(app).get('/throw/validation');
		expect(res.status).toBe(400);
		expect(res.body.message).toBe('`XX` is not a valid enum value for path `bloodGroup`.');
		// Not the raw, multi-field Mongoose message, and no leaked driver detail.
		expect(res.body.message).not.toContain('Emergency validation failed');
	});

	it('surfaces a schema-defined custom required message, not a generic one', async () => {
		// Matches Emergency's own schema: required: [true, 'Phone Number is required'].
		const res = await request(app).get('/throw/validation-custom-message');
		expect(res.status).toBe(400);
		expect(res.body.message).toBe('Phone Number is required');
	});

	it('translates a duplicate-key error to 409 naming the field, not the raw driver message', async () => {
		const res = await request(app).get('/throw/duplicate-key');
		expect(res.status).toBe(409);
		expect(res.body.message).toBe('That email is already in use.');
		expect(res.body.message).not.toContain('E11000');
		expect(res.body.message).not.toContain('taken@example.com');
	});

	it('still returns 409 with a generic message when the field name is unavailable', async () => {
		const res = await request(app).get('/throw/duplicate-key-no-pattern');
		expect(res.status).toBe(409);
		expect(res.body.message).toBe('This value is already in use.');
	});

	it('leaves an unrelated error on the existing generic-500 behavior', async () => {
		const res = await request(app).get('/throw/unrelated');
		expect(res.status).toBe(500);
		expect(res.body.message).toBe('Something went wrong. Please try again later.');
		expect(res.body.message).not.toContain('db down');
	});
});

// The API's `message` is English prose, and the clients deliberately prefer
// it over their own copy (issues #293, #332, #342, #344) -- which made
// English the primary error surface of an Arabic-first app. A `code` now
// travels alongside it so a client can translate what it recognises, while
// an untagged endpoint keeps behaving exactly as before. See issue #434.
describe('error codes on the response (issue #434)', () => {
	const ApiError = require('../../src/utils/errors/ApiError');
	const { ERROR_CODES } = require('../../src/utils/errors/errorCodes');

	it('omits code and params entirely when an error carries none', () => {
		const body = new ApiError('boom', 400).getErrorResponse();
		expect(body).toEqual({ message: 'boom', statusCode: 400, errorKeys: [] });
		expect('code' in body).toBe(false);
		expect('params' in body).toBe(false);
	});

	it('carries the code and its interpolation params when tagged', () => {
		const body = new ApiError(
			'You must be at least 18 years old to donate.',
			403,
			['donationDate'],
			ERROR_CODES.DONATION_TOO_YOUNG,
			{ minAge: 18 }
		).getErrorResponse();

		expect(body.code).toBe('DONATION_TOO_YOUNG');
		expect(body.params).toEqual({ minAge: 18 });
		// The prose stays put: it is what an untranslated client still reads.
		expect(body.message).toBe('You must be at least 18 years old to donate.');
		expect(body.errorKeys).toEqual(['donationDate']);
	});

	it('every declared code is its own name, so the contract cannot drift', () => {
		Object.entries(ERROR_CODES).forEach(([name, value]) => {
			expect(value).toBe(name);
		});
	});

	// A duplicate signup email or CIN reaches the user through this path --
	// neither is checked explicitly, so both arrive as an E11000 from the
	// unique index and are translated centrally.
	it('tags a duplicate key with the offending field as a param', async () => {
		const res = await request(buildApp()).get('/throw/duplicate-key');
		expect(res.status).toBe(409);
		expect(res.body.code).toBe('DUPLICATE_VALUE');
		expect(res.body.params).toEqual({ field: 'email' });
		expect(res.body.message).toBe('That email is already in use.');
	});

	it('tags a duplicate key with no field at all, without inventing one', async () => {
		const res = await request(buildApp()).get('/throw/duplicate-key-no-pattern');
		expect(res.status).toBe(409);
		expect(res.body.code).toBe('DUPLICATE_VALUE');
		expect(res.body.params).toBeUndefined();
	});

	it('tags a Mongoose validation failure', async () => {
		const res = await request(buildApp()).get('/throw/validation');
		expect(res.status).toBe(400);
		expect(res.body.code).toBe('VALIDATION_FAILED');
	});

	// The 500 body is the one place a non-ApiError gets a code: its message is
	// the deliberate generic, so there is something stable to name.
	it('tags the generic server error, and leaves other non-ApiError bodies alone', async () => {
		const res = await request(buildApp()).get('/throw/unrelated');
		expect(res.status).toBe(500);
		expect(res.body.code).toBe('SERVER_ERROR');
	});
});
