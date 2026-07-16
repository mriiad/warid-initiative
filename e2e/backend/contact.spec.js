const request = require('supertest');
const { resolveTo } = require('./support/mongooseMock');

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
