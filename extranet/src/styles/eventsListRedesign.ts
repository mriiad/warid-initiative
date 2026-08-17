import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { onRose, palette, radius } from './tokens';

export const eventsListRedesignStyles = makeStyles({
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
	searchField: {
		padding: '0 20px 12px',
		backgroundColor: palette.white,
	},
	content: {
		padding: '20px 20px 0',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
	},
	hero: {
		position: 'relative',
		backgroundColor: redesignColors.headerRose,
		borderRadius: radius.sheet,
		padding: '22px',
		color: palette.white,
	},
	heroIcon: {
		width: '48px',
		height: '48px',
		borderRadius: radius.input,
		backgroundColor: onRose.surface,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: '18px',
	},
	heroAddButton: {
		'&.MuiIconButton-root': {
			position: 'absolute',
			top: '18px',
			insetInlineEnd: '18px',
			width: '40px',
			height: '40px',
			borderRadius: radius.chip,
			backgroundColor: onRose.surface,
			color: palette.white,
		},
	},
	heroTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '22px',
			color: palette.white,
		},
	},
	heroSubtitle: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: onRose.medium,
			marginTop: '4px',
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
