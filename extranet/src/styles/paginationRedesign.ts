import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const paginationRedesignStyles = makeStyles({
	row: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '16px',
		marginTop: '4px',
	},
	button: {
		'&.MuiIconButton-root': {
			width: '40px',
			height: '40px',
			backgroundColor: '#F1EFF4',
			color: redesignColors.inputText,
		},
		'&.Mui-disabled': {
			color: redesignColors.placeholder,
			opacity: 0.6,
		},
	},
	label: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			fontWeight: 600,
			color: redesignColors.inputText,
			minWidth: '80px',
			textAlign: 'center',
		},
	},
});
