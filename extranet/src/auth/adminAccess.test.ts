import { describe, expect, it } from 'vitest';
import { AdminRole } from '../data/constants';
import { hasAdminRole } from './adminAccess';

describe('hasAdminRole', () => {
	it('refuses a non-admin regardless of allowed roles', () => {
		expect(hasAdminRole(false, null, [AdminRole.Event])).toBe(false);
		expect(hasAdminRole(false, AdminRole.Event, [AdminRole.Event])).toBe(false);
	});

	it('grants a Principal Admin access to every route (issue #183: full access to everything)', () => {
		expect(hasAdminRole(true, AdminRole.Principal, [])).toBe(true);
		expect(hasAdminRole(true, AdminRole.Principal, [AdminRole.Emergency])).toBe(true);
		expect(hasAdminRole(true, AdminRole.Principal, [AdminRole.Event])).toBe(true);
	});

	it('grants an admin with no role recorded the same full access as principal', () => {
		// Every admin created before this field existed has isAdmin: true and
		// no role -- they already had full access, and this must not silently
		// take it away. See requireAdminRole.js on the backend for the mirror
		// of this same rule.
		expect(hasAdminRole(true, null, [])).toBe(true);
		expect(hasAdminRole(true, null, [AdminRole.Emergency])).toBe(true);
	});

	it('restricts an Emergency Admin to routes that allow the emergency role', () => {
		expect(hasAdminRole(true, AdminRole.Emergency, [AdminRole.Emergency])).toBe(true);
		expect(hasAdminRole(true, AdminRole.Emergency, [AdminRole.Event])).toBe(false);
		expect(hasAdminRole(true, AdminRole.Emergency, [])).toBe(false);
	});

	it('restricts an Event Admin to routes that allow the event role', () => {
		expect(hasAdminRole(true, AdminRole.Event, [AdminRole.Event])).toBe(true);
		expect(hasAdminRole(true, AdminRole.Event, [AdminRole.Emergency])).toBe(false);
		expect(hasAdminRole(true, AdminRole.Event, [])).toBe(false);
	});
});
