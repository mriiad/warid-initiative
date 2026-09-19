const nodemailer = require('nodemailer');
const config = require('../utils/config');
const User = require('../models/user');
const { logger } = require('../utils/logger');
const ApiError = require('../utils/errors/ApiError');
const { ERROR_CODES } = require('../utils/errors/errorCodes');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

const createTransporter = () => {
	if (!config.email.enabled) {
		return null;
	}

	// Mirrors auth.js. Without this the transporter was built with an empty
	// user and pass, the SMTP server rejected the authentication, and the
	// rejection reached a visitor of a public form as a bare HTTP 500 --
	// issue #454. .env.example ships both empty and render.yaml marks them
	// `sync: false`, so a deployment that never set them lands here.
	if (!config.email.smtp.auth.user || !config.email.smtp.auth.pass) {
		return null;
	}

	const { host, secure, port, tls, auth } = config.email.smtp;
	return nodemailer.createTransport({
		host: host,
		secureConnection: secure,
		port: port,
		tls: {
			ciphers: tls.ciphers,
		},
		requireTLS: tls.requireTLS,
		auth: {
			user: auth.user,
			pass: auth.pass,
		},
	});
};

const transporter = createTransporter();

// This endpoint is public and unvalidated, so every field below is attacker
// controlled. Escape before interpolating into the HTML body, otherwise a
// submission can render as live markup in the team's inbox.
const escapeHtml = (value) =>
	String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');

exports.sendContactUs = async (req, res, next) => {
	const { message } = req.body;
	let { firstname, lastname, email, phoneNumber, subject } = req.body;
	const userId = req.userId;

	// Mail is on but unusable. Answering 200 here would be the tempting
	// mirror of EMAIL_ENABLED=false, and it would be a lie: the visitor typed
	// a message to the association, nothing was sent, and nothing is stored,
	// so they would never learn it went nowhere. Deliberately disabled mail
	// still answers 200 below, because that is an opt-out rather than a fault.
	if (config.email.enabled && !transporter) {
		logger.error(
			'Contact form received a message but no SMTP credentials are configured'
		);
		return next(
			new ApiError(
				'The contact channel is not configured on the server.',
				STATUS_CODE.SERVICE_UNAVAILABLE,
				[],
				ERROR_CODES.MAIL_NOT_CONFIGURED
			)
		);
	}

	try {
		if (userId) {
			const user = await User.findById(userId).populate('profile');

			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			// Override the firstname and lastname if they exist in the profile
			firstname = user.profile?.firstname || firstname;
			lastname = user.profile?.lastname || lastname;
			email = user.email;
			phoneNumber = user.phoneNumber;
		}

		// Define the email options
		const mailOptions = {
			from: config.email.from,
			to: config.email.contactRecipient,
			subject: subject,
			text: `You have received a new message from the contact form. Details:\nName: ${firstname} ${lastname}\nEmail: ${email}\nPhone: ${phoneNumber}\nMessage: ${message}`,
			html: `<h4>You have received a new message from the contact form:</h4><p><b>Name:</b> ${escapeHtml(
				firstname
			)} ${escapeHtml(lastname)}</p><p><b>Email:</b> ${escapeHtml(
				email
			)}</p><p><b>Phone:</b> ${escapeHtml(
				phoneNumber
			)}</p><p><b>Message:</b> ${escapeHtml(message)}</p>`,
		};

		if (transporter) {
			await transporter.sendMail(mailOptions);
		}
		res.status(200).json({ message: 'Email sent successfully' });
	} catch (error) {
		logger.error({ err: error }, 'Failed to send contact email');
		// Hand off to the error middleware rather than responding here as
		// well -- doing both sent the client a body and then crashed the
		// middleware with ERR_HTTP_HEADERS_SENT. Don't serialise the raw
		// error either: on an SMTP failure it carries host/port/command
		// detail, and this endpoint is public.
		error.message = 'Error sending email';
		next(error);
	}
};
