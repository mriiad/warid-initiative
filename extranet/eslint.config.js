const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefreshPlugin = require('eslint-plugin-react-refresh');
const tseslint = require('typescript-eslint');

const reactRefresh = reactRefreshPlugin.default || reactRefreshPlugin;

module.exports = tseslint.config(
	{
		ignores: [
			'build/**',
			'dist/**',
			'coverage/**',
			'playwright-report/**',
			'test-results/**',
		],
	},
	js.configs.recommended,
	{
		// App source + Playwright specs: real TypeScript, parsed and linted
		// with typescript-eslint.
		files: ['**/*.{ts,tsx}'],
		extends: [...tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh,
		},
		rules: {
			// Match the repo's existing TS laxness (tsconfig has strict: false,
			// noUnusedLocals/noUnusedParameters: false) instead of imposing a
			// stricter baseline that would force an unrelated refactor.
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' },
			],
			// Only the classic hooks-rules checks -- eslint-plugin-react-hooks
			// v7's "recommended" preset also bundles a large set of React
			// Compiler-oriented rules (purity, immutability, set-state-in-render,
			// etc.) that assume compiler-targeted code patterns this codebase
			// doesn't follow; enabling them wholesale would require a broad,
			// unrelated refactor rather than catching real bugs.
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'react-refresh/only-export-components': [
				'warn',
				{ allowConstantExport: true },
			],
		},
	},
	{
		// Plain browser-run JS source files (setupTests.js, reportWebVitals.js)
		// -- ES modules, no TypeScript parsing needed.
		files: ['src/**/*.js'],
		languageOptions: {
			ecmaVersion: 2020,
			sourceType: 'module',
			globals: {
				...globals.browser,
			},
		},
	},
	{
		// Playwright specs run under Node, on top of the browser globals from
		// the ts/tsx block above.
		files: ['e2e/**/*.ts'],
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	{
		// Node-run CommonJS tooling files.
		files: ['eslint.config.js', 'server.js'],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				...globals.node,
			},
		},
	}
);
