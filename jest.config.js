module.exports = {
  testEnvironment: 'node',
  // Scoped to the repo-root e2e/ dir only -- extranet/e2e/**/*.spec.ts are
  // Playwright specs (ES module syntax, run separately via `npm run test:e2e`
  // inside extranet/), not Jest tests, and must not be picked up here.
  testMatch: ['<rootDir>/e2e/**/*.spec.[jt]s'],
  // e2e/backend/**/*.spec.js are the Mongoose-mocked suite, run separately
  // via jest.backend.config.js (npm run test:e2e:backend) with its own
  // setupFiles (dummy JWT secrets, no real DB). This config wires up
  // e2e/setup.js instead (real mongodb-memory-server connection via
  // setupFilesAfterEnv), which the backend suite's mocks aren't meant to
  // run under -- doing so leaves their auth secrets unset and breaks them.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/backend/'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
