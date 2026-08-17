import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { onRose, palette, radius, shadow } from './tokens';

export const usersListRedesignStyles = makeStyles({
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
		backgroundColor: '#1F1B3A',
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
		backgroundColor: '#FBE4C9',
		color: '#C97A2B',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
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
		backgroundColor: '#3B2A82',
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
	userRow: {
		backgroundColor: palette.white,
		borderRadius: radius.row,
		padding: '12px 16px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		boxShadow: shadow.card,
		textDecoration: 'none',
		cursor: 'pointer',
		border: 'none',
		width: '100%',
		textAlign: 'start',
	},
	userAvatar: {
		width: '48px',
		height: '48px',
		borderRadius: radius.pill,
		backgroundColor: '#FBE4C9',
		color: '#C97A2B',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontWeight: 700,
		fontSize: '18px',
		flexShrink: 0,
	},
	userName: {
		flexGrow: 1,
		'&.MuiTypography-root': {
			fontWeight: 600,
			fontSize: '15px',
			color: palette.ink,
		},
	},
	userMeta: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
			marginTop: '2px',
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
