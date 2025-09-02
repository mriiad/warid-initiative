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
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion'],
	},
});
