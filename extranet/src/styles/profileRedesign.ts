import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

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
			color: '#1F1B24',
		},
	},
	editToggleButton: {
		'&.MuiIconButton-root': {
			width: '36px',
			height: '36px',
			borderRadius: '12px',
			backgroundColor: '#F1EFF4',
			color: '#1F1B24',
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
			backgroundColor: '#F1EFF4',
			color: '#1F1B24',
			borderRadius: '14px',
			padding: '11px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: 'none',
			'&:hover': {
				backgroundColor: '#E4E1E6',
				boxShadow: 'none',
			},
		},
	},
	saveButton: {
		'&.MuiButton-root': {
			flex: 1,
			backgroundColor: redesignColors.primaryButton,
			color: '#FFFFFF',
			borderRadius: '14px',
			padding: '11px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: 'none',
			'&:hover': {
				backgroundColor: redesignColors.primaryButtonHover,
				boxShadow: 'none',
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
		borderRadius: '50%',
		backgroundColor: '#F1EFF4',
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
			color: '#FFFFFF',
			borderRadius: '14px',
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: 'none',
			'&:hover': {
				backgroundColor: redesignColors.primaryButtonHover,
				boxShadow: 'none',
			},
		},
	},
});
