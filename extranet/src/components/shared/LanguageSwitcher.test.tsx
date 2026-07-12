import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import LanguageSwitcher from './LanguageSwitcher';

describe('LanguageSwitcher', () => {
	beforeEach(async () => {
		await i18n.changeLanguage('en');
	});

	afterEach(async () => {
		await i18n.changeLanguage('en');
	});

	it('renders a button that opens a menu with all three languages', async () => {
		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		await user.click(screen.getByRole('button', { name: /change language/i }));

		expect(await screen.findByText('العربية')).toBeInTheDocument();
		expect(screen.getByText('English')).toBeInTheDocument();
		expect(screen.getByText('Français')).toBeInTheDocument();
	});

	it('switches the active i18n language and document direction when a menu item is clicked', async () => {
		const user = userEvent.setup();
		render(<LanguageSwitcher />);

		await user.click(screen.getByRole('button', { name: /change language/i }));
		await user.click(await screen.findByText('العربية'));

		await waitFor(() => expect(i18n.resolvedLanguage).toBe('ar'));
		expect(document.documentElement.dir).toBe('rtl');
		expect(document.documentElement.lang).toBe('ar');
	});

	it('switches back to a left-to-right language and updates the document direction', async () => {
		const user = userEvent.setup();
		await i18n.changeLanguage('ar');
		render(<LanguageSwitcher />);

		await user.click(screen.getByRole('button', { name: /change language/i }));
		await user.click(await screen.findByText('Français'));

		await waitFor(() => expect(i18n.resolvedLanguage).toBe('fr'));
		expect(document.documentElement.dir).toBe('ltr');
		expect(document.documentElement.lang).toBe('fr');
	});
});
