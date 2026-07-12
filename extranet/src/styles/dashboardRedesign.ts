import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const statCardColors = {
	users: { bg: '#FBE4C9', fg: '#C97A2B' },
	donations: { bg: '#DCE3F7', fg: '#4A5FA8' },
	events: { bg: '#DCEFC9', fg: '#5C8A2B' },
	donationsAlt: { bg: '#6B4A3A', fg: '#F3D9C9' },
};

export const dashboardRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#F4F3F6',
		paddingBottom: '160px',
	},
	header: {
		backgroundColor: redesignColors.headerRose,
		padding: '20px 20px 40px',
		flexShrink: 0,
	},
	searchBar: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		backgroundColor: 'rgba(255, 255, 255, 0.18)',
		borderRadius: '18px',
		padding: '12px 16px',
		color: '#FFFFFF',
	},
	searchInput: {
		flexGrow: 1,
		background: 'none',
		border: 'none',
		outline: 'none',
		color: '#FFFFFF',
		fontSize: '15px',
		'&::placeholder': {
			color: 'rgba(255, 255, 255, 0.75)',
		},
	},
	searchIconButton: {
		'&.MuiIconButton-root': {
			color: '#FFFFFF',
			padding: '4px',
		},
	},
	greetingRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		marginTop: '28px',
	},
	avatar: {
		width: '52px',
		height: '52px',
		borderRadius: '50%',
		backgroundColor: 'rgba(255, 255, 255, 0.25)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: '#FFFFFF',
		fontSize: '20px',
		fontWeight: 700,
		flexShrink: 0,
	},
	greetingTitle: {
		'&.MuiTypography-root': {
			color: '#FFFFFF',
			fontWeight: 700,
			fontSize: '19px',
		},
	},
	greetingSubtitle: {
		'&.MuiTypography-root': {
			color: 'rgba(255, 255, 255, 0.85)',
			fontSize: '13px',
		},
	},
	content: {
		flexGrow: 1,
		padding: '24px 20px 0',
		marginTop: '-24px',
	},
	sectionTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '17px',
			color: '#1F1B24',
			marginBottom: '14px',
		},
	},
	statGrid: {
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gap: '14px',
		marginBottom: '28px',
	},
	statCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '16px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	statIcon: {
		width: '44px',
		height: '44px',
		borderRadius: '14px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: '28px',
	},
	statLabel: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
		},
	},
	statValue: {
		'&.MuiTypography-root': {
			fontSize: '22px',
			fontWeight: 700,
			color: '#1F1B24',
		},
	},
	eventCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '18px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	eventHeaderRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		marginBottom: '10px',
	},
	eventIconBadge: {
		width: '32px',
		height: '32px',
		borderRadius: '10px',
		backgroundColor: statCardColors.donations.bg,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	eventTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '16px',
			color: '#1F1B24',
		},
	},
	eventDateRow: {
		display: 'flex',
		justifyContent: 'space-between',
		fontSize: '13px',
		marginBottom: '10px',
	},
	eventDateStart: {
		color: redesignColors.placeholder,
	},
	eventDateEnd: {
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
	eventActionsRow: {
		display: 'flex',
		gap: '10px',
	},
	editButton: {
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
	emptyState: {
		backgroundColor: '#FFFFFF',
		borderRadius: '20px',
		padding: '24px',
		textAlign: 'center',
		color: redesignColors.placeholder,
		fontSize: '14px',
	},
});
