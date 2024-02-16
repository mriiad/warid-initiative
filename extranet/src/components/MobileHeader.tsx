import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
import ActionButton from './shared/ActionButton';

interface HeaderContainerProps {
	isEventPage: boolean;
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
	position: ${(props) => (props.isEventPage ? 'absolute' : 'static')};
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

const useStyles = makeStyles({
	logoImage: {
		height: '40px',
		width: '36px',
	},
});

const MobileHeader = () => {
	const { logoImage } = useStyles();
	const { token, setToken, setIsAdmin, setUserId } = useAuth();
	const location = useLocation();
	const isEventPage = location.pathname.includes('events/WEVENT');
	const navigate = useNavigate();

	const handleLogout = () => {
		axios
			.post('http://localhost:3000/api/auth/logout')
			.then((response) => {
				localStorage.removeItem('token');
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('userId');
				localStorage.removeItem('isAdmin');

				setToken(null);
				setUserId(null);
				setIsAdmin(null);

				navigate('/login');
			})
			.catch((error) => {
				console.error('Logout error', error);
			});
	};

	return (
		<HeaderContainer isEventPage={isEventPage}>
			<LogoContainer onClick={() => navigate('/home')}>
				<img src='/warid-logo.png' alt='Logo' className={logoImage} />
			</LogoContainer>
			{token ? (
				<ActionButton
					title='Logout'
					icon={<ArrowCircleLeftIcon />}
					onClick={handleLogout}
				/>
			) : (
				<ActionButton
					title='Login'
					icon={<ArrowCircleRightIcon />}
					onClick={() => navigate('/login')}
				/>
			)}
		</HeaderContainer>
	);
};

export default MobileHeader;
