import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { palette, radius, shadow } from './tokens';

export const matchedUsersRedesignStyles = makeStyles({
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
	selectRow: {
		display: 'flex',
		justifyContent: 'flex-end',
	},
	selectToggle: {
		'&.MuiButton-root': {
			color: redesignColors.successGreen,
			fontWeight: 700,
			fontSize: '15px',
			textTransform: 'none',
			minWidth: 0,
			padding: 0,
		},
	},
	userRow: {
		backgroundColor: palette.white,
		borderRadius: radius.row,
		padding: '12px 16px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		boxShadow: shadow.card,
		cursor: 'pointer',
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
	userInfo: {
		flexGrow: 1,
	},
	userName: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: palette.ink,
		},
	},
	userBloodGroup: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '13px',
			color: '#D1435B',
			marginTop: '2px',
		},
	},
	checkbox: {
		'&.MuiCheckbox-root': {
			color: palette.border,
		},
		'&.Mui-checked': {
			color: `${redesignColors.successGreen} !important`,
		},
	},
	actionBar: {
		position: 'fixed',
		bottom: '96px',
		insetInlineStart: 0,
		insetInlineEnd: 0,
		display: 'flex',
		justifyContent: 'center',
		gap: '12px',
		padding: '0 20px',
	},
	// The only send action (SMS was removed -- WhatsApp covers it), so this
	// is styled as the screen's one primary CTA rather than a small icon
	// button next to another action.
	whatsappButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.successGreen,
			color: palette.white,
			borderRadius: radius.input,
			padding: '14px 32px',
			fontSize: '15px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: '0 8px 20px rgba(169, 201, 126, 0.4)',
			'&:hover': {
				backgroundColor: redesignColors.successGreenHover,
				boxShadow: '0 8px 20px rgba(169, 201, 126, 0.4)',
			},
			'&.Mui-disabled': {
				backgroundColor: '#D8E5C4',
				color: palette.white,
			},
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
