const jsonBody = (schema, required = true) => ({
	required,
	content: {
		'application/json': { schema },
	},
});

const jsonResponse = (description, schema) => ({
	description,
	content: schema
		? {
				'application/json': { schema },
		  }
		: undefined,
});

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const bearerAuth = [{ bearerAuth: [] }];
const messageResponse = (description = 'Successful operation') =>
	jsonResponse(description, ref('MessageResponse'));
const errorResponses = {
	400: jsonResponse('Invalid request', ref('ErrorResponse')),
	401: jsonResponse('Authentication required', ref('ErrorResponse')),
	403: jsonResponse('Insufficient permissions', ref('ErrorResponse')),
	404: jsonResponse('Resource not found', ref('ErrorResponse')),
	500: jsonResponse('Unexpected server error', ref('ErrorResponse')),
};
const idParameter = (name, description) => ({
	in: 'path',
	name,
	required: true,
	description,
	schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
});
const referenceParameter = {
	in: 'path',
	name: 'reference',
	required: true,
	description: 'Event reference',
	schema: { type: 'string', example: 'WEVENT20261205' },
};
const pageParameter = {
	in: 'query',
	name: 'page',
	required: false,
	description: 'One-based page number',
	schema: { type: 'integer', minimum: 1, default: 1 },
};

