module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/e2e/backend/**/*.spec.js'],
	setupFiles: ['<rootDir>/e2e/backend/support/jest.setup.js'],
	verbose: true,
	forceExit: true,
	collectCoverage: true,
	collectCoverageFrom: [
		'src/controllers/**/*.js',
		'src/middleware/**/*.js',
		'src/routes/**/*.js',
	],
	coverageDirectory: '<rootDir>/coverage/backend',
};
