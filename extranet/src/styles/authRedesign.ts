import { makeStyles } from '@mui/styles';

// Palette sampled from the new auth mockups. Deliberately kept separate from
// the app-wide `colors.ts` / `mainStyles.ts` instead of overwriting them, so
// this redesign can be rolled out screen-by-screen without changing the look
// of pages that haven't been redesigned yet.
export const redesignColors = {
	headerRose: '#C56D86',
	headerRoseDark: '#B85D77',
	textOnRose: '#FFFFFF',
	textOnRoseMuted: 'rgba(255, 255, 255, 0.85)',
	inputBorder: '#E4E1E6',
	inputText: '#1F1B24',
	placeholder: '#8A8690',
	link: '#C56D86',
	primaryButton: '#C56D86',
	primaryButtonHover: '#B85D77',
	successGreen: '#A9C97E',
	successGreenHover: '#98BA6C',
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
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: '32px',
		borderTopRightRadius: '32px',
		padding: '32px 24px 48px',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
	},
	input: {
		'& .MuiOutlinedInput-root': {
			borderRadius: '16px',
			backgroundColor: '#FFFFFF',
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
			color: '#FFFFFF',
			borderRadius: '16px',
			padding: '14px',
			fontSize: '16px',
			fontWeight: 600,
			textTransform: 'none',
			boxShadow: 'none',
			'&:hover': {
				backgroundColor: redesignColors.primaryButtonHover,
				boxShadow: 'none',
			},
			'&.Mui-disabled': {
				backgroundColor: redesignColors.inputBorder,
				color: redesignColors.placeholder,
			},
		},
	},
	googleButton: {
		'&.MuiButton-root': {
			backgroundColor: '#FFFFFF',
			color: redesignColors.inputText,
			borderRadius: '16px',
			padding: '13px',
			fontSize: '15px',
			fontWeight: 600,
			textTransform: 'none',
			border: `1px solid ${redesignColors.inputBorder}`,
			boxShadow: 'none',
			display: 'flex',
			gap: '10px',
			'&:hover': {
				backgroundColor: '#FAFAFA',
				boxShadow: 'none',
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
		borderRadius: '16px',
		padding: '0 12px',
		flexShrink: 0,
		fontSize: '20px',
	},
});
