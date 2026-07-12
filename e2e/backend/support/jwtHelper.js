const jwt = require('jsonwebtoken');

// Matches the secret in the sandbox-local config.json (authConfig.SECRET_KEY)
// and the JWT_SECRET_KEY env var set in jest.backend.setup.js, so tokens
// verify the same way a real login-issued token would via isAuth.
const TEST_SECRET = 'test-jwt-secret-key-for-sandbox';

function signAuthToken(userId, email = 'test@example.com') {
	return jwt.sign({ userId, email }, TEST_SECRET, { expiresIn: '1d' });
}

function authHeader(userId, email) {
	return `Bearer ${signAuthToken(userId, email)}`;
}

module.exports = { signAuthToken, authHeader, TEST_SECRET };
