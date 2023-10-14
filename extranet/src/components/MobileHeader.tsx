import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
import ActionButton from './shared/ActionButton';

const HeaderContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 102;
`;

const LogoContainer = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
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
		<HeaderContainer>
			<LogoContainer onClick={() => navigate('/signup')}>
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
