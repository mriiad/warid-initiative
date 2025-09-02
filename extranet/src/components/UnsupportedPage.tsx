import { PhoneAndroid, Smartphone, Tablet } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import colors from '../styles/colors';

const useStyles = makeStyles({
	root: {
		minHeight: '100vh',
		width: '100vw',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: `linear-gradient(135deg, ${colors.purple}15 0%, ${colors.darkPurple}08 50%, ${colors.rose}12 100%)`,
		position: 'relative',
		overflow: 'hidden',
		padding: '20px',
		boxSizing: 'border-box',
	},

	contentCard: {
		background: colors.formWhite,
		borderRadius: '30px',
		border: '1px solid white',
		padding: '24px',
		maxWidth: '600px',
		width: '100%',
		textAlign: 'center',
		animation: 'slideUp 0.8s ease-out',
	},
	logo: {
		width: '120px',
		marginBottom: '24px',
	},
	title: {
		color: colors.purple,
		marginBottom: '16px',
		fontWeight: 600,
		fontSize: '1.8rem',
		lineHeight: 1.3,
	},
	subtitle: {
		color: colors.darkPurple,
		marginBottom: '20px',
		fontSize: '1rem',
		lineHeight: 1.5,
		fontWeight: 400,
		textAlign: 'center',
	},
	deviceIcons: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		gap: '16px',
		marginBottom: '20px',
	},
	deviceIcon: {
		color: colors.rose,
		fontSize: '2rem',
		opacity: 0.8,
	},
	browserText: {
		color: colors.purple,
		fontSize: '0.9rem',
		fontWeight: 500,
		padding: '8px 16px',
		borderRadius: '10px',
		border: `1px solid ${colors.purple}20`,
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		textAlign: 'center',
		display: 'inline-block',
	},
	'@keyframes slideUp': {
		'0%': { opacity: 0, transform: 'translateY(30px)' },
		'100%': { opacity: 1, transform: 'translateY(0)' },
	},
});

const UnsupportedPage = () => {
	const {
		root,
		contentCard,
		logo,
		title,
		subtitle,
		deviceIcons,
		deviceIcon,
		browserText,
	} = useStyles();

	return (
		<Box className={root}>
			<Box className={contentCard}>
				<img src='/warid-logo.png' alt='Warid Logo' className={logo} />

				<Typography variant='h4' className={title}>
					This app is optimized for mobile
				</Typography>

				<Typography variant='body1' className={subtitle}>
					For the best experience, please open this site on your phone or tablet
					device.
				</Typography>

				<Box className={deviceIcons}>
					<Smartphone className={deviceIcon} />
					<Tablet className={deviceIcon} />
					<PhoneAndroid className={deviceIcon} />
				</Box>

				<Typography variant='caption' className={browserText}>
					✨ Best viewed on mobile browsers like Safari, Chrome, or Firefox
				</Typography>
			</Box>
		</Box>
	);
};

export default UnsupportedPage;
