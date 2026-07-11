import { describe, expect, it } from 'vitest';
import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';

type Json = { [key: string]: Json | string | Json[] };

const flattenKeys = (obj: Json, prefix = ''): string[] => {
	return Object.entries(obj).flatMap(([key, value]) => {
		const path = prefix ? `${prefix}.${key}` : key;
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			return flattenKeys(value as Json, path);
		}
		return [path];
	});
};

describe('i18n locale files', () => {
	const locales: Record<string, Json> = { en, fr, ar };
	const keySets = Object.fromEntries(
		Object.entries(locales).map(([lang, data]) => [lang, new Set(flattenKeys(data))])
	);

	it('have at least one translation key', () => {
		expect(keySets.en.size).toBeGreaterThan(0);
	});

	it('all three languages define exactly the same set of keys', () => {
		const [reference, ...rest] = Object.entries(keySets);
		const [referenceLang, referenceKeys] = reference;

		rest.forEach(([lang, keys]) => {
			const missing = [...referenceKeys].filter((key) => !keys.has(key));
			const extra = [...keys].filter((key) => !referenceKeys.has(key));

			expect(missing, `${lang} is missing keys present in ${referenceLang}`).toEqual([]);
			expect(extra, `${lang} has extra keys not present in ${referenceLang}`).toEqual([]);
		});
	});

	it('every key resolves to a non-empty string leaf (or array of objects for FAQ)', () => {
		const checkLeaves = (obj: Json, path = '') => {
			Object.entries(obj).forEach(([key, value]) => {
				const currentPath = path ? `${path}.${key}` : key;
				if (Array.isArray(value)) {
					value.forEach((item) => {
						expect(item).toHaveProperty('question');
						expect(item).toHaveProperty('answer');
					});
				} else if (value && typeof value === 'object') {
					checkLeaves(value as Json, currentPath);
				} else {
					expect(typeof value, `${currentPath} should be a string`).toBe('string');
					expect(
						(value as string).length > 0,
						`${currentPath} should not be empty`
					).toBe(true);
				}
			});
		};

		Object.values(locales).forEach((data) => checkLeaves(data));
	});
});
