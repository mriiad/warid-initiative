import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';

const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const Contact = () => <div>Contact Page</div>;

const useStyles = makeStyles({
	navbar: {
		display: 'flex',
		justifyContent: 'space-between',
		height: '6.25em',
		'-webkit-backdrop-filter': 'blur(50px)',
		backdropFilter: 'blur(50px)',
		backgroundColor: 'rgba(255, 255, 255, .6)',
		border: '0.8px solid #fff',
		flexDirection: 'row',
		alignItems: 'stretch',
		transition: 'transform .3s',
		position: 'fixed',
		top: '0',
		bottom: 'auto',
		left: '0',
		right: '0',
		transform: 'none',
		boxShadow: '14px 14px 60px rgba(80, 20, 173, .06)',
		zIndex: '100',
	},
	logo: {
		marginRight: '10px',
	},
	routes: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
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
});

const Navbar = () => {
	const classes = useStyles();

	return (
		<div className={classes.navbar}>
			<div className={classes.logo}>
				<img src='logo.png' alt='Logo' />
			</div>
			<div className={classes.routes}>
				<nav>
					<ul className={classes.routesList}>
						<li className={classes.routesListItem}>
							<Link to='/' className={classes.routesLink}>
								Home
							</Link>
						</li>
						<li className={classes.routesListItem}>
							<Link to='/about' className={classes.routesLink}>
								About
							</Link>
						</li>
						<li className={classes.routesListItem}>
							<Link to='/contact' className={classes.routesLink}>
								Contact
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
};

export default Navbar;
