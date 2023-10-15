import { CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles({
	fallback: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
	verificationContainer: {
		marginTop: '30px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		zIndex: 1000,
	},
	resultMessage: {
		marginTop: '20px',
	},
});

const CanDonate: React.FC = () => {
	const [canDonate, setCanDonate] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const { fallback, verificationContainer, resultMessage } = useStyles();

	useEffect(() => {
		const checkCanDonate = async () => {
			setIsLoading(true);
			try {
				const response = await axios.get(
					'http://localhost:3000/api/donation/canDonate'
				);
				setCanDonate(response.data.canDonate);
			} catch (error) {
				console.error('Error checking donation eligibility', error);
			} finally {
				setTimeout(() => {
					setIsLoading(false);
				}, 3000);
			}
		};

		checkCanDonate();
	}, []);

	return (
		<div className={verificationContainer}>
			{isLoading ? (
				<CircularProgress />
			) : canDonate === null ? (
				<Typography className={resultMessage}>
					Unable to determine eligibility.
				</Typography>
			) : canDonate ? (
				<Typography className={resultMessage}>
					Based on your last donation date, you are allowed to donate.
				</Typography>
			) : (
				<Typography className={resultMessage}>
					Sorry, you are not allowed to donate.
				</Typography>
			)}
		</div>
	);
};

export default CanDonate;
