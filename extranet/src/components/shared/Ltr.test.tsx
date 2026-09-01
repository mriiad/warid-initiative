import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Ltr from './Ltr';
import { isolateLtr } from '../../utils/bidi';

// Under the app's dir=rtl, a blood group's trailing +/- and a phone
// number's leading + were placed on the wrong visual side by the bidi
// algorithm -- "O+" rendered as "+O". See issue #384.
describe('Ltr (issue #384)', () => {
	it('isolates its content as an LTR run', () => {
		render(<Ltr>O+</Ltr>);
		const el = screen.getByText('O+');
		expect(el.tagName).toBe('BDI');
		expect(el.getAttribute('dir')).toBe('ltr');
	});

	it('keeps the caller className so existing styling is unaffected', () => {
		render(<Ltr className='badge'>AB-</Ltr>);
		expect(screen.getByText('AB-')).toHaveClass('badge');
	});
});

describe('isolateLtr (issue #384)', () => {
	it('wraps a value in LEFT-TO-RIGHT ISOLATE / POP DIRECTIONAL ISOLATE', () => {
		expect(isolateLtr('O+')).toBe('⁦O+⁩');
	});

	it('leaves the value itself untouched', () => {
		// The isolation must be presentational only -- nothing may be added
		// to or removed from the value a user reads or copies.
		expect(isolateLtr('+212612345670').replace(/[⁦⁩]/g, '')).toBe('+212612345670');
	});
});
