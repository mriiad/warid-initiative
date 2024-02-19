const nodemailer = require('nodemailer');
const config = require('../../config.json');
const User = require('../models/user');

const { email, password, host, secureConnection, port, ciphers, requireTLS } =
	config.mailerConfig;

const transporter = nodemailer.createTransport({
	host: host,
	secureConnection: secureConnection,
	port: port,
	tls: {
		ciphers: ciphers,
	},
	requireTLS: requireTLS,
	auth: {
		user: email,
		pass: password,
	},
});

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
			from: 'do-not-reply@warid.ma',
			to: 'team@warid.ma',
			subject: subject,
			text: `You have received a new message from the contact form. Details:\nName: ${firstname} ${lastname}\nEmail: ${email}\nPhone: ${phoneNumber}\nMessage: ${message}`,
			html: `<h4>You have received a new message from the contact form:</h4><p><b>Name:</b> ${firstname} ${lastname}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phoneNumber}</p><p><b>Message:</b> ${message}</p>`,
		};

		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: 'Email sent successfully' });
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ message: 'Error sending email', error: error });
		next(error);
	}
};
