import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { palette, radius, shadow } from './tokens';

export const qrModalRedesignStyles = makeStyles({
	scrim: {
		position: 'fixed',
		inset: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.45)',
		zIndex: 1300,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '20px',
	},
	card: {
		width: '100%',
		maxWidth: '360px',
		backgroundColor: palette.white,
		borderRadius: '28px',
		padding: '24px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
	},
	title: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '20px',
			color: palette.ink,
		},
	},
	subtitle: {
		'&.MuiTypography-root': {
			fontSize: '14px',
			color: redesignColors.placeholder,
			marginTop: '4px',
			marginBottom: '24px',
		},
	},
	qrWrapper: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: '24px',
	},
	qrImage: {
		width: '220px',
		height: '220px',
	},
	successWrapper: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '48px 0',
		marginBottom: '24px',
	},
	successIcon: {
		fontSize: '96px',
		color: redesignColors.successGreen,
	},
	actionsRow: {
		display: 'flex',
		justifyContent: 'flex-end',
		width: '100%',
	},
	saveButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.successGreen,
			color: palette.white,
			borderRadius: radius.input,
			padding: '12px 24px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
			display: 'flex',
			gap: '8px',
			'&:hover': {
				backgroundColor: redesignColors.successGreenHover,
				boxShadow: shadow.none,
			},
			'&.Mui-disabled': {
				backgroundColor: '#D8E5C4',
				color: palette.white,
			},
		},
	},
});
