const jwt = require('jsonwebtoken');

// Matches the JWT_SECRET_KEY env var set in jest.backend.setup.js, which
// isAuth (token-check.js) reads via src/utils/config.js -- the same source
// auth.js signs real login tokens from, so this verifies the same way.
const TEST_SECRET = 'test-jwt-secret-key-for-sandbox';

function signAuthToken(userId, email = 'test@example.com') {
	return jwt.sign({ userId, email }, TEST_SECRET, { expiresIn: '1d' });
}

function authHeader(userId, email) {
	return `Bearer ${signAuthToken(userId, email)}`;
}

module.exports = { signAuthToken, authHeader, TEST_SECRET };
