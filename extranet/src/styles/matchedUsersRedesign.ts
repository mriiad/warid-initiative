import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const matchedUsersRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#F4F3F6',
		paddingBottom: '160px',
	},
	topBar: {
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		padding: '16px 20px',
		backgroundColor: '#FFFFFF',
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
			color: '#1F1B24',
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
		backgroundColor: '#FFFFFF',
		borderRadius: '18px',
		padding: '12px 16px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
		cursor: 'pointer',
	},
	userAvatar: {
		width: '48px',
		height: '48px',
		borderRadius: '50%',
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
			color: '#1F1B24',
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
			color: '#E4E1E6',
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
	sendButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.successGreen,
			color: '#FFFFFF',
			borderRadius: '16px',
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
				color: '#FFFFFF',
			},
		},
	},
	whatsappButton: {
		'&.MuiIconButton-root': {
			width: '52px',
			height: '52px',
			borderRadius: '16px',
			backgroundColor: '#F1EFF4',
			color: '#1F1B24',
			boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
		},
	},
	emptyState: {
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '24px',
		textAlign: 'center',
		color: redesignColors.placeholder,
		fontSize: '14px',
	},
	paginationRow: {
		display: 'flex',
		justifyContent: 'center',
		gap: '12px',
		marginTop: '4px',
	},
});
