import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { palette, radius, shadow } from './tokens';

export const adminMenuRedesignStyles = makeStyles({
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
		padding: '24px 20px 0',
		display: 'flex',
		flexDirection: 'column',
		gap: '14px',
	},
	tile: {
		backgroundColor: palette.white,
		borderRadius: radius.row,
		padding: '14px 16px',
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
	tileIcon: {
		width: '44px',
		height: '44px',
		borderRadius: radius.button,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	tileLabel: {
		flexGrow: 1,
		'&.MuiTypography-root': {
			fontWeight: 600,
			fontSize: '15px',
			color: palette.ink,
		},
	},
});
