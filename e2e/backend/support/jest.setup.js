// Must match config.json's authConfig.SECRET_KEY (see jwtHelper.js) so that
// tokens issued the way auth.js issues them (via src/utils/config.js) verify
// correctly through token-check.js (via config.json) inside this test run.
process.env.JWT_SECRET_KEY = 'test-jwt-secret-key-for-sandbox';
process.env.SECRET_KEY = 'test-secret-key-for-sandbox';
process.env.REFRESH_SECRET_KEY = 'test-refresh-secret-key-for-sandbox';
process.env.EMAIL_ENABLED = 'true';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:4200';
