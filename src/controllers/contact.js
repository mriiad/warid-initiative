const nodemailer = require('nodemailer');
const config = require('../utils/config');
const User = require('../models/user');
const { logger } = require('../utils/logger');

const createTransporter = () => {
	if (!config.email.enabled) {
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
		if (!error.statusCode) error.statusCode = 500;
		error.message = 'Error sending email';
		next(error);
	}
};
