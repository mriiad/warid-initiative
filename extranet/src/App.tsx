import { CircularProgress } from '@mui/material';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { hasAdminRole } from './auth/adminAccess';
import { useAuth } from './auth/AuthContext';
import UnsupportedPage from './components/UnsupportedPage';
import { AdminRole } from './data/constants';
import { useIsMobile } from './hooks/useIsMobile';

// Route-level screens are loaded on demand (one chunk per route) instead of
// being bundled into the initial download -- see the routing chrome logic
// further down for how each of these is wired up.
const ActivateAccount = lazy(() => import('./components/ActivateAccount'));
const AdminComponent = lazy(() => import('./components/AdminComponent'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const CanDonate = lazy(() => import('./components/CanDonate'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const DonationComponent = lazy(() => import('./components/DonationComponent'));
const FAQComponent = lazy(() => import('./components/FAQComponent'));
const LoginForm = lazy(() => import('./components/LoginForm'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));
const PasswordResetForm = lazy(() => import('./components/PasswordResetForm'));
const ResetPasswordForm = lazy(() => import('./components/ResetPasswordForm'));
const SignupForm = lazy(() => import('./components/SignupForm'));
const UpdateUser = lazy(() => import('./components/UpdateUser'));
const UserDetailView = lazy(() => import('./components/UserDetailView'));
const UserProfileForm = lazy(() => import('./components/UserProfileForm'));
const UsersComponent = lazy(() => import('./components/UsersComponent'));
const EmergencyComponent = lazy(
	() => import('./components/emergency/EmergencyComponent'),
);
const EmergencyForm = lazy(() => import('./components/emergency/EmergencyForm'));
const MatchedUsers = lazy(() => import('./components/emergency/MatchedUsers'));
const EventConfirmation = lazy(
	() => import('./components/event/EventConfirmation'),
);
const EventDetail = lazy(() => import('./components/event/EventDetail'));
const EventForm = lazy(() => import('./components/event/EventForm'));
const EventsComponent = lazy(() => import('./components/event/EventsComponent'));
const UpdateEvent = lazy(() => import('./components/event/UpdateEvent'));
const LandingPage = lazy(() => import('./components/home/LandingPage'));
const ProfileComponent = lazy(
	() => import('./components/profile/ProfileComponent'),
);

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

const RouteLoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 60vh;
	width: 100%;
`;

const routeFallback = (
	<RouteLoadingContainer>
		<CircularProgress />
	</RouteLoadingContainer>
);

// Every screen now ships its own full-bleed layout (own top bar and, where
// it belongs, RedesignBottomNav), so there is no app-level chrome to wrap
// them in and nothing to opt into. This used to be a FULL_SCREEN_ROUTES
// allowlist plus four regex patterns, needed only to decide which routes
// still got the legacy NavBar/MobileHeader/MobileNavbar treatment -- by the
// end that was just the 404 page, and forgetting to add a newly-redesigned
// route to the list was its own recurring bug (the "double chrome" fixes for
// '/users' and '/events'). See issue #330.
const App = () => {
	const isMobile = useIsMobile();
	const { isAdmin, adminRole, token } = useAuth();
	// Principal Admin has full access to everything (issue #183); empty
	// allowedRoles means no other role qualifies, i.e. principal-only.
	const isPrincipalAdmin = hasAdminRole(isAdmin, adminRole, []);
	const isEmergencyAdmin = hasAdminRole(isAdmin, adminRole, [
		AdminRole.Emergency,
	]);
	const location = useLocation();
	const forceDesktop =
		new URLSearchParams(location.search).get('forceDesktop') === '1';

	const routes = (
		<Suspense fallback={routeFallback}>
			<Routes>
				<Route path='/' element={<Navigate replace to='/home' />} />
				<Route
					path='/home'
					element={
						isAdmin ? (
							<AdminDashboard />
						) : token ? (
							<Dashboard />
						) : (
							<LandingPage />
						)
					}
				/>
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
				{/*
					Principal-Admin-only (issue #183): Emergency and Event Admin
					get neither the users list nor user detail/edit.
				*/}
				{isPrincipalAdmin && <Route path='/users' element={<UsersComponent />} />}
				{/*
					Registered ahead of '/users/update/:userId' below only in the
					sense that both are always mounted (not gated) -- same
					always-register-then-self-guard pattern as the events routes
					above, so a non-admin gets NotFoundPage instead of a route
					mismatch.
				*/}
				{isPrincipalAdmin && (
					<Route path='/users/:userId' element={<UserDetailView />} />
				)}
				{isPrincipalAdmin && (
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
				<Route path='/activate/:token' element={<ActivateAccount />} />
				<Route path='*' element={<NotFoundPage />} />

				<Route path='/FAQ' element={<FAQComponent />} />
				<Route path='/profile' element={<ProfileComponent />} />
				<Route path='/dashboard' element={<Dashboard />} />
				<Route path='/emergency' element={<EmergencyForm />} />
				{/* Emergency Admin or Principal Admin (issue #183). */}
				{isEmergencyAdmin && (
					<Route path='/emergencies' element={<EmergencyComponent />} />
				)}
				{isEmergencyAdmin && (
					<Route
						path='/emergencies/:emergencyId/matched-users/'
						element={<MatchedUsers />}
					/>
				)}
			</Routes>
		</Suspense>
	);

	return (
		<AppContainer>
			{!isMobile && !forceDesktop ? <UnsupportedPage /> : routes}
		</AppContainer>
	);
};

export default App;
