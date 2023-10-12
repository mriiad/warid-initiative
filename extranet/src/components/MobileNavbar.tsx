import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import { makeStyles } from '@mui/styles';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';

const useStyles = makeStyles({
	navbar: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		height: '60px',
		backgroundColor: 'rgba(255, 255, 255, .3)',
		backdropFilter: 'blur(50px)',
		borderTop: '0.8px solid #fff',
		position: 'fixed',
		width: '100%',
		bottom: 0,
		left: 0,
		zIndex: 100,
		'-webkit-backdrop-filter': 'blur(50px)',
	},
	icon: {
		color: '#3B2A82',
	},
	activeIcon: {
		color: colors.rose,
	},
});

const MobileNavbar = () => {
	const { token, isAdmin } = useAuth();
	const { icon, activeIcon } = useStyles();
	const location = useLocation();
	const currentRoute = location.pathname;

	return (
		<div className={useStyles().navbar}>
			<Link to='/'>
				<HomeIcon className={currentRoute === '/' ? activeIcon : icon} />
			</Link>
			<Link to='/about'>
				<InfoIcon className={currentRoute === '/about' ? activeIcon : icon} />
			</Link>
			<Link to='/events?page=1'>
				<EventIcon
					className={currentRoute.startsWith('/events') ? activeIcon : icon}
				/>
			</Link>
			{token && isAdmin && (
				<Link to='/admin'>
					<AdminPanelSettingsIcon
						className={currentRoute === '/admin' ? activeIcon : icon}
					/>
				</Link>
			)}
		</div>
	);
};

export default MobileNavbar;
