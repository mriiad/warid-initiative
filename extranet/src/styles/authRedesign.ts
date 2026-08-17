import { makeStyles } from '@mui/styles';
import { onRose, palette, radius, shadow } from './tokens';

// Palette sampled from the new auth mockups. Deliberately kept separate from
// the app-wide `colors.ts` / `mainStyles.ts` instead of overwriting them, so
// this redesign can be rolled out screen-by-screen without changing the look
// of pages that haven't been redesigned yet.
//
// The values now come from ./tokens -- same strings, single source. The
// shape of this object is unchanged so every existing importer still works.
export const redesignColors = {
	headerRose: palette.rose,
	headerRoseDark: palette.roseDark,
	textOnRose: onRose.full,
	textOnRoseMuted: onRose.strong,
	inputBorder: palette.border,
	inputText: palette.ink,
	placeholder: palette.muted,
	link: palette.rose,
	primaryButton: palette.rose,
	primaryButtonHover: palette.roseDark,
	successGreen: palette.successGreen,
	successGreenHover: palette.successGreenHover,
};

export const authRedesignStyles = makeStyles({
	screen: {
		minHeight: '100vh',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: redesignColors.headerRose,
	},
	header: {
		padding: '24px 24px 32px',
		color: redesignColors.textOnRose,
		flexShrink: 0,
	},
	backButton: {
		'&.MuiIconButton-root': {
			color: redesignColors.textOnRose,
			padding: 0,
			marginBottom: '24px',
		},
	},
	title: {
		'&.MuiTypography-root': {
			color: redesignColors.textOnRose,
			fontWeight: 700,
			fontSize: 'clamp(24px, 6vw, 32px)',
			textAlign: 'center',
		},
	},
	subtitle: {
		'&.MuiTypography-root': {
			color: redesignColors.textOnRoseMuted,
			fontSize: '14px',
			textAlign: 'center',
			marginTop: '8px',
		},
	},
	headerIcon: {
		width: '56px',
		height: '56px',
		borderRadius: '50%',
		backgroundColor: 'rgba(255, 255, 255, 0.22)',
		color: redesignColors.textOnRose,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		margin: '0 auto 16px',
	},
	subtitleLink: {
		color: redesignColors.textOnRose,
		fontWeight: 600,
		textDecoration: 'underline',
		cursor: 'pointer',
		background: 'none',
		border: 'none',
		font: 'inherit',
		padding: 0,
		marginInlineStart: '4px',
	},
	card: {
		flexGrow: 1,
		backgroundColor: palette.white,
		borderTopLeftRadius: '32px',
		borderTopRightRadius: '32px',
		padding: '32px 24px 48px',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
	},
	input: {
		'& .MuiOutlinedInput-root': {
			borderRadius: radius.input,
			backgroundColor: palette.white,
		},
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: redesignColors.inputBorder,
		},
		'& .MuiOutlinedInput-input': {
			color: redesignColors.inputText,
			fontSize: '15px',
			padding: '14px 16px',
		},
		'& .MuiFormLabel-root': {
			color: redesignColors.placeholder,
		},
	},
	inputRow: {
		display: 'flex',
		gap: '12px',
		'& > *': {
			flex: 1,
		},
	},
	// The app sets `dir="rtl"` on <html> but has no MUI theme with
	// `direction: 'rtl'`, so MUI's InputLabel keeps anchoring itself to the
	// physical left edge (`left: 14px`) regardless of language, while the
	// browser's native RTL flex mirroring pushes an `endAdornment` to that
	// same physical-left edge -- the two collide. Pulling the adornment out
	// of flow and onto the physical-right edge with logical CSS properties
	// (which do respect `dir`) keeps it clear of the label, and the matching
	// input padding keeps typed text from running under it.
	passwordInput: {
		'& .MuiInputAdornment-root': {
			position: 'absolute',
			insetInlineStart: '8px',
			top: '50%',
			transform: 'translateY(-50%)',
		},
		'& .MuiOutlinedInput-input': {
			paddingInlineStart: '44px',
		},
	},
	primaryButton: {
		'&.MuiButton-root': {
			backgroundColor: redesignColors.primaryButton,
			color: palette.white,
			borderRadius: radius.input,
			padding: '14px',
			fontSize: '16px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: shadow.none,
			'&:hover': {
				backgroundColor: redesignColors.primaryButtonHover,
				boxShadow: shadow.none,
			},
			'&.Mui-disabled': {
				backgroundColor: redesignColors.inputBorder,
				color: redesignColors.placeholder,
			},
		},
	},
	googleButton: {
		'&.MuiButton-root': {
			backgroundColor: palette.white,
			color: redesignColors.inputText,
			borderRadius: radius.input,
			padding: '13px',
			fontSize: '15px',
			fontWeight: 600,
			textTransform: 'none',
			border: `1px solid ${redesignColors.inputBorder}`,
			boxShadow: shadow.none,
			display: 'flex',
			gap: '10px',
			'&:hover': {
				backgroundColor: '#FAFAFA',
				boxShadow: shadow.none,
			},
		},
	},
	divider: {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		color: redesignColors.placeholder,
		fontSize: '13px',
		margin: '4px 0',
		'&::before, &::after': {
			content: '""',
			flexGrow: 1,
			height: '1px',
			backgroundColor: redesignColors.inputBorder,
		},
	},
	inlineRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		fontSize: '14px',
	},
	rememberMe: {
		display: 'flex',
		alignItems: 'center',
		gap: '4px',
		color: redesignColors.inputText,
		fontSize: '14px',
		'& .MuiCheckbox-root': {
			padding: '4px',
			color: redesignColors.inputBorder,
			'&.Mui-checked': {
				color: redesignColors.primaryButton,
			},
		},
	},
	link: {
		color: redesignColors.link,
		fontWeight: 600,
		textDecoration: 'none',
		cursor: 'pointer',
		background: 'none',
		border: 'none',
		font: 'inherit',
		fontSize: 'inherit',
		padding: 0,
	},
	footerText: {
		textAlign: 'center',
		fontSize: '14px',
		color: redesignColors.placeholder,
		marginTop: '8px',
	},
	phoneRow: {
		display: 'flex',
		gap: '10px',
	},
	countryChip: {
		display: 'flex',
		alignItems: 'center',
		gap: '4px',
		border: `1px solid ${redesignColors.inputBorder}`,
		borderRadius: radius.input,
		padding: '0 12px',
		flexShrink: 0,
		fontSize: '20px',
	},
});
