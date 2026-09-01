import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

/**
 * Regression coverage for issue #373: apiClient's silent token refresh
 * writes the new token straight to localStorage (it has no access to this
 * context) and announces the change via a window event instead. Without a
 * listener here, `token` would stay the pre-refresh value for the rest of
 * the session even though localStorage had already moved on.
 */
const ShowToken: React.FC = () => {
	const { token } = useAuth();
	return <div>token: {token ?? 'null'}</div>;
};

describe('AuthContext / auth:token-refreshed', () => {
	beforeEach(() => {
		localStorage.clear();
	});
	afterEach(() => {
		localStorage.clear();
	});

	it('updates the in-memory token when apiClient announces a silent refresh', async () => {
		localStorage.setItem('token', 'stale-token');
		render(
			<AuthProvider>
				<ShowToken />
			</AuthProvider>
		);

		expect(await screen.findByText('token: stale-token')).toBeInTheDocument();

		// Simulate apiClient's attemptRefresh() writing the new token and
		// dispatching the event, without going through a real HTTP call.
		localStorage.setItem('token', 'fresh-token');
		act(() => {
			window.dispatchEvent(new Event('auth:token-refreshed'));
		});

		expect(await screen.findByText('token: fresh-token')).toBeInTheDocument();
	});
});
