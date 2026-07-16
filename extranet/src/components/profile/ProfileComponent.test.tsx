import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileComponent from './ProfileComponent';

const updateMyProfileMutate = vi.fn(
	(_data: any, opts?: { onSuccess?: () => void; onError?: (e: any) => void }) => {
		opts?.onSuccess?.();
	}
);

const logoutMutate = vi.fn(
	(_data: undefined, opts?: { onSuccess?: () => void; onError?: (e: any) => void }) => {
		opts?.onSuccess?.();
	}
);

vi.mock('../../auth/AuthContext', () => ({
	useAuth: () => ({
		token: 'fake-token',
		setToken: vi.fn(),
		setIsAdmin: vi.fn(),
		setUserId: vi.fn(),
	}),
}));

// Must be a stable reference across renders: ProfileComponent has a
// `useEffect(() => {...}, [userInfo])` that calls setState, so returning a
// fresh object literal on every call here would retrigger the effect on
// every render and infinite-loop the test.
const USER_PROFILE_QUERY_RESULT = {
	data: {
		data: {
			firstname: 'Yassine',
			lastname: 'Alaoui',
			birthdate: '1995-05-20T00:00:00.000Z',
			bloodGroup: 'O+',
			city: 'Casablanca',
			phoneNumber: '+212612345678',
			email: 'yassine@example.com',
		},
	},
	isLoading: false,
	isError: false,
	refetch: vi.fn(),
};

vi.mock('../../hooks', () => ({
	useUserProfile: () => USER_PROFILE_QUERY_RESULT,
	useUpdateMyProfile: () => ({ mutate: updateMyProfileMutate }),
	useUpdatePassword: () => ({ mutate: vi.fn() }),
	useAuth: () => ({ logout: { mutate: logoutMutate } }),
}));

function renderComponent() {
	const queryClient = new QueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MemoryRouter>
				<ProfileComponent />
			</MemoryRouter>
		</QueryClientProvider>
	);
}

beforeEach(() => {
	updateMyProfileMutate.mockClear();
	logoutMutate.mockClear();
});

describe('ProfileComponent - save profile (issue #204)', () => {
	it('BUG regression: no longer sends { userId: "me", data } through the admin-only endpoint', async () => {
		const user = userEvent.setup();
		renderComponent();

		await screen.findByText('Yassine', { exact: true });
		await user.click(screen.getAllByTestId('EditIcon')[0]);
		await user.click(screen.getByRole('button', { name: /save changes/i }));

		await waitFor(() => expect(updateMyProfileMutate).toHaveBeenCalledTimes(1));
		const [submittedArg] = updateMyProfileMutate.mock.calls[0];

		// The old buggy call shape was `{ userId: 'me', data: {...} }`
		// (routed to PUT /api/users/me, the admin-only endpoint). The fixed
		// hook's mutationFn takes the profile data directly and PATCHes
		// /api/user/profile, resolved server-side from the auth token.
		expect(submittedArg).not.toHaveProperty('userId');
		expect(submittedArg).not.toHaveProperty('data');
		expect(submittedArg.firstname).toBe('Yassine');
		expect(submittedArg.email).toBe('yassine@example.com');
	});

	it('sends the phone number as a string, matching the User schema', async () => {
		const user = userEvent.setup();
		renderComponent();

		await screen.findByText('Yassine', { exact: true });
		await user.click(screen.getAllByTestId('EditIcon')[0]);
		await user.click(screen.getByRole('button', { name: /save changes/i }));

		await waitFor(() => expect(updateMyProfileMutate).toHaveBeenCalledTimes(1));
		const [submittedArg] = updateMyProfileMutate.mock.calls[0];
		expect(submittedArg.phoneNumber).toBe('+212612345678');
		expect(typeof submittedArg.phoneNumber).toBe('string');
	});

	it('shows a success message and exits edit mode on success', async () => {
		const user = userEvent.setup();
		renderComponent();

		await screen.findByText('Yassine', { exact: true });
		await user.click(screen.getAllByTestId('EditIcon')[0]);
		await user.click(screen.getByRole('button', { name: /save changes/i }));

		await waitFor(() =>
			expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument()
		);
		// Back to read-only mode: the Save button is gone.
		expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
	});

	it('shows an error message and stays in edit mode on failure', async () => {
		updateMyProfileMutate.mockImplementationOnce((_data: any, opts: any) => {
			opts?.onError?.(new Error('network error'));
		});
		const user = userEvent.setup();
		renderComponent();

		await screen.findByText('Yassine', { exact: true });
		await user.click(screen.getAllByTestId('EditIcon')[0]);
		await user.click(screen.getByRole('button', { name: /save changes/i }));

		await waitFor(() =>
			expect(screen.getByText('Failed to update profile.')).toBeInTheDocument()
		);
		expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
	});
});

describe('ProfileComponent - logout', () => {
	it('a logout button is reachable and triggers the logout mutation', async () => {
		// Logout used to only exist in AdminDashboard and the legacy nav
		// components, leaving non-admin users with no way to sign out from
		// this, the actual "my account" screen they land on.
		const user = userEvent.setup();
		renderComponent();

		await screen.findByText('Yassine', { exact: true });
		await user.click(screen.getByRole('button', { name: /log out/i }));

		expect(logoutMutate).toHaveBeenCalledTimes(1);
	});
});
