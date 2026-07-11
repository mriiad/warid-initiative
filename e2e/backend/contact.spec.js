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
			resolveTo({ email: 'real@example.com', phoneNumber: 700000000, profile: { firstname: 'Real', lastname: 'User' } })
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

	it('BUG: sends a real email regardless of EMAIL_ENABLED (no toggle respected, unlike auth.js)', async () => {
		// contact.js builds its transporter unconditionally from config.json's
		// mailerConfig and never checks an enabled flag the way auth.js checks
		// config.email.enabled -- there is no way to disable outbound email for
		// the contact form short of removing SMTP credentials entirely.
		const res = await request(app).post('/api/contact-us').send({
			firstname: 'Jane',
			lastname: 'Doe',
			email: 'jane@example.com',
			phoneNumber: '0600000000',
			subject: 'Question',
			message: 'Hello there',
		});
		expect(res.status).toBe(200);
		expect(nodemailer.__sendMail).toHaveBeenCalled();
	});
});
