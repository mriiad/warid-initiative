import { describe, expect, it, vi } from 'vitest';
import { BloodGroup } from '../data/constants';
import { apiClient } from '../utils/apiClient';
import { usersService } from './usersService';

vi.mock('../utils/apiClient', () => ({
	apiClient: {
		get: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('usersService.updateMyProfile (issue #204)', () => {
	it('PATCHes the self-service /api/user/profile endpoint, not an admin :userId route', () => {
		const data = { firstname: 'Yassine', phoneNumber: '+212612345678' };
		usersService.updateMyProfile(data);

		expect(apiClient.patch).toHaveBeenCalledWith('/api/user/profile', data);
		expect(apiClient.put).not.toHaveBeenCalled();
	});
});

describe('usersService.completeMyProfile (issue #300)', () => {
	it('PUTs /api/user/update through apiClient, not updateMyProfile\'s PATCH route', () => {
		// The two aren't interchangeable: PATCH /api/user/profile 404s if the
		// user has no Profile document yet (see updateUserProfile in
		// src/controllers/user.js), which is exactly the case for the
		// brand-new user this screen exists for. PUT /api/user/update creates
		// the Profile if it's missing.
		const data = { firstname: 'Yassine', bloodGroup: BloodGroup.OPositive };
		usersService.completeMyProfile(data);

		expect(apiClient.put).toHaveBeenCalledWith('/api/user/update', data);
	});
});
