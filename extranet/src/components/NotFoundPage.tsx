import { Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { useNavigate } from 'react-router-dom';
import colors from '../styles/colors';

const useStyles = makeStyles({
	notFoundContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		padding: '40px',
		borderRadius: '30px',
		backgroundColor: colors.formWhite,
		border: `1px solid ${colors.purple}`,
		marginTop: '50px',
	},
	notFoundIcon: {
		fontSize: '8rem',
		color: colors.purple,
		marginBottom: '20px',
	},
	notFoundText: {
		fontSize: '4rem',
		fontWeight: 'bold',
		color: colors.purple,
		marginBottom: '20px',
	},
	description: {
		fontSize: '1.2rem',
		color: colors.rose,
		marginBottom: '20px',
	},
	homeButton: {
		backgroundColor: colors.rose,
		color: 'white',
		borderRadius: '10px',
		marginTop: '20px',
		padding: '10px 20px',
		fontSize: '16px',
		boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
		'&:hover': {
			backgroundColor: colors.purple,
		},
	},
	svgIllustration: {
		width: '40%',
		height: 'auto',
		marginBottom: '20px',
	},
});

const NotFoundPage = () => {
	const navigate = useNavigate();
	const {
		notFoundContainer,
		notFoundText,
		description,
		homeButton,
		svgIllustration,
	} = useStyles();

	return (
		<div className={notFoundContainer}>
			<Typography variant='h1' className={notFoundText}>
				404
			</Typography>
			<img
				src='/blood-donation-hand.svg'
				alt='Blood Donation'
				className={svgIllustration}
			/>
			<Typography className={description}>
		       عفوًا! الصفحة التي تبحث عنها غير موجودة هنا
			</Typography>
			<div className={homeButton} onClick={() => navigate('/')}>
			    العودة إلى الصفحة الرئيسية
			</div>
		</div>
	);
};

export default NotFoundPage;
