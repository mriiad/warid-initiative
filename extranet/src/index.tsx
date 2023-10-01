import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'styled-components';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './index.css';
import theme from './theme';

const queryClient = new QueryClient();

ReactDOM.render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<AuthProvider>
					<App />
				</AuthProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
	document.getElementById('root')
);
