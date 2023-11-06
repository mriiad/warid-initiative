import { makeStyles } from '@mui/styles';
import colors from './colors';

export const mainStyles = makeStyles({
	title: {},
	subTitle: {
		color: colors.purple,
		fontWeight: 'bold',
		fontSize: 'clamp(14px, 1.3vw, 18px);',
	},
	textButton: {
		cursor: 'pointer',
		color: colors.rose,
	},
	mainButton: {
		backgroundColor: 'rgba(255,255,255,.3)',
		padding: '8px',
		borderWidth: '0.8px',
		overflow: 'visible',
		border: '1px solid #fff',
		borderRadius: '1.5625em',
		'& > button': {
			justifyContent: 'space-between',
			paddingLeft: '1.1em',
			paddingRight: '1.1em',
			color: 'white',
			display: 'flex',
			alignItems: 'center',
			width: 'auto',
			height: '3.5em',
			minHeight: '3.5em',
			minWidth: '3.5em',
			boxShadow: '0 15px 30px rgba(255,48,103,.3)',
			'&.MuiButtonBase-root': {
				backgroundColor: '#ff3067',
				borderRadius: '16px',
				'&:hover': {
					backgroundColor: colors.purple,
				},
			},
		},
	},
});

export const authStyles = makeStyles({
	formWrapper: {
		background: colors.formWhite,
		borderRadius: '30px',
		border: '1px solid white',
		padding: '30px',
		marginTop: '20px',
		'& .MuiOutlinedInput-notchedOutline': {
			border: 'none',
			backgroundColor: 'white',
			borderRadius: '20px',
		},
		'& .MuiInputBase-input': {
			height: '2em',
		},
		'& .MuiOutlinedInput-input': {
			color: colors.purple,
			fontWeight: 500,
			fontSize: 'clamp(14px, 1.3vw, 18px)',
		},
	},
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	formContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bar: {
		height: '4px',
		width: '55px',
		display: 'block',
		margin: '8px auto 0',
		backgroundColor: colors.purple,
	},
	button: {
		'&.MuiButton-root': {
			backgroundColor: colors.rose,
			color: 'white',
			borderRadius: '10px',
			padding: '10px 20px',
			fontSize: '16px',
			border: 'none',
			boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
			transition: 'transform 0.3s ease',
			cursor: 'pointer',
			'&:hover': {
				backgroundColor: colors.purple,
			},
		},
	},
	signUp: {
		color: colors.rose,
		'&.MuiTypography-root': {
			fontWeight: '500',
			fontSize: '3rem',
		},
	},
	form: {
		textAlign: 'center',
	},
});
