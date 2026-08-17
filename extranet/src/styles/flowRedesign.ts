import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';
import { palette, radius, shadow } from './tokens';

// Shared look for short, focused "flow step" screens that sit between two
// other real pages (CanDonate, EventConfirmation) -- no bottom nav, since
// they're transient steps, not destinations of their own.
export const flowRedesignStyles = makeStyles({
	flowCenter: {
		minHeight: 'calc(100vh - 60px)',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		padding: '24px 32px',
		gap: '16px',
		backgroundColor: palette.ground,
	},
	flowIconCircle: {
		width: '84px',
		height: '84px',
		borderRadius: radius.pill,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	flowTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '16px',
			color: palette.ink,
		},
	},
	flowSub: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: redesignColors.placeholder,
			lineHeight: 1.5,
		},
	},
	flowButton: {
		'&.MuiButton-root': {
			marginTop: '8px',
			backgroundColor: redesignColors.primaryButton,
			color: palette.white,
			borderRadius: radius.input,
			padding: '13px',
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
});
