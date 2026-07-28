import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

import { resolveManualChunk } from './src/build/vendorChunks';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		port: 4200,
		open: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: 'build',
		sourcemap: true,
		rollupOptions: {
			output: {
				// Grouping rules live in src/build/vendorChunks.ts so they can
				// be unit tested -- getting them wrong doesn't fail the build,
				// it ships a bundle that throws on load.
				manualChunks: resolveManualChunk,
			},
		},
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion'],
	},
});
