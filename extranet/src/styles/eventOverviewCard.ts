import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { statCardColors } from './dashboardRedesign';

export const eventOverviewCardStyles = makeStyles({
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '18px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	headerRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		marginBottom: '10px',
	},
	iconBadge: {
		width: '32px',
		height: '32px',
		borderRadius: '10px',
		backgroundColor: statCardColors.donations.bg,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	title: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '16px',
			color: '#1F1B24',
		},
	},
	dateRow: {
		display: 'flex',
		justifyContent: 'space-between',
		fontSize: '13px',
		marginBottom: '10px',
	},
	dateStart: {
		color: redesignColors.placeholder,
	},
	dateEnd: {
		color: redesignColors.headerRose,
		fontWeight: 600,
	},
	progressTrack: {
		height: '4px',
		borderRadius: '2px',
		backgroundColor: '#EEEAF0',
		marginBottom: '16px',
		overflow: 'hidden',
	},
	progressFill: {
		height: '100%',
		backgroundColor: redesignColors.headerRose,
		borderRadius: '2px',
	},
	weekStrip: {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '18px',
	},
	weekDay: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '6px',
		fontSize: '12px',
		color: redesignColors.placeholder,
	},
	weekDayNumber: {
		width: '28px',
		height: '28px',
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '13px',
		color: '#1F1B24',
	},
	weekDayNumberActive: {
		backgroundColor: redesignColors.headerRose,
		color: '#FFFFFF',
		fontWeight: 700,
	},
	actionsRow: {
		display: 'flex',
		gap: '10px',
	},
	primaryActionButton: {
		'&.MuiButton-root': {
			backgroundColor: '#1F1B3A',
			color: '#FFFFFF',
			borderRadius: '14px',
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: 'none',
			display: 'flex',
			gap: '8px',
			'&:hover': {
				backgroundColor: '#141026',
				boxShadow: 'none',
			},
		},
	},
	iconSquareButton: {
		'&.MuiIconButton-root': {
			width: '44px',
			height: '44px',
			borderRadius: '14px',
			backgroundColor: '#FBE4EA',
			color: redesignColors.headerRose,
		},
	},
	iconSquareButtonNeutral: {
		'&.MuiIconButton-root': {
			width: '44px',
			height: '44px',
			borderRadius: '14px',
			backgroundColor: '#F1EFF4',
			color: '#1F1B24',
			marginInlineStart: 'auto',
		},
	},
});
