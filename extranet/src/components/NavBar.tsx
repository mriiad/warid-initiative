import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';
import { mainStyles } from '../styles/mainStyles';
import ActionButton from './shared/ActionButton';

const useStyles = makeStyles({
	navbar: {
		padding: '0 170px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: '6.25em',
		backgroundColor: 'rgba(255, 255, 255, .3)',
		backdropFilter: 'blur(50px)',
		border: '0.8px solid #fff',
		transition: 'transform .3s',
		boxShadow: '14px 14px 60px rgba(255, 48, 103, 0.08)',
		position: 'fixed',
		flexDirection: 'row',
		top: '0',
		left: '0',
		right: '0',
		bottom: 'auto',
		zIndex: '100',
		'-webkit-backdrop-filter': 'blur(50px)',
	},
	logo: {
		backgroundColor: '#f9f1f6',
		padding: '4px',
		borderWidth: '0.8px',
		overflow: 'visible',
		border: '1px solid rgb(255 255 255 / 25%)',
		borderRadius: '0.5625em',
		boxShadow: '0px 4px 20px 0px rgba(255,48,103,.3)',
		cursor: 'pointer',
		'& > div': {
			border: '1px solid rgb(255 255 255 / 25%)',
			borderRadius: '0.5625em',
			padding: '4px',
			'& > img': {
				height: '40px',
				width: '36px',
			},
		},
	},
	routes: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
	},
	routesList: {
		listStyleType: 'none',
		margin: 0,
		padding: 0,
		display: 'flex',
		gap: '10px',
	},
	routesListItem: {
		marginRight: '10px',
	},
	routesLink: {
		fontWeight: 700,
		color: '#3B2A82',
		textDecoration: 'none',
	},
	activeLink: {
		color: colors.rose,
	},
	loginIcon: {
		fontSize: '1.2rem',
		marginLeft: '8px',
	},
});

const Navbar = () => {
	const { token, setToken, isAdmin, setIsAdmin, setUserId } = useAuth();

	const {
		navbar,
		routes,
		routesList,
		routesListItem,
		routesLink,
		activeLink,
		logo,
		loginIcon,
	} = useStyles();

	const { mainButton } = mainStyles();

	const navigate = useNavigate();
	const location = useLocation();
	const [selectedRoute, setSelectedRoute] = useState(location.pathname);

	const handleLogout = () => {
		axios
			.post('http://localhost:3000/api/auth/logout')
			.then((response) => {
				// Removing user data from local storage
				localStorage.removeItem('token');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('userId');
				localStorage.removeItem('isAdmin');

				// Resetting user state
				setToken(null);
				setUserId(null);
				setIsAdmin(null);

				navigate('/login');
			})
			.catch((error) => {
				console.error('Logout error', error);
			});
	};

	const handleRouteChange = (route) => {
		setSelectedRoute(route);
	};

	return (
		<div className={navbar}>
			<div className={logo} onClick={() => navigate('/signup')}>
				<div>
					<img src='warid-logo.png' alt='Logo' />
				</div>
			</div>
			<div className={routes}>
				<nav>
					<ul className={routesList}>
						<li className={routesListItem}>
							<Link
								to='/'
								className={`${routesLink} ${selectedRoute === '/' ? activeLink : ''
									}`}
								onClick={() => handleRouteChange('/')}
							>
								الرئيسية
							</Link>
						</li>
						<li className={routesListItem}>
							<Link
								to='/about'
								className={`${routesLink} ${selectedRoute === '/about' ? activeLink : ''
									}`}
								onClick={() => handleRouteChange('/about')}
							>
								بخصوص
							</Link>
						</li>
						<li className={routesListItem}>
							<Link
								to='/events?page=1'
								className={`${routesLink} ${selectedRoute === '/events' ? activeLink : ''
									}`}
								onClick={() => handleRouteChange('/events?page=1')}
							>
								الفعاليات
							</Link>
						</li>
						{token && isAdmin && (
							<li className={routesListItem}>
								<Link
									to='/admin'
									className={`${routesLink} ${
										selectedRoute === '/admin' ? activeLink : ''
									}`}
									onClick={() => handleRouteChange('/admin')}
								>
									المشرف
								</Link>
							</li>
						)}
						
						
					</ul>
				</nav>
			</div>
			<div className={mainButton}>
				{token ? (
					<ActionButton
						title='تسجيل الخروج'
						icon={<ArrowCircleLeftIcon className={loginIcon} />}
						onClick={() => handleLogout()}
					/>
				) : (
					<ActionButton
						title='تسجيل الدخول'
						icon={<ArrowCircleRightIcon className={loginIcon} />}
						onClick={() => navigate('/login')}
					/>
				)}
			</div>
		</div>
	);
};

export default Navbar;
