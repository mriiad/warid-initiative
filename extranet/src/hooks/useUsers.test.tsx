import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { usersService } from '../services';
import { useUpdateMyProfile } from './useUsers';

vi.mock('../services', () => ({
	usersService: {
		updateMyProfile: vi.fn(),
	},
}));

function wrapper({ children }: { children: ReactNode }) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useUpdateMyProfile (issue #204)', () => {
	it('calls usersService.updateMyProfile with the raw profile data (no userId wrapper)', async () => {
		vi.mocked(usersService.updateMyProfile).mockResolvedValueOnce({} as any);
		const { result } = renderHook(() => useUpdateMyProfile(), { wrapper });

		result.current.mutate({ firstname: 'Yassine' });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(usersService.updateMyProfile).toHaveBeenCalledWith({ firstname: 'Yassine' });
	});
});
