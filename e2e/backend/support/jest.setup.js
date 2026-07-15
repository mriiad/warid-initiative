// Must match jwtHelper.js's TEST_SECRET. Both auth.js and token-check.js
// read this same env var via src/utils/config.js, so tokens issued the way
// auth.js issues them verify correctly through token-check.js.
process.env.JWT_SECRET_KEY = 'test-jwt-secret-key-for-sandbox';
process.env.SECRET_KEY = 'test-secret-key-for-sandbox';
process.env.REFRESH_SECRET_KEY = 'test-refresh-secret-key-for-sandbox';
process.env.EMAIL_ENABLED = 'true';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:4200';
