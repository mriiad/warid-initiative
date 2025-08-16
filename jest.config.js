module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/e2e/**/*.spec.[jt]s'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};
