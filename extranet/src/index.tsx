import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './index.css';
import theme from './theme';
import { I18nextProvider } from 'react-i18next';
import i18n from './translation/i18n';

const queryClient = new QueryClient();

ReactDOM.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<AuthProvider>
				   <I18nextProvider i18n={i18n}>
                      <App />
                   </I18nextProvider>
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
