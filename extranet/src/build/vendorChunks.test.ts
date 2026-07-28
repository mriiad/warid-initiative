import { describe, expect, it } from 'vitest';

import { getPackageName, getVendorChunk, resolveManualChunk } from './vendorChunks';

const nm = (suffix: string) => `/repo/extranet/node_modules/${suffix}`;

describe('getPackageName', () => {
	it('leaves first-party source unassigned', () => {
		expect(getPackageName('/repo/extranet/src/components/CanDonate.tsx')).toBeNull();
	});

	it('reads the package name, not an inner directory', () => {
		// input-format ships its bindings under modules/react/, which a
		// path-substring rule reads as the react package.
		expect(getPackageName(nm('input-format/modules/react/Input.js'))).toBe(
			'input-format'
		);
		expect(getPackageName(nm('react-transition-group/esm/Transition.js'))).toBe(
			'react-transition-group'
		);
	});

	it('keeps the scope on scoped packages', () => {
		expect(getPackageName(nm('@mui/material/Button/Button.js'))).toBe('@mui/material');
		expect(getPackageName(nm('@emotion/react/dist/emotion-react.esm.js'))).toBe(
			'@emotion/react'
		);
	});

	it('resolves the innermost package for nested and pnpm layouts', () => {
		expect(getPackageName(nm('.pnpm/react@19.0.0/node_modules/react/index.js'))).toBe(
			'react'
		);
		expect(getPackageName(nm('some-lib/node_modules/react-is/index.js'))).toBe(
			'react-is'
		);
	});

	it('is unaffected by rollup query suffixes', () => {
		expect(getPackageName(nm('react-dom/client.js?commonjs-proxy'))).toBe('react-dom');
	});
});

describe('getVendorChunk', () => {
	it('groups the react runtime together', () => {
		expect(getVendorChunk('react')).toBe('vendor-react');
		expect(getVendorChunk('react-dom')).toBe('vendor-react');
		expect(getVendorChunk('scheduler')).toBe('vendor-react');
	});

	it('groups every package in the MUI and emotion scopes', () => {
		expect(getVendorChunk('@mui/material')).toBe('vendor-mui');
		expect(getVendorChunk('@mui/icons-material')).toBe('vendor-mui');
		expect(getVendorChunk('@emotion/styled')).toBe('vendor-mui');
	});

	it('gives the phone metadata its own chunk', () => {
		expect(getVendorChunk('react-phone-number-input')).toBe('vendor-phone');
		expect(getVendorChunk('libphonenumber-js')).toBe('vendor-phone');
	});

	it('falls back to the shared chunk for everything else', () => {
		expect(getVendorChunk('axios')).toBe('vendor');
		expect(getVendorChunk('@tanstack/react-query')).toBe('vendor');
	});
});

describe('resolveManualChunk', () => {
	it('keeps every module of a package in one chunk', () => {
		// A package split across two chunks makes those chunks import each
		// other; the resulting ES module cycle leaves one side's bindings
		// uninitialised and the app renders a blank page.
		const inputFormatModules = [
			nm('input-format/index.js'),
			nm('input-format/modules/index.js'),
			nm('input-format/modules/react/Input.js'),
			nm('input-format/react/index.js'),
		];

		const chunks = new Set(inputFormatModules.map(resolveManualChunk));
		expect([...chunks]).toHaveLength(1);
	});

	it('does not pull react-adjacent packages into the react runtime chunk', () => {
		expect(resolveManualChunk(nm('input-format/modules/react/Input.js'))).not.toBe(
			'vendor-react'
		);
		expect(resolveManualChunk(nm('react-is/index.js'))).not.toBe('vendor-react');
		expect(resolveManualChunk(nm('react-hook-form/dist/index.esm.mjs'))).not.toBe(
			'vendor-react'
		);
	});

	it('leaves application code to the route-level split', () => {
		expect(resolveManualChunk('/repo/extranet/src/App.tsx')).toBeUndefined();
	});
});
