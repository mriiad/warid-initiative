import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ErrorToastProvider } from './components/shared/ErrorToastProvider';
import './i18n';
import './index.css';
import theme from './theme';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Was previously unset (defaulting to 5 minutes only be we forget) --
			// every hook was hand-typing the same 5*60*1000 literal (or a
			// deliberately shorter one, which still overrides this). One place
			// to change the app-wide default now.
			staleTime: 5 * 60 * 1000,
			// The default of 3 meant a query against a route that's genuinely
			// unauthenticated (no session yet) would retry itself three times
			// before giving up, each retry re-triggering apiClient's 401
			// handling. See issue #195 -- the actual fix there was gating the
			// query on enabled, but a lower retry count is a sane app-wide
			// default regardless.
			retry: 1,
		},
	},
});

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

root.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<AuthProvider>
					<ErrorToastProvider>
						<BrowserRouter
							future={{
								v7_startTransition: true,
								v7_relativeSplatPath: true,
							}}
						>
							<App />
						</BrowserRouter>
					</ErrorToastProvider>
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
