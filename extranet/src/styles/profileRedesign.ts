import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { palette, radius, shadow } from './tokens';

export const profileRedesignStyles = makeStyles({
	sectionHeaderRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: '16px',
	},
	sectionTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: palette.ink,
		},
	},
	editToggleButton: {
		'&.MuiIconButton-root': {
			width: '36px',
			height: '36px',
			borderRadius: radius.chip,
			backgroundColor: palette.subtle,
			color: palette.ink,
		},
	},
	actionsRow: {
		display: 'flex',
		gap: '10px',
		marginTop: '16px',
	},
	cancelButton: {
		'&.MuiButton-root': {
			flex: 1,
			backgroundColor: palette.subtle,
			color: palette.ink,
			borderRadius: radius.button,
			padding: '11px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
			'&:hover': {
				backgroundColor: palette.border,
				boxShadow: shadow.none,
			},
		},
	},
	saveButton: {
		'&.MuiButton-root': {
			flex: 1,
			backgroundColor: redesignColors.primaryButton,
			color: palette.white,
			borderRadius: radius.button,
			padding: '11px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
			'&:hover': {
				backgroundColor: redesignColors.primaryButtonHover,
				boxShadow: shadow.none,
			},
		},
	},
	passwordPrompt: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		textAlign: 'center',
		gap: '6px',
		padding: '12px 0 4px',
	},
	passwordPromptIcon: {
		width: '52px',
		height: '52px',
		borderRadius: radius.pill,
		backgroundColor: palette.subtle,
		color: redesignColors.placeholder,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: '6px',
	},
	passwordPromptBody: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
			marginBottom: '10px',
		},
	},
	changePasswordButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.primaryButton,
			color: palette.white,
			borderRadius: radius.button,
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
			'&:hover': {
				backgroundColor: redesignColors.primaryButtonHover,
				boxShadow: shadow.none,
			},
		},
	},
});
