import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import PasswordField from './PasswordField';

// PasswordField is always rendered inside react-hook-form's <Controller>
// with `field` spread onto it, and `field` carries a ref. As a plain
// function component it could not receive one: React warned and dropped
// it, so RHF had no node to focus and shouldFocusError (on by default)
// silently focused nothing. See issue #387.
const Form = () => {
	const { control, handleSubmit } = useForm({ defaultValues: { password: '' } });
	return (
		<form onSubmit={handleSubmit(() => {})}>
			<Controller
				name='password'
				control={control}
				rules={{ required: 'required' }}
				render={({ field }) => <PasswordField {...field} label='Password' />}
			/>
			<button type='submit'>submit</button>
		</form>
	);
};

describe('PasswordField (issue #387)', () => {
	it('focuses the password input when validation fails on submit', async () => {
		const user = userEvent.setup();
		render(<Form />);

		const input = screen.getByLabelText('Password');
		expect(input).not.toHaveFocus();

		await user.click(screen.getByRole('button', { name: 'submit' }));

		// This is the behaviour the dropped ref cost us: RHF walks to the
		// first invalid field and focuses it. Without forwardRef there was
		// no element to walk to and focus stayed on the submit button.
		expect(input).toHaveFocus();
	});

	it('forwards the ref to the input element itself, not the wrapper', () => {
		const ref = createRef<HTMLInputElement>();
		render(<PasswordField label='Password' ref={ref} />);
		expect(ref.current).not.toBeNull();
		expect(ref.current?.tagName).toBe('INPUT');
	});

	it('still honours an inputRef passed directly by the caller', () => {
		const inputRef = createRef<HTMLInputElement>();
		render(<PasswordField label='Password' inputRef={inputRef} />);
		expect(inputRef.current?.tagName).toBe('INPUT');
	});

	it('still toggles visibility', async () => {
		const user = userEvent.setup();
		render(<PasswordField label='Password' />);
		const input = screen.getByLabelText('Password');
		expect(input).toHaveAttribute('type', 'password');
		await user.click(screen.getByRole('button'));
		expect(input).toHaveAttribute('type', 'text');
	});
});
