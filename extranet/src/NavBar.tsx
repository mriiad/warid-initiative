import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Contact = () => <div>Contact Page</div>;

const useStyles = makeStyles({
	navbar: {
		padding: '0 170px',
		display: 'flex',
		position: 'fixed',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: '6.25em',
		'-webkit-backdrop-filter': 'blur(50px)',
		backdropFilter: 'blur(50px)',
		backgroundColor: 'rgba(255, 255, 255, .3)',
		border: '0.8px solid #fff',
		flexDirection: 'row',
		transition: 'transform .3s',
		top: '0',
		bottom: 'auto',
		left: '0',
		right: '0',
		boxShadow: '14px 14px 60px rgba(255, 48, 103, 0.08)',
		zIndex: '100',
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
		color: '#3B2A82',
		textDecoration: 'none',
	},
	loginButton: {
		backgroundColor: 'rgba(255,255,255,.3)',
		padding: '8px',
		borderWidth: '0.8px',
		overflow: 'visible',
		border: '1px solid #fff',
		borderRadius: '1.5625em',
		'& > button': {
			backgroundColor: '#ff3067 !important',
			justifyContent: 'space-between',
			paddingLeft: '1.1em',
			paddingRight: '1.1em',
			color: 'white',
			display: 'flex',
			alignItems: 'center',
			height: '40px',
			width: 'auto',
			boxShadow: '0 15px 30px rgba(255,48,103,.3)',
			'&.MuiButtonBase-root': {
				borderRadius: '16px',
			},
		},
	},
	loginIcon: {
		fontSize: '1.2rem',
		marginLeft: '8px',
	},
});

const Navbar = () => {
	const {
		navbar,
		routes,
		routesList,
		routesListItem,
		routesLink,
		logo,
		loginButton,
		loginIcon,
	} = useStyles();

	const navigate = useNavigate();

	return (
		<div className={navbar}>
			<div className={logo} onClick={() => navigate('/signup')}>
				<img src='warid-logo.png' alt='Logo' />
			</div>
			<div className={routes}>
				<nav>
					<ul className={routesList}>
						<li className={routesListItem}>
							<Link to='/' className={routesLink}>
								Home
							</Link>
						</li>
						<li className={routesListItem}>
							<Link to='/about' className={routesLink}>
								About
							</Link>
						</li>
						<li className={routesListItem}>
							<Link to='/contact' className={routesLink}>
								Contact
							</Link>
						</li>
					</ul>
				</nav>
			</div>
			<div className={loginButton}>
				<Button
					variant='contained'
					startIcon={<ArrowCircleRightIcon className={loginIcon} />}
					onClick={() => navigate('/login')}
				>
					Login
				</Button>
			</div>
		</div>
	);
};

export default Navbar;
