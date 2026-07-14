import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const landingRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#F4F3F6',
		paddingBottom: '160px',
	},
	hero: {
		backgroundColor: redesignColors.headerRose,
		padding: '16px 20px 44px',
		color: '#FFFFFF',
	},
	heroTopRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	heroIcon: {
		width: '48px',
		height: '48px',
		borderRadius: '16px',
		backgroundColor: 'rgba(255, 255, 255, 0.25)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroAccountButton: {
		'&.MuiIconButton-root': {
			width: '40px',
			height: '40px',
			borderRadius: '12px',
			backgroundColor: 'rgba(255, 255, 255, 0.2)',
			color: '#FFFFFF',
		},
	},
	heroTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '19px',
			color: '#FFFFFF',
			marginTop: '14px',
		},
	},
	heroSubtitle: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: 'rgba(255, 255, 255, 0.85)',
			marginTop: '4px',
			lineHeight: 1.5,
		},
	},
	content: {
		marginTop: '-26px',
		padding: '0 20px 20px',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
	},
	statStrip: {
		display: 'flex',
		gap: '10px',
	},
	statPill: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: '16px',
		padding: '14px 8px',
		textAlign: 'center',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	statNumber: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '18px',
			color: '#1F1B24',
		},
	},
	statLabel: {
		'&.MuiTypography-root': {
			fontSize: '12px',
			color: redesignColors.placeholder,
			marginTop: '2px',
		},
	},
	sectionTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '15px',
			color: '#1F1B24',
		},
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: '18px',
		padding: '16px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
	},
	eventCardRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
		marginBottom: '12px',
	},
	eventCardIcon: {
		width: '30px',
		height: '30px',
		borderRadius: '10px',
		backgroundColor: '#FBE4EA',
		color: redesignColors.headerRose,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	eventCardTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '13px',
			color: '#1F1B24',
		},
	},
	exploreButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.primaryButton,
			color: '#FFFFFF',
			borderRadius: '14px',
			padding: '10px',
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
	aboutRow: {
		display: 'flex',
		gap: '12px',
		alignItems: 'flex-start',
	},
	aboutIcon: {
		width: '40px',
		height: '40px',
		borderRadius: '14px',
		backgroundColor: '#DCEFC9',
		color: '#5C8A2B',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
		fontSize: '18px',
	},
	aboutTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '13px',
			color: '#1F1B24',
		},
	},
	aboutBody: {
		'&.MuiTypography-root': {
			fontSize: '12.5px',
			color: redesignColors.placeholder,
			marginTop: '3px',
			lineHeight: 1.6,
		},
	},
	galleryWrapper: {
		margin: '0 -16px',
	},
	footer: {
		backgroundColor: '#1F1B24',
		borderRadius: '20px',
		padding: '24px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '10px',
		textAlign: 'center',
	},
	footerLink: {
		color: '#FFFFFF',
		fontWeight: 600,
		fontSize: '13px',
		textDecoration: 'none',
	},
	footerCopyright: {
		'&.MuiTypography-root': {
			fontSize: '12px',
			color: 'rgba(255, 255, 255, 0.6)',
		},
	},
	socialRow: {
		display: 'flex',
		gap: '12px',
	},
	socialButton: {
		'&.MuiIconButton-root': {
			width: '36px',
			height: '36px',
			borderRadius: '10px',
			backgroundColor: 'rgba(255, 255, 255, 0.1)',
			color: '#FFFFFF',
		},
	},
});
