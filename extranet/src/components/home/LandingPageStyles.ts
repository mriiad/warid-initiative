import { makeStyles } from '@mui/styles';
import colors from '../../styles/colors';

export const useLandingPageStyles = makeStyles({
	'@font-face': {
		fontFamily: 'MoroccanFont',
		src: `url('/moroccan-font.ttf') format('truetype')`,
	},
	landingContainer: {
		margin: '0 -19px 55px -19px',
	},
	mainImageContainer: {
		margin: '0 -20px',
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	mainImageBody: {
		width: '28%',
		height: 'auto',
		margin: '0 -12px',
		maxWidth: '100%',
		boxSizing: 'border-box',
		objectFit: 'cover',
	},
	imageContainer: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		position: 'relative',
		'& > img': {
			height: '30%',
			position: 'relative',
			zIndex: 1,
			opacity: 0,
			animation: '$slideIn 0.5s ease-out forwards',
		},
		'& > img:nth-of-type(1)': {
			maxWidth: '30%',
			top: '-2px',
			marginRight: '-5%',
			animationDelay: '0.5s',
		},
		'& > img:nth-of-type(2)': {
			maxWidth: '50%',
			zIndex: 2,
			animationDelay: '1s',
		},
		'& > img:nth-of-type(3)': {
			maxWidth: '30%',
			top: '-6px',
			marginLeft: '-5%',
			animationDelay: '1.5s',
		},
	},
	blockImage: {
		maxWidth: '80%',
		display: 'block',
		marginTop: '8px',
		marginLeft: 'auto',
		marginRight: 'auto',
		opacity: 0,
		animation: '$fadeInUp 0.5s ease-out forwards',
		animationDelay: '2s',
	},
	textParagraph: {
		padding: '0 8px',
		fontFamily: 'MoroccanFont',
		textAlign: 'center',
		fontSize: '24px',
		color: colors.purple,
		opacity: 0,
		animation: '$fadeInUp 0.5s ease-out forwards',
		animationDelay: '2.5s',
	},
	highlightedText: {
		color: colors.rose,
		fontWeight: 600,
		marginTop: '20px',
	},
	mainImage: {
		display: 'block',
		maxWidth: '80%',
		height: 'auto',
		marginLeft: 'auto',
		marginRight: 'auto',
		marginTop: '-42px',
		opacity: 0,
		animation: '$fadeInUp 0.5s ease-out forwards',
		animationDelay: '3s',
	},
	avatarImage: {
		maxWidth: '20%',
		marginTop: '0',
		marginBottom: '8px',
	},
	bigNumber: {
		margin: 0,
		fontSize: '48px',
		color: colors.purple,
		fontWeight: 600,
	},
	contentBox: {
		backgroundImage: 'url(/landing-page/main_background.png)',
		backgroundSize: 'cover',
		width: '100%',
		padding: '20px',
		boxSizing: 'border-box',
		marginTop: '50px',
	},
	textBackgroundContainer: {
		width: '180px',
		height: '72px',
		margin: 'auto',
		'& > img': {
			position: 'relative',
			zIndex: 1,
			width: '20%',
			height: 'auto',
			display: 'block',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginBottom: '-30px',
		},
		'& > div': {
			height: '48px',
			display: 'flex',
			borderRadius: '16px',
			backgroundColor: colors.purple,
			alignItems: 'center',
			justifyContent: 'center',
			position: 'relative',
			top: '20px',
			'& > p': {
				fontFamily: 'MoroccanFont',
				fontSize: '24px',
				color: 'white',
			},
		},
	},
	numberBackground: {
		padding: '5px',
		height: '110px',
		color: 'white',
		margin: '0 3px',
		display: 'inline-flex',
		fontSize: '77px',
		minWidth: '72px',
		textAlign: 'center',
		alignItems: 'center',
		fontWeight: 'bold',
		borderRadius: '40px',
		justifyContent: 'center',
		backgroundColor: colors.purple,
		fontFamily: '"Digital Numbers", sans-serif',
		boxShadow: '-2px -4px 0px 0px #3b2a8261',
	},
	numbersContainer: {
		position: 'relative',
		zIndex: 1,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		margin: '24px 0',
	},
	gallery: {
		height: '352px',
		'& > p': {
			color: 'white',
		},
		'& > img': {
			position: 'relative',
			width: '20%',
			height: 'auto',
			display: 'block',
			marginLeft: 'auto',
			marginRight: 'auto',
			marginTop: '40px',
		},
	},
	partnersContainer: {
		'& > p': {
			color: colors.purple,
		},
	},
	footer: {
		marginTop: '-100px',
		'& > img': {
			width: '100%',
			marginBottom: '-8px',
		},
		'& > div': {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: '200px',
			backgroundColor: colors.purple,
			'& > a': {
				position: 'relative',
				zIndex: 1,
				'& > img': {
					display: 'block',
					width: '68px',
					height: 'auto',
				},
			},
			'& > p': { color: 'white', fontWeight: 'bold' },
		},
	},
	noMargin: { margin: 0 },
	'@keyframes slideIn': {
		from: {
			transform: 'translateX(100%)',
			opacity: 0,
		},
		to: {
			transform: 'translateX(0)',
			opacity: 1,
		},
	},
	'@keyframes fadeInUp': {
		from: {
			transform: 'translateY(20px)',
			opacity: 0,
		},
		to: {
			transform: 'translateY(0)',
			opacity: 1,
		},
	},
	title: {
		fontSize: '50px',
		margin: '36px auto 24px auto',
		width: 'fit-content',
	},
});