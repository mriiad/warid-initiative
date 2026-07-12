/**
 * Global auto-mock (Jest convention: __mocks__/<node_module>.js at project
 * root) so no test run ever sends a real email. contact.js and auth.js both
 * create a transporter at module-load time and call sendMail unconditionally
 * in some code paths; without this mock, running the backend suite would
 * attempt real SMTP calls using the credentials hardcoded in
 * src/utils/config.js.
 */
const sendMail = jest.fn((options, callback) => {
	if (typeof callback === 'function') {
		callback(null, { response: 'mocked' });
		return;
	}
	return Promise.resolve({ response: 'mocked' });
});

module.exports = {
	createTransport: jest.fn(() => ({ sendMail })),
	__sendMail: sendMail,
};
