/**
 * Application Constants
 * Centralized constants used throughout the application
 */
const constants = {
	// HTTP Status Codes

	// Error Messages
	ERROR_MESSAGES: {
		WRONG_PASSWORD: 'Wrong password.',
		VALIDATION_FAILED: 'Validation failed.',
		USER_ALREADY_EXISTS: 'E-Mail address already exists!',
		CIN_ALREADY_EXISTS: 'The CIN already exists!',
		TOKEN_INVALID_OR_EXPIRED: 'Token is invalid or has expired.',
		REFRESH_TOKEN_INVALID: 'Invalid refresh token.',
		REFRESH_TOKEN_NOT_VALID: 'Refresh token is not valid.',
		CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect.',
		ACCOUNT_NOT_ACTIVATED: 'Please confirm your email before logging in. Check your inbox for the activation link.',
		PASSWORD_RESET_SUCCESSFUL: 'Password reset successful!',
		LOGGED_OUT_SUCCESSFULLY: 'Logged out successfully',
		PASSWORD_CHANGED_SUCCESSFULLY: 'Password changed successfully!',
		EMERGENCY_NOT_FOUND: 'Emergency not found',
		USER_NOT_FOUND: 'User not found',
		DONATIONS_NOT_FOUND: 'No donations found for this user.',
		EMERGENCY_CONFIRMED_SUCCESSFULLY: 'The emergency is successfully confirmed',
		USER_ADDED_SUCCESSFULLY: 'The contacted user was added successfully',
		ACCOUNT_ACTIVATED: 'Account activated.',
		// Deliberately non-committal about whether the email is registered --
		// see issue #359. Sent for both a known and an unknown email.
		PASSWORD_RESET_LINK_SENT: 'If that email is registered, a password reset link has been sent.',
		USER_CREATED: 'User created!',

	},

	MESSAGES: {
        REGULAR_DONATION: "Regular Donation",
    },
	
	// Email Subjects
	EMAIL_SUBJECTS: {
		ACCOUNT_ACTIVATION: 'Activation du compte',
		PASSWORD_RESET_REQUEST: 'Password Reset Request',
		PASSWORD_RESET_SUCCESS: 'Password Reset Successful',
	},

	// Email Templates
	EMAIL_TEMPLATES: {
		ACTIVATION: {
			TEXT: (username) =>
				`Bonjour M. ${username}, veuillez activez votre compte s'il vous plait. Merci`,
			HTML: (username, activationLink) => `
        <h1>Email Confirmation</h1>
        <h2>Hello ${username}</h2>
        <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        <a href="${activationLink}">Click here</a>
      `,
		},
		PASSWORD_RESET_REQUEST: {
			TEXT: (resetURL) =>
				`Forgot your password? Click the link below to reset it: ${resetURL}`,
			HTML: (resetURL) =>
				`<p>Forgot your password? Click the link below to reset it:</p><a href="${resetURL}">Reset Password</a>`,
		},
		PASSWORD_RESET_SUCCESS: {
			TEXT: 'Your password has been reset successfully. You can now log in with your new password.',
			HTML: (loginURL) => `
        <p>Your password has been reset successfully.</p>
        <p>You can now <a href="${loginURL}">log in</a> with your new password.</p>
      `,
		},
	},

	// Validation Rules
	VALIDATION: {
		PASSWORD_MIN_LENGTH: 5,
		PHONE_MIN_LENGTH: 10,
		PASSWORD_RESET_TOKEN_BYTES: 32,
	},

	// Blood donation eligibility policy. Standard bounds used by most blood
	// transfusion services (WHO guidance and typical national policy); the
	// association should confirm/adjust these against their own rules.
	DONATION_AGE: {
		MIN: 18,
		MAX: 65,
	},

	// Time Constants (in milliseconds)
	TIME: {
		ONE_MINUTE: 60 * 1000,
		FIFTEEN_MINUTES: 15 * 60 * 1000,
		ONE_HOUR: 60 * 60 * 1000,
		ONE_DAY: 24 * 60 * 60 * 1000,
		SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
	},
};

const BLOOD_GROUP_VALUES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

module.exports = constants;
module.exports.BLOOD_GROUP_VALUES = BLOOD_GROUP_VALUES;
