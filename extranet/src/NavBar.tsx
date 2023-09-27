import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import colors from './styles/colors';

const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Contact = () => <div>Contact Page</div>;

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
		cursor: 'pointer',
		'& > img': {
			height: '64px',
			width: '56px',
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
	loginButton: {
		backgroundColor: 'rgba(255,255,255,.3)',
		padding: '8px',
		borderWidth: '0.8px',
		overflow: 'visible',
		border: '1px solid #fff',
		borderRadius: '1.5625em',
		'& > button': {
			justifyContent: 'space-between',
			paddingLeft: '1.1em',
			paddingRight: '1.1em',
			color: 'white',
			display: 'flex',
			alignItems: 'center',
			width: 'auto',
			height: '3.5em',
			minHeight: '3.5em',
			minWidth: '3.5em',
			boxShadow: '0 15px 30px rgba(255,48,103,.3)',
			'&.MuiButtonBase-root': {
				backgroundColor: '#ff3067',
				borderRadius: '16px',
				'&:hover': {
					backgroundColor: colors.purple,
				},
			},
		},
	},
	loginIcon: {
		fontSize: '1.2rem',
		marginLeft: '8px',
	},
});

const Navbar = () => {
	const { token, setToken } = useAuth();

	const {
		navbar,
		routes,
		routesList,
		routesListItem,
		routesLink,
		activeLink,
		logo,
		loginButton,
		loginIcon,
	} = useStyles();

	const navigate = useNavigate();
	const location = useLocation();
	const [selectedRoute, setSelectedRoute] = useState(location.pathname);

	const handleLogout = () => {
		axios
			.post('http://localhost:3000/api/auth/logout')
			.then((response) => {
				localStorage.removeItem('token'); // Remove token from localStorage
				setToken(null); // Set token in context to null
				navigate('/login'); // Navigate to login page
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
				<img src='warid-logo.png' alt='Logo' />
			</div>
			<div className={routes}>
				<nav>
					<ul className={routesList}>
						<li className={routesListItem}>
							<Link
								to='/'
								className={`${routesLink} ${
									selectedRoute === '/' ? activeLink : ''
								}`}
								onClick={() => handleRouteChange('/')}
							>
								Home
							</Link>
						</li>
						<li className={routesListItem}>
							<Link
								to='/about'
								className={`${routesLink} ${
									selectedRoute === '/about' ? activeLink : ''
								}`}
								onClick={() => handleRouteChange('/about')}
							>
								About
							</Link>
						</li>
						<li className={routesListItem}>
							<Link
								to='/events'
								className={`${routesLink} ${
									selectedRoute === '/events' ? activeLink : ''
								}`}
								onClick={() => handleRouteChange('/events')}
							>
								Events
							</Link>
						</li>
					</ul>
				</nav>
			</div>
			<div className={loginButton}>
				{token ? (
					<Button
						variant='contained'
						startIcon={<ArrowCircleRightIcon className={loginIcon} />}
						onClick={() => handleLogout()}
					>
						Logout
					</Button>
				) : (
					<Button
						variant='contained'
						startIcon={<ArrowCircleRightIcon className={loginIcon} />}
						onClick={() => navigate('/login')}
					>
						Login
					</Button>
				)}
			</div>
		</div>
	);
};

export default Navbar;
