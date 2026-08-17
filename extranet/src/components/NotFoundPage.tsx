import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authRedesignStyles, redesignColors } from '../styles/authRedesign';

// Self-contained full-screen layout, like every other redesigned screen.
// This used to be the one and only route still rendering the legacy app
// chrome (NavBar/MobileHeader/MobileNavbar + ContentContainer), which kept
// ~800 lines of dead components alive to decorate a 404 -- see issue #330.
const useStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		// Same neutral ground every other redesigned screen paints, so the
		// legacy AppContainer gradient doesn't show through on this one page.
		backgroundColor: '#F4F3F6',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		padding: '32px 24px',
		gap: '8px',
	},
	code: {
		'&.MuiTypography-root': {
			fontSize: 'clamp(56px, 18vw, 88px)',
			fontWeight: 700,
			color: redesignColors.headerRose,
			lineHeight: 1,
		},
	},
	illustration: {
		width: '55%',
		maxWidth: '240px',
		height: 'auto',
		margin: '8px 0 4px',
	},
	description: {
		'&.MuiTypography-root': {
			fontSize: '15px',
			color: redesignColors.placeholder,
			marginBottom: '24px',
			maxWidth: '320px',
		},
	},
});

const NotFoundPage = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { screen, code, illustration, description } = useStyles();
	const { primaryButton } = authRedesignStyles();

	return (
		<div className={screen}>
			<Typography className={code}>{t('notFound.title')}</Typography>
			<img
				src='/blood-donation-hand.svg'
				alt='Blood Donation'
				className={illustration}
			/>
			<Typography className={description}>
				{t('notFound.description')}
			</Typography>
			<Button
				type='button'
				className={primaryButton}
				onClick={() => navigate('/home')}
			>
				{t('notFound.button')}
			</Button>
		</div>
	);
};

export default NotFoundPage;
