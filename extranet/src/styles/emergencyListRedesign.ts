import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { onRose, palette, radius, shadow } from './tokens';

export const emergencyListRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: palette.ground,
		paddingBottom: '160px',
	},
	topBar: {
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		padding: '16px 20px',
		backgroundColor: palette.white,
	},
	topBarDivider: {
		width: '1px',
		height: '20px',
		backgroundColor: redesignColors.inputBorder,
	},
	topBarTitle: {
		flexGrow: 1,
		'&.MuiTypography-root': {
			textAlign: 'center',
			fontWeight: 700,
			fontSize: '16px',
			color: palette.ink,
		},
	},
	content: {
		padding: '20px 20px 0',
		display: 'flex',
		flexDirection: 'column',
		gap: '14px',
	},
	hero: {
		backgroundColor: palette.ink,
		borderRadius: radius.card,
		padding: '18px 20px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
	},
	heroIcon: {
		width: '44px',
		height: '44px',
		borderRadius: radius.button,
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		fontSize: '22px',
	},
	heroTitle: {
		'&.MuiTypography-root': {
			color: palette.white,
			fontWeight: 700,
			fontSize: '16px',
		},
	},
	heroSubtitle: {
		'&.MuiTypography-root': {
			color: onRose.soft,
			fontSize: '13px',
		},
	},
	heroCount: {
		backgroundColor: redesignColors.headerRose,
		color: palette.white,
		borderRadius: radius.button,
		padding: '6px 14px',
		fontWeight: 700,
		fontSize: '16px',
		textAlign: 'center',
	},
	heroCountLabel: {
		fontSize: '11px',
		color: 'rgba(255, 255, 255, 0.7)',
		textAlign: 'center',
		marginTop: '2px',
	},
	card: {
		backgroundColor: palette.white,
		borderRadius: radius.card,
		padding: '16px',
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		boxShadow: shadow.card,
	},
	cardIcon: {
		width: '40px',
		height: '40px',
		borderRadius: radius.chip,
		backgroundColor: '#FBE4EA',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '18px',
		marginBottom: '4px',
	},
	cardBloodBadge: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '13px',
			color: '#D1435B',
		},
	},
	cardDetails: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: palette.ink,
		},
	},
	cardCity: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
		},
	},
	actionsRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		marginTop: '10px',
	},
	confirmButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.successGreen,
			color: palette.white,
			borderRadius: radius.button,
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
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
	matchedUsersButton: {
		'&.MuiIconButton-root': {
			width: '44px',
			height: '44px',
			borderRadius: radius.button,
			backgroundColor: palette.subtle,
			color: palette.ink,
			marginInlineStart: 'auto',
		},
	},
	emptyState: {
		backgroundColor: palette.white,
		borderRadius: radius.card,
		padding: '24px',
		textAlign: 'center',
		color: redesignColors.placeholder,
		fontSize: '14px',
	},
});
