import { makeStyles } from '@mui/styles';
import { redesignColors } from './authRedesign';

export const adminMenuRedesignStyles = makeStyles({
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
		padding: '24px 20px 0',
		display: 'flex',
		flexDirection: 'column',
		gap: '14px',
	},
	tile: {
		backgroundColor: '#FFFFFF',
		borderRadius: '18px',
		padding: '14px 16px',
		display: 'flex',
		alignItems: 'center',
		gap: '14px',
		boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
		textDecoration: 'none',
		cursor: 'pointer',
		border: 'none',
		width: '100%',
		textAlign: 'start',
	},
	tileIcon: {
		width: '44px',
		height: '44px',
		borderRadius: '14px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
	tileLabel: {
		flexGrow: 1,
		'&.MuiTypography-root': {
			fontWeight: 600,
			fontSize: '15px',
			color: '#1F1B24',
		},
	},
});
