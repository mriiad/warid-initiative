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
	// PLACEHOLDER -- not a real Warid number. Shown as the "contact us at"
	// number in every emergency WhatsApp message (see MatchedUsers.tsx),
	// regardless of which admin sends it or what phone number was entered
	// when the emergency itself was created. Override with VITE_WHATSAPP_CONTACT_NUMBER,
	// or just replace the value below once Warid has an official number.
	WHATSAPP_CONTACT_NUMBER: '+212600000000',
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
