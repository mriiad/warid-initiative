// Auth secrets for the test suites.
//
// config.js deliberately has no fallback for these -- a missing secret must
// never resolve to a usable signing key, or a deployment that forgets one
// signs every token with a value published in this repository (issue #394).
// That means each suite has to supply its own, so both jest configs load
// this same file and cannot drift apart: jest.backend.config.js via
// e2e/backend/support/jest.setup.js, and jest.config.js via setupFiles.
//
// jwtHelper.js's TEST_SECRET must match JWT_SECRET_KEY below, so tokens the
// helper mints verify through the real token-check.js.
process.env.JWT_SECRET_KEY = 'test-jwt-secret-key-for-sandbox';
process.env.REFRESH_SECRET_KEY = 'test-refresh-secret-key-for-sandbox';
