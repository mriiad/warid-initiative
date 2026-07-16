import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const eventsListRedesignStyles = makeStyles({
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
	searchField: {
		padding: '0 20px 12px',
		backgroundColor: '#FFFFFF',
	},
	content: {
		padding: '20px 20px 0',
		display: 'flex',
		flexDirection: 'column',
		gap: '16px',
	},
	hero: {
		position: 'relative',
		backgroundColor: redesignColors.headerRose,
		borderRadius: '24px',
		padding: '22px',
		color: '#FFFFFF',
	},
	heroIcon: {
		width: '48px',
		height: '48px',
		borderRadius: '16px',
		backgroundColor: 'rgba(255, 255, 255, 0.25)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: '18px',
	},
	heroAddButton: {
		'&.MuiIconButton-root': {
			position: 'absolute',
			top: '18px',
			insetInlineEnd: '18px',
			width: '40px',
			height: '40px',
			borderRadius: '12px',
			backgroundColor: 'rgba(255, 255, 255, 0.25)',
			color: '#FFFFFF',
		},
	},
	heroTitle: {
		'&.MuiTypography-root': {
			fontWeight: 700,
			fontSize: '22px',
			color: '#FFFFFF',
		},
	},
	heroSubtitle: {
		'&.MuiTypography-root': {
			fontSize: '13px',
			color: 'rgba(255, 255, 255, 0.75)',
			marginTop: '4px',
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
