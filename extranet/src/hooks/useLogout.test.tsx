import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorToastProvider } from '../components/shared/ErrorToastProvider';
import { authService } from '../services';
import { useLogout } from './useAuth';

vi.mock('../services', () => ({
	authService: { logout: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	// useLogout surfaces a failed logout through the shared toast (issue
	// #307), so the hook needs that provider in scope.
	return (
		<QueryClientProvider client={queryClient}>
			<ErrorToastProvider>{children}</ErrorToastProvider>
		</QueryClientProvider>
	);
}

const seedSession = () => {
	localStorage.setItem('token', 'access-token');
	localStorage.setItem('refreshToken', 'refresh-token');
	localStorage.setItem('userId', 'user-1');
	localStorage.setItem('isAdmin', 'false');
	localStorage.setItem('adminRole', 'principal');
};

const sessionKeys = ['token', 'refreshToken', 'userId', 'isAdmin', 'adminRole'];

// Local state used to be cleared only in onSuccess, so a network blip left
// every token on the device: the user pressed "log out", saw an error toast,
// and was still logged in. See issue #404.
describe('useLogout (issue #404)', () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	it('clears the session when the server call succeeds', async () => {
		vi.mocked(authService.logout).mockResolvedValueOnce({} as any);
		seedSession();
		const { result } = renderHook(() => useLogout(), { wrapper });
		result.current.mutate();
		await waitFor(() => expect(result.current.isPending).toBe(false));
		sessionKeys.forEach((k) => expect(localStorage.getItem(k)).toBeNull());
	});

	it('still clears the session when the server call fails', async () => {
		// The part that must never fail. Revoking server-side is best-effort
		// on top of this, not a precondition for it.
		vi.mocked(authService.logout).mockRejectedValueOnce(new Error('network down'));
		seedSession();
		const { result } = renderHook(() => useLogout(), { wrapper });
		result.current.mutate();
		await waitFor(() => expect(result.current.isPending).toBe(false));
		sessionKeys.forEach((k) => expect(localStorage.getItem(k)).toBeNull());
	});
});
