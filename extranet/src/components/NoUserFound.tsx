import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import colors from '../styles/colors';

const useStyles = makeStyles({
	noUsersContainer: {
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
	noUsersIcon: {
		fontSize: '8rem',
		color: colors.purple,
		marginBottom: '20px',
	},
	noUsersText: {
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
		cursor: 'pointer',
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

const NoUserFound = () => {
	const navigate = useNavigate();
	const {
		noUsersContainer,
		noUsersText,
		description,
		homeButton,
		svgIllustration,
	} = useStyles();

	return (
		<div className={noUsersContainer}>
			<Typography variant='h1' className={noUsersText}>
				No Users Found
			</Typography>
			<img
				src='/blood-donation-hand.svg'
				alt='Blood Donation'
				className={svgIllustration}
			/>
			<Typography className={description}>
				We couldn't find any users matching your criteria.
			</Typography>
			<div
				className={homeButton}
				onClick={() => {
					console.log('RESET!!');
					navigate('/users?page=1');
				}}
				role='button'
			>
				Reset Filter
			</div>
		</div>
	);
};

export default NoUserFound;
