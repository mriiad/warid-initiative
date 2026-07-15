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
// so it's here for every visitor, not just admins. '/update-profile',
// '/profile' and '/dashboard' apply to any authenticated user regardless of
// role (both admins and donors can view/edit their own profile or personal
// donation history), so they're unconditional too rather than admin-only.
// '/donate' applies to any user regardless of role (and even a
// not-yet-logged-in visitor, who gets redirected to /login from inside the
// form on submit). '/contact' and '/FAQ' are reachable by anyone (logged in
// or not) and self-adjust their fields/nav based on auth state, so they're
// unconditional too. '/request-reset-password' is inherently pre-auth.
// '/home' is here unconditionally too now that LandingPage (the non-admin
// destination) has its own redesign -- AdminDashboard renders instead for
// admins, also full-bleed.
const FULL_SCREEN_ROUTES = [
	'/login',
	'/signup',
	'/admin',
	'/emergency',
	'/update-profile',
	'/profile',
	'/dashboard',
	'/donate',
	'/contact',
	'/FAQ',
	'/request-reset-password',
	'/home',
];
// '/events' (the list), '/events/create' and the emergencies admin screens
// only go full-screen for admins -- their redesign is admin-only so far (see
// EventsComponent/EventForm/EmergencyComponent), and non-admins still need
// the old chrome (the pre-existing EventsComponent for the events list).
// '/users' is here too -- see the bug-fix note below.
const ADMIN_ONLY_FULL_SCREEN_ROUTES = ['/events', '/events/create', '/emergencies', '/users'];
// Bug fix: UsersComponent and UserDetailView already ship their own
// full-bleed top bar + RedesignBottomNav, but '/users' and '/users/:userId'
// were never added here, so admins were getting the old chrome wrapped
// around the new self-contained UI (two stacked bottom navs). Both
// '/users/:userId' (a single path segment) and '/users/update/:userId' (two
// segments, so it needs its own branch) are covered below -- the latter is
// redesigned too, an admin-only edit form, same pattern as the emergencies
// one. '/events/update/:reference' is also an admin-only form (UpdateEvent
// self-guards non-admins to NotFoundPage).
const ADMIN_ONLY_FULL_SCREEN_ROUTE_PATTERN =
	/^\/emergencies\/[^/]+\/matched-users\/?$|^\/users\/(?!update\/)[^/]+$|^\/users\/update\/[^/]+$|^\/events\/update\/[^/]+$/;
// The event detail page (but not the '/events' list) now has a redesign for
// BOTH admins and non-admins, so unlike the admin-only pattern above this one
// applies regardless of role. Still excludes '/events/create' and
// '/events/update/:reference' (matched separately above). The nested
// can-donate/confirmation donor sub-routes are also redesigned now, with
// their own minimal chrome (no bottom nav, since they're transient steps).
const EVENT_DETAIL_FULL_SCREEN_PATTERN = /^\/events\/(?!create$)[^/]+$/;
const EVENT_SUBFLOW_FULL_SCREEN_PATTERN = /^\/events\/[^/]+\/(can-donate|confirmation)\/?$/;
// '/reset-password/:resetToken' is the other half of the pre-auth password
// reset flow, also reachable by anyone (it's the link from the reset email).
const RESET_PASSWORD_FULL_SCREEN_PATTERN = /^\/reset-password\/[^/]+$/;

const App = () => {
	const isMobile = useIsMobile();
	const { isAdmin } = useAuth();
	const location = useLocation();
	const forceDesktop =
		new URLSearchParams(location.search).get('forceDesktop') === '1';
	const isFullScreenRoute =
		FULL_SCREEN_ROUTES.includes(location.pathname) ||
		EVENT_DETAIL_FULL_SCREEN_PATTERN.test(location.pathname) ||
		EVENT_SUBFLOW_FULL_SCREEN_PATTERN.test(location.pathname) ||
		RESET_PASSWORD_FULL_SCREEN_PATTERN.test(location.pathname) ||
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
