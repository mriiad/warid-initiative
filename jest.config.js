module.exports = {
  testEnvironment: 'node',
  // Scoped to the repo-root e2e/ dir only -- extranet/e2e/**/*.spec.ts are
  // Playwright specs (ES module syntax, run separately via `npm run test:e2e`
  // inside extranet/), not Jest tests, and must not be picked up here.
  testMatch: ['<rootDir>/e2e/**/*.spec.[jt]s'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
