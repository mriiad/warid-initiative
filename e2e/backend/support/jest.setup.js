// The auth secrets live in one shared file so this suite and the
// mongodb-memory-server suite (jest.config.js) cannot drift apart. See
// e2e/support/authEnv.js.
require('../../support/authEnv');
process.env.EMAIL_ENABLED = 'true';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:4200';
