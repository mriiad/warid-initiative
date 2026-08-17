import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { onRose, palette, radius, shadow } from './tokens';

export const landingRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: palette.ground,
		paddingBottom: '160px',
	},
	hero: {
		backgroundColor: redesignColors.headerRose,
		padding: '16px 20px 44px',
		color: palette.white,
	},
	heroTopRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	heroIcon: {
		width: '48px',
		height: '48px',
		borderRadius: radius.input,
		backgroundColor: onRose.surface,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	heroAccountButton: {
		'&.MuiIconButton-root': {
			width: '40px',
			height: '40px',
			borderRadius: radius.chip,
			backgroundColor: 'rgba(255, 255, 255, 0.2)',
			color: palette.white,
		},
	},
	heroTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '19px',
			color: palette.white,
			marginTop: '14px',
		},
	},
	heroSubtitle: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: onRose.strong,
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
		backgroundColor: palette.white,
		borderRadius: radius.input,
		padding: '14px 8px',
		textAlign: 'center',
		boxShadow: shadow.card,
	},
	statNumber: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '18px',
			color: palette.ink,
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
			color: palette.ink,
		},
	},
	card: {
		backgroundColor: palette.white,
		borderRadius: radius.row,
		padding: '16px',
		boxShadow: shadow.card,
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
			color: palette.ink,
		},
	},
	exploreButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.primaryButton,
			color: palette.white,
			borderRadius: radius.button,
			padding: '10px',
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
	aboutRow: {
		display: 'flex',
		gap: '12px',
		alignItems: 'flex-start',
	},
	aboutIcon: {
		width: '40px',
		height: '40px',
		borderRadius: radius.button,
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
			color: palette.ink,
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
		backgroundColor: palette.ink,
		borderRadius: radius.card,
		padding: '24px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: '10px',
		textAlign: 'center',
	},
	footerLinksRow: {
		display: 'flex',
		alignItems: 'center',
		flexWrap: 'wrap',
		justifyContent: 'center',
		gap: '10px',
	},
	footerLink: {
		color: palette.white,
		fontWeight: 600,
		fontSize: '13px',
		textDecoration: 'none',
		background: 'none',
		border: 'none',
		cursor: 'pointer',
		font: 'inherit',
		padding: 0,
	},
	footerLinkDivider: {
		color: 'rgba(255, 255, 255, 0.35)',
		fontSize: '13px',
	},
	footerCopyright: {
		'&.MuiTypography-root': {
			fontSize: '12px',
			color: onRose.soft,
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
			color: palette.white,
		},
	},
});
