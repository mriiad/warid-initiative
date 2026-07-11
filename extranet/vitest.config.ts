import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/setupTests.js'],
		include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
		css: false,
		// No unit tests exist on this branch yet -- don't fail CI for that,
		// only for actual test failures once tests are added.
		passWithNoTests: true,
	},
});
