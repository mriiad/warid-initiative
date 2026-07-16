import { describe, expect, it, vi } from 'vitest';
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
