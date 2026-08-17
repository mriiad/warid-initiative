import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { palette, radius, shadow } from './tokens';

export const userDetailRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: palette.ground,
		paddingBottom: '160px',
	},
	profileCard: {
		backgroundColor: palette.white,
		borderRadius: radius.card,
		padding: '24px',
		boxShadow: shadow.card,
	},
	avatar: {
		width: '72px',
		height: '72px',
		borderRadius: radius.pill,
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
			color: palette.ink,
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
		backgroundColor: palette.white,
		borderRadius: radius.row,
		padding: '16px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		boxShadow: shadow.card,
	},
	infoCardLabel: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: palette.ink,
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
			borderRadius: radius.chip,
			backgroundColor: palette.subtle,
			color: palette.ink,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexShrink: 0,
		},
	},
});
