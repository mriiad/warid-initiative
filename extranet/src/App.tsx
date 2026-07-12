import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './auth/AuthContext';
import AdminComponent from './components/AdminComponent';
import AdminDashboard from './components/admin/AdminDashboard';
import CanDonate from './components/CanDonate';
import ContactForm from './components/ContactForm';
import Dashboard from './components/Dashboard';
import DonationComponent from './components/DonationComponent';
import FAQComponent from './components/FAQComponent';
import LoginForm from './components/LoginForm';
import MobileHeader from './components/MobileHeader';
import MobileNavbar from './components/MobileNavbar';
import NavBar from './components/NavBar';
import NotFoundPage from './components/NotFoundPage';
import PasswordResetForm from './components/PasswordResetForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import SignupForm from './components/SignupForm';
import UnsupportedPage from './components/UnsupportedPage';
import UpdateUser from './components/UpdateUser';
import UserDetailView from './components/UserDetailView';
import UserProfileForm from './components/UserProfileForm';
import UsersComponent from './components/UsersComponent';
import EmergencyComponent from './components/emergency/EmergencyComponent';
import EmergencyForm from './components/emergency/EmergencyForm';
import MatchedUsers from './components/emergency/MatchedUsers';
import EventConfirmation from './components/event/EventConfirmation';
import EventDetail from './components/event/EventDetail';
import EventForm from './components/event/EventForm';
import EventsComponent from './components/event/EventsComponent';
import UpdateEvent from './components/event/UpdateEvent';
import LandingPage from './components/home/LandingPage';
import ProfileComponent from './components/profile/ProfileComponent';
import { useIsMobile } from './hooks/useIsMobile';

const AppContainer = styled.div`
	position: relative;
	font-family: Arial, sans-serif;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 48px;
	min-height: 100vh;

	&:before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('/background-cover.png') no-repeat center/cover;
		opacity: 0.07;
		pointer-events: none;
	}

	background: linear-gradient(to left, #e0d1f5, #f6ecf3 48%, #e0d1f5);
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

// Routes that ship their own full-bleed header/layout (the redesigned
// screens) skip the app chrome below instead of sitting inside the padded
// ContentContainer with a NavBar/MobileHeader above and MobileNavbar below.
// '/admin' (the admin menu) is here unconditionally: it's only meaningful
// for admins, but it self-guards (like the other admin screens) and a
// non-admin landing on it should see a bare NotFoundPage, not app chrome
// wrapped around one. '/emergency' is public (no isAuth on that endpoint),
// so it's here for every visitor, not just admins.
const FULL_SCREEN_ROUTES = ['/login', '/signup', '/admin', '/emergency'];
// '/home', '/events', an event's own detail page, and '/events/create' only
// go full-screen for admins -- their redesign is admin-only so far (see
// AdminDashboard/EventsComponent/EventDetail/EventForm), and non-admins
// still need the old chrome (LandingPage for '/home', the pre-existing
// EventsComponent/EventDetail views for the rest). The detail-page pattern
// excludes '/events/create' itself (matched separately below) and anything
// with a further path segment (the can-donate/confirmation sub-routes
// nested under EventDetail, which are donor-only flows).
const ADMIN_ONLY_FULL_SCREEN_ROUTES = ['/home', '/events', '/events/create'];
const ADMIN_ONLY_FULL_SCREEN_ROUTE_PATTERN = /^\/events\/(?!create$)[^/]+$/;

const App = () => {
	const isMobile = useIsMobile();
	const { isAdmin } = useAuth();
	const location = useLocation();
	const forceDesktop =
		new URLSearchParams(location.search).get('forceDesktop') === '1';
	const isFullScreenRoute =
		FULL_SCREEN_ROUTES.includes(location.pathname) ||
		(isAdmin &&
			(ADMIN_ONLY_FULL_SCREEN_ROUTES.includes(location.pathname) ||
				ADMIN_ONLY_FULL_SCREEN_ROUTE_PATTERN.test(location.pathname)));

	const routes = (
		<Routes>
			<Route path='/' element={<Navigate replace to='/home' />} />
			<Route path='/home' element={isAdmin ? <AdminDashboard /> : <LandingPage />} />
			<Route path='/signup' element={<SignupForm />} />
			<Route path='/login' element={<LoginForm />} />
			<Route path='/update-profile' element={<UserProfileForm />} />
			<Route path='/events' element={<EventsComponent />} />
			{/*
				These two routes must always be registered (not gated by
				isAdmin) so they win route matching against the
				'/events/:reference/*' wildcard below -- otherwise a
				non-admin visiting them has React Router treat 'create' or
				'update' as an event reference and load EventDetail
				indefinitely instead of showing 404. Each component checks
				isAdmin itself and renders NotFoundPage when it isn't.
			*/}
			<Route path='/events/create' element={<EventForm />} />
			<Route path='/events/update/:reference' element={<UpdateEvent />} />
			<Route path='/events/:reference/*' element={<EventDetail />}>
				<Route path='can-donate' element={<CanDonate />} />
				<Route path='confirmation' element={<EventConfirmation />} />
			</Route>
			<Route path='/donate' element={<DonationComponent />} />
			{isAdmin && <Route path='/users' element={<UsersComponent />} />}
			{/*
				Registered ahead of '/users/update/:userId' below only in the
				sense that both are always mounted (not gated) -- same
				always-register-then-self-guard pattern as the events routes
				above, so a non-admin gets NotFoundPage instead of a route
				mismatch.
			*/}
			{isAdmin && <Route path='/users/:userId' element={<UserDetailView />} />}
			{isAdmin && (
				<Route path='/users/update/:userId' element={<UpdateUser />} />
			)}
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

			<Route path='/FAQ' element={<FAQComponent />} />
			<Route path='/profile' element={<ProfileComponent />} />
			<Route path='/dashboard' element={<Dashboard />} />
			<Route path='/emergency' element={<EmergencyForm />} />
			{isAdmin && (
				<Route path='/emergencies' element={<EmergencyComponent />} />
			)}
			{isAdmin && (
				<Route
					path='/emergencies/:emergencyId/matched-users/'
					element={<MatchedUsers />}
				/>
			)}
		</Routes>
	);

	return (
		<AppContainer>
			{!isMobile && !forceDesktop ? (
				<UnsupportedPage />
			) : isFullScreenRoute ? (
				routes
			) : (
				<>
					{!isMobile ? <NavBar /> : <MobileHeader />}
					<ContentContainer>{routes}</ContentContainer>
					{isMobile && (
						<MobileNavContainer>
							<MobileNavbar />
						</MobileNavContainer>
					)}
				</>
			)}
		</AppContainer>
	);
};

export default App;
