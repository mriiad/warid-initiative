import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import AdminComponent from './components/AdminComponent';
import CanDonate from './components/CanDonate';
import EventConfirmation from './components/EventConfirmation';
import EventDetail from './components/EventDetail';
import EventsComponent from './components/EventsComponent';
import LoginForm from './components/LoginForm';
import MobileHeader from './components/MobileHeader';
import MobileNavbar from './components/MobileNavbar';
import NavBar from './components/NavBar';
import PasswordResetForm from './components/PasswordResetForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import SignupForm from './components/SignupForm';

const AppContainer = styled.div`
	font-family: Arial, sans-serif;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	height: 100vh;
`;

const ContentContainer = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const MobileNavContainer = styled.div`
	position: fixed;
	bottom: env(safe-area-inset-bottom);
	width: 100%;
	z-index: 101;
`;

const queryClient = new QueryClient();

const App = () => {
	const isMobile = useMediaQuery('(max-width:600px)');

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AppContainer>
					{isMobile ? (
						<>
							<MobileHeader />
							<MobileNavContainer>
								<MobileNavbar />
							</MobileNavContainer>
						</>
					) : (
						<NavBar />
					)}
					<ContentContainer>
						<Routes>
							<Route path='/' element={<Navigate replace to='/signup' />} />
							<Route path='/signup' element={<SignupForm />} />
							<Route path='/login' element={<LoginForm />} />
							<Route path='/events' element={<EventsComponent />} />
							<Route path='/events/:reference/*' element={<EventDetail />}>
								<Route path='can-donate' element={<CanDonate />} />
								<Route path='confirmation' element={<EventConfirmation />} />
							</Route>
							<Route path='/admin' element={<AdminComponent />} />
							<Route
								path='/request-reset-password'
								element={<PasswordResetForm />}
							/>
							<Route
								path='/reset-password/:resetToken'
								element={<ResetPasswordForm />}
							/>
							<Route path='*' element={<SignupForm />} />
						</Routes>
					</ContentContainer>
				</AppContainer>
			</BrowserRouter>
		</QueryClientProvider>
	);
};

export default App;
