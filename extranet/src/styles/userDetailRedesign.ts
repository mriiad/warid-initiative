import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const userDetailRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#F4F3F6',
		paddingBottom: '160px',
	},
	profileCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '24px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	avatar: {
		width: '72px',
		height: '72px',
		borderRadius: '50%',
		backgroundColor: '#FBE4C9',
		color: '#C97A2B',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '28px',
		fontWeight: 700,
		marginBottom: '14px',
	},
	availabilityBadge: {
		display: 'inline-block',
		fontSize: '12px',
		fontWeight: 700,
		marginBottom: '8px',
	},
	availabilityAvailable: {
		color: '#5C8A2B',
	},
	availabilityUnavailable: {
		color: redesignColors.headerRose,
	},
	name: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '19px',
			color: '#1F1B24',
		},
	},
	city: {
		'&.MuiTypography-root': {
			fontSize: '14px',
			color: redesignColors.placeholder,
			marginTop: '2px',
		},
	},
	infoCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: '18px',
		padding: '16px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	infoCardLabel: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: '#1F1B24',
		},
	},
	infoCardValue: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
			marginTop: '2px',
		},
	},
	infoCardAction: {
		'&.MuiIconButton-root, &': {
			width: '40px',
			height: '40px',
			borderRadius: '12px',
			backgroundColor: '#F1EFF4',
			color: '#1F1B24',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
		},
	},
});
