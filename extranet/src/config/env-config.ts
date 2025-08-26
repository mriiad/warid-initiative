/**
 * Environment Configuration
 * This file contains environment variables for the application
 * Update these values according to your deployment environment
 */

export const ENV_CONFIG = {
	API_URL: 'http://localhost:3000',
	FRONTEND_URL: 'http://localhost:4200',
	NODE_ENV: 'development',
	ENABLE_DEBUG: true,
	ENABLE_ANALYTICS: false,
} as const;

export const getEnvVar = (key: keyof typeof ENV_CONFIG): string => {
	if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
		const viteVar = `VITE_${key}`;
		const viteEnv = (import.meta as any).env;
		const viteValue = viteEnv?.[viteVar];
		if (viteValue !== undefined) {
			return viteValue;
		}
	}

	return ENV_CONFIG[key].toString();
};
