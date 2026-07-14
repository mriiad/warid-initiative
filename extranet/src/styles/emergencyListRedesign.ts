import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const emergencyListRedesignStyles = makeStyles({
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
	hero: {
		backgroundColor: '#1F1B24',
		borderRadius: '20px',
		padding: '18px 20px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
	},
	heroIcon: {
		width: '44px',
		height: '44px',
		borderRadius: '14px',
		backgroundColor: 'rgba(255, 255, 255, 0.12)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		fontSize: '22px',
	},
	heroTitle: {
		'&.MuiTypography-root': {
			color: '#FFFFFF',
			fontWeight: 700,
			fontSize: '16px',
		},
	},
	heroSubtitle: {
		'&.MuiTypography-root': {
			color: 'rgba(255, 255, 255, 0.6)',
			fontSize: '13px',
		},
	},
	heroCount: {
		backgroundColor: redesignColors.headerRose,
		color: '#FFFFFF',
		borderRadius: '14px',
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
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '16px',
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	cardIcon: {
		width: '40px',
		height: '40px',
		borderRadius: '12px',
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
			color: '#1F1B24',
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
			color: '#FFFFFF',
			borderRadius: '14px',
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: 'none',
			'&:hover': {
				backgroundColor: redesignColors.successGreenHover,
				boxShadow: 'none',
			},
			'&.Mui-disabled': {
				backgroundColor: '#D8E5C4',
				color: '#FFFFFF',
			},
		},
	},
	matchedUsersButton: {
		'&.MuiIconButton-root': {
			width: '44px',
			height: '44px',
			borderRadius: '14px',
			backgroundColor: '#F1EFF4',
			color: '#1F1B24',
			marginInlineStart: 'auto',
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
