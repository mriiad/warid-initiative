const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');
const {
	GENERIC_SERVER_ERROR,
} = require('../../src/middleware/error-handler');

jest.mock('../../src/models/user', () => require('./support/mongooseMock').makeModelMock());

const User = require('../../src/models/user');
const { buildApp } = require('./support/testApp');
const { authHeader } = require('./support/jwtHelper');
const nodemailer = require('nodemailer');

const app = buildApp();

describe('POST /api/contact-us', () => {
	beforeEach(() => {
		nodemailer.__sendMail.mockClear();
	});

	it('sends an email for an anonymous visitor', async () => {
		const res = await request(app).post('/api/contact-us').send({
			firstname: 'Jane',
			lastname: 'Doe',
			email: 'jane@example.com',
			phoneNumber: '0600000000',
			subject: 'Question',
			message: 'Hello there',
		});
		expect(res.status).toBe(200);
		expect(nodemailer.__sendMail).toHaveBeenCalledTimes(1);
	});

	it('overrides name/email/phone from the authenticated user profile', async () => {
		User.findById.mockReturnValue(
			resolveTo({ email: 'real@example.com', phoneNumber: '+212700000000', profile: { firstname: 'Real', lastname: 'User' } })
		);
		const res = await request(app)
			.post('/api/contact-us')
			.set('Authorization', authHeader('user-1'))
			.send({ firstname: 'Spoofed', subject: 'Question', message: 'Hi' });
		expect(res.status).toBe(200);
		const sentOptions = nodemailer.__sendMail.mock.calls[0][0];
		expect(sentOptions.text).toContain('real@example.com');
		expect(sentOptions.text).not.toContain('Spoofed');
	});

	it('escapes user-supplied markup before putting it in the email HTML', async () => {
		// This endpoint is public and unvalidated, so every field is attacker
		// controlled. They used to be interpolated raw, meaning a submission
		// could render as live markup in the team's inbox.
		const res = await request(app).post('/api/contact-us').send({
			firstname: '<script>alert(1)</script>',
			lastname: 'Doe',
			email: 'jane@example.com',
			phoneNumber: '0600000000',
			subject: 'Question',
			message: '<img src=x onerror=alert(2)>',
		});

		expect(res.status).toBe(200);
		const sent = nodemailer.__sendMail.mock.calls[0][0];
		expect(sent.html).not.toContain('<script>');
		expect(sent.html).not.toContain('<img src=x');
		expect(sent.html).toContain('&lt;script&gt;');
		expect(sent.html).toContain('&lt;img src=x');
	});

	it('takes the sender and recipient addresses from config, not hardcoded values', async () => {
		const config = require('../../src/utils/config');
		await request(app).post('/api/contact-us').send({
			firstname: 'Jane',
			lastname: 'Doe',
			email: 'jane@example.com',
			phoneNumber: '0600000000',
			subject: 'Question',
			message: 'Hello there',
		});

		const sent = nodemailer.__sendMail.mock.calls[0][0];
		expect(sent.from).toBe(config.email.from);
		expect(sent.to).toBe(config.email.contactRecipient);
	});

	it('responds once, without leaking SMTP detail, when sending fails', async () => {
		// The catch used to res.json() *and* call next(error): the client got
		// a body and the error middleware then crashed with
		// ERR_HTTP_HEADERS_SENT. It also serialised the raw error. A plain
		// Error hides its message from JSON.stringify, but real nodemailer
		// failures attach code/command/response as *enumerable* own
		// properties, so those did reach the caller -- and this endpoint is
		// public. The error is shaped like a real SMTP failure here for that
		// reason.
		const smtpError = Object.assign(new Error('connection refused'), {
			code: 'ECONNECTION',
			command: 'CONN',
			response: '421 smtp.example.com service not available',
		});
		nodemailer.__sendMail.mockImplementationOnce(() => Promise.reject(smtpError));
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

		try {
			const res = await request(app).post('/api/contact-us').send({
				firstname: 'Jane',
				lastname: 'Doe',
				email: 'jane@example.com',
				phoneNumber: '0600000000',
				subject: 'Question',
				message: 'Hello there',
			});

			expect(res.status).toBe(500);
			expect(res.body.message).toBe(GENERIC_SERVER_ERROR);
			const body = JSON.stringify(res.body);
			expect(body).not.toContain('smtp.example.com');
			expect(body).not.toContain('ECONNECTION');

			const logged = errorSpy.mock.calls.map((c) => String(c[0])).join(' | ');
			expect(logged).not.toContain('ERR_HTTP_HEADERS_SENT');
		} finally {
			errorSpy.mockRestore();
		}
	});

	it('fix: does not send an email when EMAIL_ENABLED=false', async () => {
		// contact.js used to build its transporter unconditionally from
		// config.email.smtp and never check the config.email.enabled flag the
		// way auth.js's createTransporter does -- there was no way to disable
		// outbound email for the contact form short of removing SMTP
		// credentials entirely. contact.js now mirrors auth.js's pattern: no
		// transporter is created (and sendMail is never called) when the flag
		// is off. config.js reads EMAIL_ENABLED at module-load time, so this
		// test resets the module registry and re-requires everything with the
		// env var set, the same way authGuard.spec.js exercises config.json.
		jest.resetModules();
		process.env.EMAIL_ENABLED = 'false';
		try {
			const freshNodemailer = require('nodemailer');
			const { buildApp: freshBuildApp } = require('./support/testApp');
			const freshApp = freshBuildApp();

			const res = await request(freshApp).post('/api/contact-us').send({
				firstname: 'Jane',
				lastname: 'Doe',
				email: 'jane@example.com',
				phoneNumber: '0600000000',
				subject: 'Question',
				message: 'Hello there',
			});

			expect(res.status).toBe(200);
			expect(freshNodemailer.__sendMail).not.toHaveBeenCalled();
		} finally {
			delete process.env.EMAIL_ENABLED;
			jest.resetModules();
		}
	});
});

