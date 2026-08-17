import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { onRose, palette, radius, shadow } from './tokens';

export const statCardColors = {
	users: { bg: '#FBE4C9', fg: '#C97A2B' },
	donations: { bg: '#DCE3F7', fg: '#4A5FA8' },
	events: { bg: '#DCEFC9', fg: '#5C8A2B' },
	donationsAlt: { bg: '#6B4A3A', fg: '#F3D9C9' },
	// Same error-red used by Dashboard.tsx's error state, so "needs
	// attention" reads consistently across the app.
	emergencies: { bg: '#FADBD8', fg: '#B3261E' },
};

export const dashboardRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: palette.ground,
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
		justifyContent: 'space-between',
		gap: '10px',
		backgroundColor: onRose.surfaceFaint,
		borderRadius: radius.row,
		padding: '12px 16px',
		color: palette.white,
	},
	searchIconButton: {
		'&.MuiIconButton-root': {
			color: palette.white,
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
		borderRadius: radius.pill,
		backgroundColor: onRose.surface,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: palette.white,
		fontSize: '20px',
		fontWeight: 700,
		flexShrink: 0,
	},
	greetingTitle: {
		'&.MuiTypography-root': {
			color: palette.white,
			fontWeight: 700,
			fontSize: '19px',
		},
	},
	greetingSubtitle: {
		'&.MuiTypography-root': {
			color: onRose.strong,
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
			color: palette.ink,
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
		backgroundColor: palette.white,
		borderRadius: radius.card,
		padding: '16px',
		boxShadow: shadow.card,
	},
	statIcon: {
		width: '44px',
		height: '44px',
		borderRadius: radius.button,
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
			color: palette.ink,
		},
	},
	eventCard: {
		backgroundColor: palette.white,
		borderRadius: radius.card,
		padding: '18px',
		boxShadow: shadow.card,
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
			color: palette.ink,
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
		borderRadius: radius.pill,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '13px',
		color: palette.ink,
	},
	weekDayNumberActive: {
		backgroundColor: redesignColors.headerRose,
		color: palette.white,
		fontWeight: 700,
	},
	eventActionsRow: {
		display: 'flex',
		gap: '10px',
	},
	editButton: {
		'&.MuiButton-root': {
			backgroundColor: '#1F1B3A',
			color: palette.white,
			borderRadius: radius.button,
			padding: '10px 20px',
			fontSize: '14px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
			display: 'flex',
			gap: '8px',
			'&:hover': {
				backgroundColor: '#141026',
				boxShadow: shadow.none,
			},
		},
	},
	iconSquareButton: {
		'&.MuiIconButton-root': {
			width: '44px',
			height: '44px',
			borderRadius: radius.button,
			backgroundColor: '#FBE4EA',
			color: redesignColors.headerRose,
		},
	},
	iconSquareButtonNeutral: {
		'&.MuiIconButton-root': {
			width: '44px',
			height: '44px',
			borderRadius: radius.button,
			backgroundColor: palette.subtle,
			color: palette.ink,
			marginInlineStart: 'auto',
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
	giftCard: {
		marginTop: '20px',
		backgroundColor: 'rgba(255, 255, 255, 0.16)',
		borderRadius: radius.row,
		padding: '16px',
	},
	giftHeaderRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		marginBottom: '14px',
	},
	giftIcon: {
		width: '32px',
		height: '32px',
		borderRadius: '10px',
		backgroundColor: onRose.surfaceSoft,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		fontSize: '15px',
	},
	giftTitle: {
		'&.MuiTypography-root': {
			color: palette.white,
			fontWeight: 700,
			fontSize: '14px',
		},
	},
	giftDaysRow: {
		display: 'flex',
		justifyContent: 'space-between',
	},
	giftDay: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '6px',
		fontSize: '11px',
		color: onRose.medium,
	},
	giftDayMarkerFilled: {
		fontSize: '18px',
	},
	giftDayMarkerEmpty: {
		width: '18px',
		height: '18px',
		borderRadius: radius.pill,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
	},
	sectionHeaderRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: '14px',
	},
	seeAllLink: {
		'&.MuiButton-root': {
			color: redesignColors.headerRose,
			fontWeight: 600,
			fontSize: '13px',
			textTransform: 'none',
			minWidth: 0,
			padding: 0,
		},
	},
	carouselTrack: {
		display: 'flex',
		gap: '14px',
		overflowX: 'auto',
		paddingBottom: '4px',
		scrollSnapType: 'x mandatory',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
	},
	carouselCard: {
		flex: '0 0 calc(100% - 12px)',
		scrollSnapAlign: 'start',
	},
	carouselDots: {
		display: 'flex',
		justifyContent: 'center',
		gap: '6px',
		marginTop: '10px',
		marginBottom: '28px',
	},
	carouselDot: {
		width: '6px',
		height: '6px',
		borderRadius: radius.pill,
		backgroundColor: palette.border,
	},
	carouselDotActive: {
		backgroundColor: redesignColors.headerRose,
		width: '16px',
		borderRadius: '3px',
	},
	historyRow: {
		backgroundColor: palette.white,
		borderRadius: radius.row,
		padding: '14px 16px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		boxShadow: shadow.card,
		marginBottom: '12px',
	},
	historyIcon: {
		width: '40px',
		height: '40px',
		borderRadius: radius.chip,
		backgroundColor: statCardColors.donationsAlt.bg,
		color: statCardColors.donationsAlt.fg,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	historyTitle: {
		'&.MuiTypography-root': {
			fontWeight: 600,
			fontSize: '14px',
			color: palette.ink,
		},
	},
	historyMeta: {
		'&.MuiTypography-root': {
			fontSize: '12px',
			color: redesignColors.placeholder,
			marginTop: '2px',
		},
	},
});
