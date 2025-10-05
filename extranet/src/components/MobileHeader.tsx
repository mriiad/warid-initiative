import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import LogOutIcon from '@mui/icons-material/LogoutOutlined';
import { IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';
import API_CONFIG, { buildApiUrl } from '../utils/apiConfig';
import ActionButton from './shared/ActionButton';


interface HeaderContainerProps {
	$isEventPage: boolean;
}

const HeaderContainer = styled.div<HeaderContainerProps>`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 18px 12px 10px 21px;
	background-color: transparent;
	top: 0;
	left: 0;
	right: 0;
	z-index: 102;
	position: ${(props) => (props.$isEventPage ? 'absolute' : 'static')};
`;

const LogoContainer = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	background-color: transparent;
	padding: 12px;
	border-width: 0.8px;
	overflow: visible;
	border: 2px solid rgb(255 255 255 / 25%);
	border-radius: 18px;
	box-shadow: 0px 4px 20px 0px rgba(255, 48, 103, 0.3);
`;
const IconsContainer = styled.div`
	display: flex;
	align-items: center;
	background-color: transparent;
	padding: 2px;
`;

const useStyles = makeStyles({
	logoImage: {
		height: '40px',
		width: '36px',
	},
	icon: {
		color: '#3B2A82',
		'&:hover': {
			color: colors.rose,
		},
	},
	activeIcon: {
		color: colors.rose,
	},
});

const MobileHeader = () => {
	const { logoImage, icon, activeIcon } = useStyles();
	const { token, setToken, setIsAdmin, setUserId } = useAuth();
	const location = useLocation();
	const isEventPage = location.pathname.includes('events/WEVENT');
	const navigate = useNavigate();
	const currentRoute = location.pathname;

	const handleLogout = () => {
		axios
			.post(buildApiUrl(API_CONFIG.endpoints.auth.logout))
			.then((response) => {
				localStorage.removeItem('token');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('userId');
				localStorage.removeItem('isAdmin');

				setToken(null);
				setUserId(null);
				setIsAdmin(false);

				navigate('/login');
			})
			.catch((error) => {
				console.error('Logout error', error);
			});
	};
	
	return (
		<HeaderContainer $isEventPage={isEventPage}>
			<LogoContainer onClick={() => navigate('/home')}>
				<img src='/warid-logo.png' alt='Logo' className={logoImage} />
			</LogoContainer>
			{token ? (
				<IconsContainer>
					<Link to='/profile'>
						<AccountCircleIcon
							className={currentRoute === '/profile' ? activeIcon : icon}
							fontSize='large'
						/>
					</Link>

					<IconButton onClick={handleLogout} size='large' color='inherit'>
						<LogOutIcon fontSize='large' className={icon} />
					</IconButton>
				</IconsContainer>
			) : (
				<ActionButton
					title='تسجيل الدخول'
					icon={<ArrowCircleRightIcon />}
					onClick={() => navigate('/login')}
				/>
				

			)}
		</HeaderContainer>
	);
};

export default MobileHeader;