module.exports = {
	openapi: '3.0.3',
	info: {
		title: 'Warid Initiative API',
		version: '1.0.0',
		description:
			'API for authentication, donor profiles, donations, events, participants, emergencies, and contact requests.',
		contact: {
			name: 'Warid Initiative',
			url: 'https://github.com/mriiad/warid-initiative',
		},
	},
	servers: [
		{
			url: '/',
			description: 'Current server',
		},
	],
	tags: [
		{ name: 'Authentication', description: 'Account and session management' },
		{ name: 'Users', description: 'User and profile management' },
		{ name: 'Donations', description: 'Donation and eligibility management' },
		{ name: 'Events', description: 'Blood donation event management' },
		{ name: 'Participants', description: 'Event participation management' },
		{ name: 'Emergencies', description: 'Emergency blood requests' },
		{ name: 'Contact', description: 'Contact form delivery' },
		{ name: 'Reference data', description: 'Public lookup data' },
	],
	paths: {
		'/api/auth/signup': {
			put: {
				tags: ['Authentication'],
				summary: 'Create a user account',
				requestBody: jsonBody(ref('SignupRequest')),
				responses: {
					201: jsonResponse('User created', {
						type: 'object',
						properties: {
							message: { type: 'string', example: 'User created!' },
							userId: { type: 'string' },
						},
					}),
					...errorResponses,
				},
			},
		},
		'/api/auth/login': {
			post: {
				tags: ['Authentication'],
				summary: 'Authenticate a user',
				requestBody: jsonBody(ref('LoginRequest')),
				responses: {
					200: jsonResponse('Authentication successful', ref('AuthTokens')),
					...errorResponses,
				},
			},
		},
		'/api/auth/logout': {
			post: {
				tags: ['Authentication'],
				summary: 'Clear the authentication cookie',
				responses: { 200: messageResponse('Logged out'), ...errorResponses },
			},
		},
		'/api/auth/activation/{confirmationCode}': {
			get: {
				tags: ['Authentication'],
				summary: 'Activate a user account',
				parameters: [
					{
						in: 'path',
						name: 'confirmationCode',
						required: true,
						schema: { type: 'string' },
					},
				],
				responses: { 200: messageResponse('Account activated'), ...errorResponses },
			},
		},
		'/api/auth/refresh-token': {
			post: {
				tags: ['Authentication'],
				summary: 'Refresh access and refresh tokens',
				requestBody: jsonBody({
					type: 'object',
					required: ['refreshToken'],
					properties: { refreshToken: { type: 'string' } },
				}),
				responses: {
					200: jsonResponse('Tokens refreshed', ref('RefreshTokens')),
					...errorResponses,
				},
			},
		},
		'/api/auth/request-reset': {
			post: {
				tags: ['Authentication'],
				summary: 'Request a password reset email',
				requestBody: jsonBody({
					type: 'object',
					required: ['email'],
					properties: { email: { type: 'string', format: 'email' } },
				}),
				responses: { 200: messageResponse('Reset email sent'), ...errorResponses },
			},
		},
		'/api/auth/reset-password/{token}': {
			post: {
				tags: ['Authentication'],
				summary: 'Reset a password with a valid reset token',
				parameters: [idParameter('token', 'Password reset token')],
				requestBody: jsonBody({
					type: 'object',
					required: ['password'],
					properties: { password: { type: 'string', format: 'password', minLength: 5 } },
				}),
				responses: { 200: messageResponse('Password reset'), ...errorResponses },
			},
		},
		'/api/auth/check-reset-token/{token}': {
			get: {
				tags: ['Authentication'],
				summary: 'Validate a password reset token',
				parameters: [idParameter('token', 'Password reset token')],
				responses: { 200: messageResponse('Token is valid'), ...errorResponses },
			},
		},
		'/api/auth/update-password': {
			patch: {
				tags: ['Authentication'],
				summary: 'Change the authenticated user password',
				security: bearerAuth,
				requestBody: jsonBody({
					type: 'object',
					required: ['currentPassword', 'newPassword'],
					properties: {
						currentPassword: { type: 'string', format: 'password' },
						newPassword: { type: 'string', format: 'password', minLength: 5 },
					},
				}),
				responses: { 200: messageResponse('Password changed'), ...errorResponses },
			},
		},
		'/api/users': {
			get: {
				tags: ['Users'],
				summary: 'List users',
				parameters: [pageParameter],
				responses: {
					200: jsonResponse('Paginated users', ref('UsersPage')),
					...errorResponses,
				},
			},
		},
		'/api/user/update': {
			put: {
				tags: ['Users'],
				summary: 'Create or replace the authenticated user profile',
				security: bearerAuth,
				requestBody: jsonBody(ref('ProfileInput')),
				responses: { 200: messageResponse('Profile updated'), ...errorResponses },
			},
		},
		'/api/user/check-profile': {
			get: {
				tags: ['Users'],
				summary: 'Check whether the authenticated user profile is complete',
				security: bearerAuth,
				responses: {
					200: jsonResponse('Profile completion status', {
						type: 'object',
						properties: { isProfileComplete: { type: 'boolean' } },
					}),
					...errorResponses,
				},
			},
		},
		'/api/user/profile': {
			get: {
				tags: ['Users'],
				summary: 'Get the authenticated user profile',
				security: bearerAuth,
				responses: { 200: jsonResponse('User profile', ref('UserProfile')), ...errorResponses },
			},
			patch: {
				tags: ['Users'],
				summary: 'Partially update the authenticated user profile',
				security: bearerAuth,
				requestBody: jsonBody(ref('UserProfileUpdate')),
				responses: { 200: messageResponse('Profile updated'), ...errorResponses },
			},
		},
		'/api/searchUsers': {
			post: {
				tags: ['Users'],
				summary: 'Search and filter users (admin only)',
				security: bearerAuth,
				requestBody: jsonBody(ref('UserSearchRequest'), false),
				responses: { 200: jsonResponse('Matching users', ref('UsersPage')), ...errorResponses },
			},
		},
		'/api/deleteUser/{username}': {
			delete: {
				tags: ['Users'],
				summary: 'Delete a user by username (admin only)',
				security: bearerAuth,
				parameters: [
					{
						in: 'path',
						name: 'username',
						required: true,
						schema: { type: 'string' },
					},
				],
				responses: { 200: messageResponse('User deleted'), ...errorResponses },
			},
		},
		'/cities': {
			get: {
				tags: ['Reference data'],
				summary: 'List supported cities',
				responses: {
					200: jsonResponse('Cities', {
						type: 'object',
						properties: {
							cities: { type: 'array', items: { type: 'string' } },
						},
					}),
				},
			},
		},
		'/api/users/profile/{userId}': {
			get: {
				tags: ['Users'],
				summary: 'Get a user profile (admin only)',
				security: bearerAuth,
				parameters: [idParameter('userId', 'User identifier')],
				responses: { 200: jsonResponse('User profile', ref('User')), ...errorResponses },
			},
		},
		'/api/users/{userId}': {
			put: {
				tags: ['Users'],
				summary: 'Update a user and profile (admin only)',
				security: bearerAuth,
				parameters: [idParameter('userId', 'User identifier')],
				requestBody: jsonBody(ref('UserProfileUpdate')),
				responses: { 200: messageResponse('User updated'), ...errorResponses },
			},
		},
		'/api/users/{userId}/admin': {
			patch: {
				tags: ['Users'],
				summary: 'Promote a user to admin (admin only)',
				security: bearerAuth,
				parameters: [idParameter('userId', 'User identifier')],
				responses: { 200: messageResponse('User promoted'), ...errorResponses },
			},
		},
		'/api/users/{userId}/dashboard': {
			get: {
				tags: ['Users'],
				summary: 'Get the authenticated user donation dashboard',
				security: bearerAuth,
				parameters: [idParameter('userId', 'User identifier')],
				responses: { 200: jsonResponse('Dashboard data', ref('Dashboard')), ...errorResponses },
			},
		},
		'/api/admin/stats': {
			get: {
				tags: ['Users'],
				summary: 'Get site-wide counts (admin only)',
				security: bearerAuth,
				responses: { 200: jsonResponse('Admin statistics', ref('AdminStats')), ...errorResponses },
			},
		},
		'/api/donation': {
			post: {
				tags: ['Donations'],
				summary: 'Record a donation',
				security: bearerAuth,
				requestBody: jsonBody(ref('DonationInput')),
				responses: { 201: messageResponse('Donation recorded'), ...errorResponses },
			},
			get: {
				tags: ['Donations'],
				summary: 'Get the authenticated user latest donation',
				security: bearerAuth,
				responses: { 200: jsonResponse('Latest donation', ref('Donation')), ...errorResponses },
			},
		},
		'/api/donation/canDonate': {
			get: {
				tags: ['Donations'],
				summary: 'Check the authenticated user donation eligibility',
				security: bearerAuth,
				responses: { 200: jsonResponse('Donation eligibility', ref('Eligibility')), ...errorResponses },
			},
		},
		'/api/donation/{username}': {
			get: {
				tags: ['Donations'],
				summary: 'List donations for a user (admin only)',
				security: bearerAuth,
				parameters: [
					{
						in: 'path',
						name: 'username',
						required: true,
						schema: { type: 'string' },
					},
				],
				responses: {
					200: jsonResponse('User donations', { type: 'array', items: ref('Donation') }),
					...errorResponses,
				},
			},
		},
		'/api/events': {
			get: {
				tags: ['Events'],
				summary: 'List events',
				parameters: [pageParameter],
				responses: { 200: jsonResponse('Paginated events', ref('EventsPage')), ...errorResponses },
			},
		},
		'/api/events/{reference}': {
			get: {
				tags: ['Events'],
				summary: 'Get an event by reference',
				description: 'The QR code is returned only when a valid admin bearer token is supplied.',
				parameters: [referenceParameter],
				responses: { 200: jsonResponse('Event details', ref('EventResponse')), ...errorResponses },
			},
		},
		'/api/event': {
			post: {
				tags: ['Events'],
				summary: 'Create an event (admin only)',
				security: bearerAuth,
				requestBody: {
					required: true,
					content: {
						'multipart/form-data': { schema: ref('EventForm') },
					},
				},
				responses: { 201: jsonResponse('Event created', ref('EventMutationResponse')), ...errorResponses },
			},
			delete: {
				tags: ['Events'],
				summary: 'Delete an event (admin only)',
				security: bearerAuth,
				requestBody: jsonBody({
					type: 'object',
					required: ['reference'],
					properties: { reference: { type: 'string', example: 'WEVENT20261205' } },
				}),
				responses: { 200: jsonResponse('Event deleted', ref('EventMutationResponse')), ...errorResponses },
			},
		},
		'/api/event/{reference}': {
			put: {
				tags: ['Events'],
				summary: 'Update an event (admin only)',
				security: bearerAuth,
				parameters: [referenceParameter],
				requestBody: {
					required: true,
					content: {
						'multipart/form-data': { schema: ref('EventForm') },
					},
				},
				responses: { 200: jsonResponse('Event updated', ref('EventMutationResponse')), ...errorResponses },
			},
		},
		'/api/event/confirmPresence': {
			put: {
				tags: ['Events'],
				summary: 'Confirm presence at an event',
				security: bearerAuth,
				requestBody: jsonBody({
					type: 'object',
					required: ['reference'],
					properties: { reference: { type: 'string', example: 'WEVENT20261205' } },
				}),
				responses: { 200: messageResponse('Presence confirmed'), ...errorResponses },
			},
		},
		'/api/event/{reference}/participants/details': {
			get: {
				tags: ['Events'],
				summary: 'Get event participation statistics (admin only)',
				security: bearerAuth,
				parameters: [referenceParameter],
				responses: { 200: jsonResponse('Participant statistics', ref('ParticipantStats')), ...errorResponses },
			},
		},
		'/api/participate/{reference}': {
			post: {
				tags: ['Participants'],
				summary: 'Register the authenticated user for an event',
				security: bearerAuth,
				parameters: [referenceParameter],
				responses: { 201: messageResponse('Participation registered'), ...errorResponses },
			},
		},
		'/api/check/{reference}': {
			get: {
				tags: ['Participants'],
				summary: 'Check whether the authenticated user participates in an event',
				security: bearerAuth,
				parameters: [referenceParameter],
				responses: { 200: jsonResponse('Participation status', ref('ParticipationStatus')), ...errorResponses },
			},
		},
		'/api/unconfirmedEmergencies': {
			get: {
				tags: ['Emergencies'],
				summary: 'List unconfirmed emergencies (admin only)',
				security: bearerAuth,
				parameters: [pageParameter],
				responses: { 200: jsonResponse('Paginated emergencies', ref('EmergenciesPage')), ...errorResponses },
			},
		},
		'/api/emergencies/{id}/matchingUsers': {
			get: {
				tags: ['Emergencies'],
				summary: 'List eligible users matching an emergency (admin only)',
				security: bearerAuth,
				parameters: [idParameter('id', 'Emergency identifier'), pageParameter],
				responses: { 200: jsonResponse('Matching users', ref('MatchingUsersPage')), ...errorResponses },
			},
		},
		'/api/emergency': {
			post: {
				tags: ['Emergencies'],
				summary: 'Create an emergency blood request',
				requestBody: jsonBody(ref('EmergencyInput')),
				responses: { 201: jsonResponse('Emergency created', ref('EmergencyResponse')), ...errorResponses },
			},
		},
		'/api/emergencies/{id}/confirm': {
			patch: {
				tags: ['Emergencies'],
				summary: 'Confirm an emergency (admin only)',
				security: bearerAuth,
				parameters: [idParameter('id', 'Emergency identifier')],
				responses: { 200: messageResponse('Emergency confirmed'), ...errorResponses },
			},
		},
		'/api/emergencies/{emergencyId}/matchedUsers/{userId}/confirm': {
			patch: {
				tags: ['Emergencies'],
				summary: 'Mark a matching user as contacted (admin only)',
				security: bearerAuth,
				parameters: [
					idParameter('emergencyId', 'Emergency identifier'),
					idParameter('userId', 'User identifier'),
				],
				responses: { 200: messageResponse('User marked as contacted'), ...errorResponses },
			},
		},
		'/api/contact-us': {
			post: {
				tags: ['Contact'],
				summary: 'Send a contact request',
				description: 'Authentication is optional. Authenticated user details override supplied identity fields.',
				requestBody: jsonBody(ref('ContactRequest')),
				responses: { 200: messageResponse('Email sent'), ...errorResponses },
			},
		},
	},
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'JWT access token returned by POST /api/auth/login.',
			},
		},
		schemas: {
			MessageResponse: {
				type: 'object',
				required: ['message'],
				properties: { message: { type: 'string' } },
			},
			ErrorResponse: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					errorMessage: { type: 'string' },
					errorKeys: { type: 'array', items: { type: 'string' } },
				},
			},
			SignupRequest: {
				type: 'object',
				required: ['username', 'email', 'password', 'phoneNumber', 'gender'],
				properties: {
					username: { type: 'string', description: 'National identity number', example: 'AB123456' },
					email: { type: 'string', format: 'email', example: 'donor@example.com' },
					password: { type: 'string', format: 'password', minLength: 5 },
					phoneNumber: { type: 'string', minLength: 10, example: '0612345678' },
					gender: { type: 'string', enum: ['male', 'female'] },
				},
			},
			LoginRequest: {
				type: 'object',
				required: ['username', 'password'],
				properties: {
					username: { type: 'string', example: 'AB123456' },
					password: { type: 'string', format: 'password' },
				},
			},
			AuthTokens: {
				type: 'object',
				properties: {
					token: { type: 'string' },
					refreshToken: { type: 'string' },
					userId: { type: 'string' },
					isAdmin: { type: 'boolean' },
				},
			},
			RefreshTokens: {
				type: 'object',
				properties: {
					accessToken: { type: 'string' },
					refreshToken: { type: 'string' },
				},
			},
			ProfileInput: {
				type: 'object',
				required: ['firstname', 'lastname', 'birthdate', 'bloodGroup', 'city'],
				properties: {
					firstname: { type: 'string', example: 'Amine' },
					lastname: { type: 'string', example: 'Bennani' },
					birthdate: { type: 'string', format: 'date', example: '1995-05-20' },
					bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
					city: { type: 'string', example: 'Casablanca' },
				},
			},
			UserProfileUpdate: {
				type: 'object',
				properties: {
					firstname: { type: 'string', example: 'Amine' },
					lastname: { type: 'string', example: 'Bennani' },
					birthdate: { type: 'string', format: 'date', example: '1995-05-20' },
					bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
					city: { type: 'string', example: 'Casablanca' },
					phoneNumber: { type: 'string', example: '0612345678' },
					email: { type: 'string', format: 'email' },
				},
			},
			UserProfile: {
				allOf: [
					ref('ProfileInput'),
					{
						type: 'object',
						properties: {
							gender: { type: 'string', enum: ['male', 'female'] },
							phoneNumber: { type: 'string' },
							email: { type: 'string', format: 'email' },
						},
					},
				],
			},
			User: {
				type: 'object',
				properties: {
					_id: { type: 'string' },
					username: { type: 'string' },
					email: { type: 'string', format: 'email' },
					phoneNumber: { type: 'string' },
					gender: { type: 'string', enum: ['male', 'female'] },
					isAdmin: { type: 'boolean' },
					canDonate: { type: 'boolean' },
					profile: ref('UserProfile'),
				},
			},
			UserSearchRequest: {
				type: 'object',
				properties: {
					username: { type: 'string' },
					firstname: { type: 'string' },
					lastname: { type: 'string' },
					email: { type: 'string' },
					phoneNumber: { type: 'string' },
					gender: { type: 'string', enum: ['male', 'female'] },
					isAdmin: { type: 'boolean' },
					bloodGroup: { type: 'string' },
					availableForDonation: { type: 'boolean' },
					minAge: { type: 'integer' },
					maxAge: { type: 'integer' },
					age: { type: 'array', minItems: 2, maxItems: 2, items: { type: 'integer' } },
					page: { type: 'integer', minimum: 1 },
					perPage: { type: 'integer', minimum: 1 },
				},
			},
			UsersPage: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					users: { type: 'array', items: ref('User') },
					totalItems: { type: 'integer' },
					page: { type: 'integer' },
					perPage: { type: 'integer' },
				},
			},
			Dashboard: {
				type: 'object',
				properties: {
					stats: {
						type: 'object',
						properties: {
							total: { type: 'integer' },
							lastDonation: { type: 'string', nullable: true },
							eligibleIn: { type: 'string', example: '12 days' },
						},
					},
					donations: { type: 'array', items: ref('Donation') },
				},
			},
			AdminStats: {
				type: 'object',
				properties: {
					totalUsers: { type: 'integer' },
					totalEvents: { type: 'integer' },
					totalDonations: { type: 'integer' },
				},
			},
			DonationInput: {
				type: 'object',
				required: ['bloodGroup', 'donationDate', 'donationType'],
				properties: {
					bloodGroup: { type: 'string', example: 'O+' },
					donationDate: { type: 'string', format: 'date-time' },
					donationType: { type: 'string', example: 'BLOOD' },
					eventId: { type: 'string', description: 'Optional event ID; the generic event is used when omitted.' },
				},
			},
			Donation: {
				allOf: [
					ref('DonationInput'),
					{
						type: 'object',
						properties: {
							_id: { type: 'string' },
							userId: { type: 'string' },
							event: {
								type: 'object',
								nullable: true,
								properties: {
									title: { type: 'string' },
									reference: { type: 'string' },
									isGeneric: { type: 'boolean' },
								},
							},
						},
					},
				],
			},
			Eligibility: {
				type: 'object',
				properties: {
					canDonate: { type: 'boolean' },
					lastDonationDate: { type: 'string', nullable: true, example: '15/05/2026' },
					nextDonationDate: { type: 'string', nullable: true, example: '14/07/2026' },
				},
			},
			Event: {
				type: 'object',
				properties: {
					_id: { type: 'string' },
					reference: { type: 'string', example: 'WEVENT20261205' },
					title: { type: 'string' },
					subtitle: { type: 'string' },
					image: { type: 'string', format: 'byte' },
					location: { type: 'string' },
					date: { type: 'string', format: 'date-time' },
					mapLink: { type: 'string', format: 'uri' },
					description: { type: 'string' },
					isGeneric: { type: 'boolean' },
					qrCode: { type: 'string', description: 'Admin-only data URL' },
				},
			},
			EventForm: {
				type: 'object',
				required: ['title', 'location', 'date'],
				properties: {
					title: { type: 'string' },
					subtitle: { type: 'string' },
					image: { type: 'string', format: 'binary', description: 'Image file, maximum 5 MB.' },
					location: { type: 'string' },
					date: { type: 'string', format: 'date' },
					mapLink: { type: 'string' },
					description: { type: 'string' },
					isGeneric: { type: 'boolean' },
				},
			},
			EventsPage: {
				type: 'object',
				properties: {
					events: { type: 'array', items: ref('Event') },
					totalItems: { type: 'integer' },
				},
			},
			EventResponse: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					event: ref('Event'),
				},
			},
			EventMutationResponse: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					event: ref('Event'),
				},
			},
			ParticipantStats: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					eventReference: { type: 'string' },
					isGeneric: { type: 'boolean' },
					allDonaters: { type: 'integer' },
					registeredParticipants: { type: 'integer' },
					realDonaters: { type: 'integer' },
				},
			},
			ParticipationStatus: {
				type: 'object',
				properties: {
					hasParticipated: { type: 'boolean' },
					message: { type: 'string' },
				},
			},
			EmergencyInput: {
				type: 'object',
				required: ['bloodGroup', 'city', 'phoneNumber'],
				properties: {
					bloodGroup: { type: 'string', enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
					city: { type: 'string', example: 'Casablanca' },
					phoneNumber: { type: 'string', example: '0612345678' },
					details: { type: 'string' },
				},
			},
			Emergency: {
				allOf: [
					ref('EmergencyInput'),
					{
						type: 'object',
						properties: {
							_id: { type: 'string' },
							isConfirmed: { type: 'boolean' },
							contactedUsers: { type: 'array', items: { type: 'string' } },
						},
					},
				],
			},
			EmergencyResponse: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					emergency: ref('Emergency'),
				},
			},
			EmergenciesPage: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					emergencies: { type: 'array', items: ref('Emergency') },
					totalItems: { type: 'integer' },
				},
			},
			MatchingUsersPage: {
				type: 'object',
				properties: {
					message: { type: 'string' },
					matchingUsers: { type: 'array', items: ref('User') },
					totalItems: { type: 'integer' },
				},
			},
			ContactRequest: {
				type: 'object',
				required: ['subject', 'message'],
				properties: {
					firstname: { type: 'string' },
					lastname: { type: 'string' },
					email: { type: 'string', format: 'email' },
					phoneNumber: { type: 'string' },
					subject: { type: 'string' },
					message: { type: 'string' },
				},
			},
		},
	},
};
