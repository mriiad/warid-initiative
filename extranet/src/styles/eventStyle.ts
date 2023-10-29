import { makeStyles } from '@mui/styles';

export const useEventStyles = makeStyles({
	infoCard: {
		borderRadius: '10px',
		display: 'flex',
		alignItems: 'center',
		color: '#000',
	},
	iconBox: {
		flex: '1',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '10px',
	},
	dataBox: {
		flex: '6',
		padding: '10px',
	},
	verticalDivider: {
		height: '80%',
		backgroundColor: '#cfbbbb36',
	},
});