describe('POST /api/contact-us with email enabled but SMTP credentials missing (issue #454)', () => {
	// auth.js's createTransporter returns null when the credentials are
	// absent, so signup and password reset degrade quietly. contact.js only
	// ever checked config.email.enabled, so it built a transporter with an
	// empty user/pass, and the SMTP server rejected the authentication --
	// which surfaced to the visitor as a bare HTTP 500 on a public form.
	//
	// .env.example ships SMTP_USER and SMTP_PASS empty, and render.yaml marks
	// them `sync: false`, so a deployment that never set them lands in exactly
	// this state.
	const withEmptyCredentials = async (assertions) => {
		jest.resetModules();
		const previousUser = process.env.SMTP_USER;
		const previousPass = process.env.SMTP_PASS;
		const previousEnabled = process.env.EMAIL_ENABLED;
		process.env.SMTP_USER = '';
		process.env.SMTP_PASS = '';
		process.env.EMAIL_ENABLED = 'true';
		try {
			const freshNodemailer = require('nodemailer');
			const { buildApp: freshBuildApp } = require('./support/testApp');
			await assertions(freshBuildApp(), freshNodemailer);
		} finally {
			process.env.SMTP_USER = previousUser;
			process.env.SMTP_PASS = previousPass;
			if (previousEnabled === undefined) {
				delete process.env.EMAIL_ENABLED;
			} else {
				process.env.EMAIL_ENABLED = previousEnabled;
			}
			jest.resetModules();
		}
	};

	const submission = {
		firstname: 'Jane',
		lastname: 'Doe',
		email: 'jane@example.com',
		phoneNumber: '0600000000',
		subject: 'Question',
		message: 'Hello there',
	};

	it('does not answer 500, and does not try to send with empty credentials', async () => {
		await withEmptyCredentials(async (freshApp, freshNodemailer) => {
			const res = await request(freshApp).post('/api/contact-us').send(submission);

			expect(res.status).not.toBe(500);
			expect(freshNodemailer.__sendMail).not.toHaveBeenCalled();
		});
	});

	it('says the contact channel is unconfigured, with a code the client can translate', async () => {
		await withEmptyCredentials(async (freshApp) => {
			const res = await request(freshApp).post('/api/contact-us').send(submission);

			expect(res.status).toBe(503);
			expect(res.body.code).toBe('MAIL_NOT_CONFIGURED');
		});
	});

	it('does not claim the message was sent when it was not', async () => {
		// The tempting fix is to mirror EMAIL_ENABLED=false and answer 200.
		// That is right for a deliberate opt-out and wrong here: the visitor
		// typed a message to the association and would be told it had been
		// delivered when nothing was sent and nothing was stored.
		await withEmptyCredentials(async (freshApp) => {
			const res = await request(freshApp).post('/api/contact-us').send(submission);

			expect(res.status).not.toBe(200);
			expect(JSON.stringify(res.body)).not.toMatch(/sent successfully/i);
		});
	});
});
