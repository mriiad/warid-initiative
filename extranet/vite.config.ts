import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

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
				// Route screens are already split via React.lazy() in App.tsx.
				// The remaining oversized chunk was the shared vendor bundle
				// (react + react-dom + react-router + MUI/emotion + framer-motion
				// + date libs, all pulled in on first paint) -- split that by
				// library group too so no single chunk crosses the 500kB
				// warning threshold.
				manualChunks(id) {
					if (!id.includes('node_modules')) {
						return undefined;
					}
					if (/[\\/]@mui[\\/]|[\\/]@emotion[\\/]/.test(id)) {
						return 'vendor-mui';
					}
					if (/[\\/]framer-motion[\\/]/.test(id)) {
						return 'vendor-motion';
					}
					if (/[\\/]date-fns[\\/]|[\\/]dayjs[\\/]/.test(id)) {
						return 'vendor-date';
					}
					if (/[\\/]react-router(-dom)?[\\/]/.test(id)) {
						return 'vendor-router';
					}
					if (/[\\/]react[\\/]|[\\/]react-dom[\\/]|[\\/]scheduler[\\/]/.test(id)) {
						return 'vendor-react';
					}
					return 'vendor';
				},
			},
		},
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion'],
	},
});
