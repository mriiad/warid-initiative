module.exports = {
  testEnvironment: 'node',
  // Scoped to the repo-root e2e/ dir only -- extranet/e2e/**/*.spec.ts are
  // Playwright specs (ES module syntax, run separately via `npm run test:e2e`
  // inside extranet/), not Jest tests, and must not be picked up here.
  testMatch: ['<rootDir>/e2e/**/*.spec.[jt]s'],
  // e2e/backend/**/*.spec.js are the Mongoose-mocked suite, run separately
  // via jest.backend.config.js (npm run test:e2e:backend) with its own
  // setup. This config wires up e2e/setup.js instead (real
  // mongodb-memory-server connection via setupFilesAfterEnv), which the
  // backend suite's mocks aren't meant to run under.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/backend/'],
  // setupFiles, not setupFilesAfterEnv: this has to run before the spec
  // files require src/utils/config.js, which no longer falls back to a
  // built-in JWT secret (issue #394).
  setupFiles: ['<rootDir>/e2e/support/authEnv.js'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  // Every test here talks to a freshly booted mongod over a socket, and the
  // first in each file also pays for whatever indexes Mongoose builds lazily
  // on the models it touches. Jest's 5s default is sized for a unit test.
  // e2e/setup.js gives the hooks that boot and stop the server their own,
  // much longer budget.
  testTimeout: 20000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
