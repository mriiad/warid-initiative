import useMediaQuery from '@mui/material/useMediaQuery';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './auth/AuthContext';
import AdminComponent from './components/AdminComponent';
import CanDonate from './components/CanDonate';
import ContactForm from './components/ContactForm';
import DonationComponent from './components/DonationComponent';
import LoginForm from './components/LoginForm';
import MobileHeader from './components/MobileHeader';
import MobileNavbar from './components/MobileNavbar';
import NavBar from './components/NavBar';
import NotFoundPage from './components/NotFoundPage';
import PasswordResetForm from './components/PasswordResetForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import SignupForm from './components/SignupForm';
import UserProfileForm from './components/UserProfileForm';
import EventConfirmation from './components/event/EventConfirmation';
import EventDetail from './components/event/EventDetail';
import EventForm from './components/event/EventForm';
import EventsComponent from './components/event/EventsComponent';

const AppContainer = styled.div`
	background: linear-gradient(to left, #e0d1f5, #f6ecf3 48%, #e0d1f5) no-repeat
		center/cover;
	font-family: Arial, sans-serif;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 48px;
	min-height: 100vh;
`;

const ContentContainer = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0 19px;
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
	const { isAdmin } = useAuth();

	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AppContainer>
					{!isMobile ? <NavBar /> : <MobileHeader />}
					<ContentContainer>
						<Routes>
							<Route path='/' element={<Navigate replace to='/signup' />} />
							<Route path='/signup' element={<SignupForm />} />
							<Route path='/login' element={<LoginForm />} />
							<Route path='/update-profile' element={<UserProfileForm />} />
							<Route path='/events' element={<EventsComponent />} />
							{isAdmin && (
								<Route path='/events/create' element={<EventForm />} />
							)}
							<Route path='/events/:reference/*' element={<EventDetail />}>
								<Route path='can-donate' element={<CanDonate />} />
								<Route path='confirmation' element={<EventConfirmation />} />
							</Route>
							<Route path='/donate' element={<DonationComponent />} />
							<Route path='/contact' element={<ContactForm />} />
							<Route path='/admin' element={<AdminComponent />} />
							<Route
								path='/request-reset-password'
								element={<PasswordResetForm />}
							/>
							<Route
								path='/reset-password/:resetToken'
								element={<ResetPasswordForm />}
							/>
							<Route path='*' element={<NotFoundPage />} />
						</Routes>
					</ContentContainer>
					{isMobile && (
						<MobileNavContainer>
							<MobileNavbar />
						</MobileNavContainer>
					)}
				</AppContainer>
			</BrowserRouter>
		</QueryClientProvider>
	);
};

export default App;
