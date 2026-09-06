import React, { createContext, useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import API_CONFIG from '../../utils/apiConfig';
import { resolveApiErrorMessage } from '../../utils/apiError';
import SnackbarComponent from './SnackbarComponent';

interface ErrorToastContextValue {
	/** Pass the caught error straight through. Renders the app's own
	 * translated copy when the response carries an error code it recognises,
	 * falling back to the backend's own message and then to a translated
	 * generic one. See issue #434. */
	showError: (error: unknown) => void;
}

const ErrorToastContext = createContext<ErrorToastContextValue | undefined>(
	undefined
);


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
			setMessage(resolveApiErrorMessage(error, t));
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

// Same Provider-plus-hook pattern, same react-refresh/only-export-components
// trade-off, as useAuth in auth/AuthContext.tsx -- see the comment there.
// eslint-disable-next-line react-refresh/only-export-components
export const useErrorToast = () => {
	const context = useContext(ErrorToastContext);
	if (context === undefined) {
		throw new Error('useErrorToast must be used within an ErrorToastProvider');
	}
	return context;
};
