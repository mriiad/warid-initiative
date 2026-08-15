import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ErrorToastProvider, useErrorToast } from './ErrorToastProvider';

/**
 * Regression coverage for issue #307: this is the shared mechanism every
 * mutation hook now falls back to instead of `console.error(...)` and
 * nothing else.
 */
const TriggerError: React.FC<{ error: unknown }> = ({ error }) => {
	const { showError } = useErrorToast();
	return (
		<button type='button' onClick={() => showError(error)}>
			trigger
		</button>
	);
};

const renderWithProvider = (error: unknown) =>
	render(
		<ErrorToastProvider>
			<TriggerError error={error} />
		</ErrorToastProvider>
	);

describe('ErrorToastProvider / useErrorToast', () => {
	it('shows the backend-provided message when one exists', async () => {
		const user = userEvent.setup();
		renderWithProvider({ response: { data: { message: 'Username already taken.' } } });

		await user.click(screen.getByRole('button', { name: 'trigger' }));

		expect(await screen.findByText('Username already taken.')).toBeInTheDocument();
	});

	it('falls back to the alternate "error" field when there is no "message"', async () => {
		const user = userEvent.setup();
		renderWithProvider({ response: { data: { error: 'Validation failed.' } } });

		await user.click(screen.getByRole('button', { name: 'trigger' }));

		expect(await screen.findByText('Validation failed.')).toBeInTheDocument();
	});

	it('falls back to a translated generic message for a network error with no response body', async () => {
		const user = userEvent.setup();
		renderWithProvider(new Error('Network Error'));

		await user.click(screen.getByRole('button', { name: 'trigger' }));

		expect(await screen.findByText('An error occurred.')).toBeInTheDocument();
	});

	it('throws if used outside the provider', () => {
		const Bare = () => {
			useErrorToast();
			return null;
		};
		// React logs its own error boundary noise for this; the assertion is
		// on the throw itself, not the console output.
		expect(() => render(<Bare />)).toThrow(
			'useErrorToast must be used within an ErrorToastProvider'
		);
	});
});
