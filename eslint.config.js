const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
	{
		ignores: [
			'node_modules/**',
			'coverage/**',
			'extranet/**',
			// TypeScript-syntax type-definition files that were committed with
			// a .js extension by mistake (`export interface ...`). Nothing in
			// the CommonJS backend requires them -- grep confirms zero
			// references anywhere in src/ -- so they're dead weight rather
			// than live source. Excluding them avoids a parse-error false
			// positive without pretending the backend is a TypeScript project.
			'src/models/news.js',
			'src/payloads/authPayload.js',
		],
	},
	js.configs.recommended,
	{
		files: ['src/**/*.js', 'e2e/**/*.js', '__mocks__/**/*.js', '*.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				...globals.node,
				...globals.commonjs,
			},
		},
		rules: {
			'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
		},
	},
	{
		// e2e/ and __mocks__/ are Jest-only: e2e/**/*.js are Jest test files
		// (or Jest setup helpers), and __mocks__/**/*.js are Jest manual
		// mocks, both of which rely on Jest's injected globals
		// (describe/it/expect/jest/beforeAll/...).
		files: ['e2e/**/*.js', '__mocks__/**/*.js'],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
];
