import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const userFilterRedesignStyles = makeStyles({
	paper: {
		width: 'min(400px, 100%)',
		borderRadius: '20px 0 0 20px',
	},
	container: {
		padding: '24px',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	headerRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: '20px',
	},
	title: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '18px',
			color: '#1F1B24',
		},
	},
	closeButton: {
		'&.MuiIconButton-root': {
			color: redesignColors.placeholder,
			backgroundColor: '#F4F3F6',
		},
	},
	body: {
		flex: 1,
		overflow: 'auto',
		display: 'flex',
		flexDirection: 'column',
		gap: '18px',
	},
	sectionLabel: {
		'&.MuiTypography-root': {
			fontSize: '12px',
			fontWeight: 600,
			color: redesignColors.placeholder,
			marginBottom: '6px',
		},
	},
	checkboxLabel: {
		margin: 0,
		'& .MuiFormControlLabel-label': {
			fontSize: '14px',
			color: '#1F1B24',
		},
		'& .MuiCheckbox-root': {
			color: redesignColors.inputBorder,
			'&.Mui-checked': {
				color: redesignColors.primaryButton,
			},
		},
	},
	slider: {
		'&.MuiSlider-root': {
			color: redesignColors.primaryButton,
		},
	},
	actionsRow: {
		display: 'flex',
		gap: '12px',
		marginTop: '4px',
		paddingTop: '16px',
		borderTop: `1px solid ${redesignColors.inputBorder}`,
	},
	resetButton: {
		'&.MuiButton-root': {
			flex: 1,
			borderRadius: '16px',
			padding: '13px',
			fontSize: '15px',
			fontWeight: 600,
			textTransform: 'none',
			color: redesignColors.inputText,
			borderColor: redesignColors.inputBorder,
			boxShadow: 'none',
		},
	},
	applyButton: {
		'&.MuiButton-root': {
			flex: 1,
			backgroundColor: redesignColors.primaryButton,
			color: '#FFFFFF',
			borderRadius: '16px',
			padding: '13px',
			fontSize: '15px',
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
