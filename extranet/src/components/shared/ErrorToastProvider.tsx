import React, { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API_CONFIG from '../../utils/apiConfig';
import SnackbarComponent from './SnackbarComponent';

interface ErrorToastContextValue {
	/** Pass the caught error straight through -- extracts the backend's own
	 * message when there is one, same as every hand-rolled call site already
	 * does (`error.response?.data?.message || t('...')`), falling back to a
	 * translated generic message otherwise. */
	showError: (error: unknown) => void;
}

const ErrorToastContext = createContext<ErrorToastContextValue | undefined>(
	undefined
);

const extractBackendMessage = (error: unknown): string | undefined => {
	const response = (
		error as { response?: { data?: { message?: string; error?: string } } }
	)?.response;
	return response?.data?.message || response?.data?.error;
};

/**
 * One toast, mounted once at the app root, for mutations that have no
 * call-site error handling of their own.
 *
 * Before this, every mutation hook's onError did exactly
 * `console.error(...)` and nothing else -- 23 of them, all copy-pasted, none
 * showing the user anything unless the *component* also remembered to pass
 * its own onError to `.mutate()`. That got forgotten repeatedly (issues
 * #293, #300, an earlier contact-form fix), each patched individually with
 * local `useState` + a `SnackbarComponent` + wiring. See issue #307.
 *
 * This isn't a replacement for that pattern where it already exists and is
 * doing something more specific (a field-level error, an inline message, a
 * whole dedicated error screen) -- it's a fallback for the mutations that
 * had *nothing*. `useErrorToast().showError(error)` is the one line those
 * call sites (or their hooks) now add.
 */
export const ErrorToastProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { t } = useTranslation();
	const [message, setMessage] = useState<string | null>(null);

	const showError = useCallback(
		(error: unknown) => {
			setMessage(extractBackendMessage(error) || t('common.error'));
		},
		[t]
	);

	const handleClose = useCallback(() => setMessage(null), []);

	return (
		<ErrorToastContext.Provider value={{ showError }}>
			{children}
			<SnackbarComponent
				open={!!message}
				message={message || ''}
				handleClose={handleClose}
				autoHideDuration={API_CONFIG.ui.snackbarDuration}
			/>
		</ErrorToastContext.Provider>
	);
};

export const useErrorToast = () => {
	const context = useContext(ErrorToastContext);
	if (context === undefined) {
		throw new Error('useErrorToast must be used within an ErrorToastProvider');
	}
	return context;
};
