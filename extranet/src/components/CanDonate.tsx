import { Button, CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import colors from '../styles/colors';
import CardComponent from './shared/CardComponent';

const useStyles = makeStyles({
	resultMessage: {
		marginTop: '20px',
		color: 'black',
	},
	confirmButton: {
		padding: '10px 20px',
		background: '#333',
		color: 'white',
		'&.MuiButtonBase-root': {
			marginTop: '10px',
			color: 'white',
			backgroundColor: colors.purple,
		},
	},
});

const CanDonate: React.FC = () => {
	const [canDonate, setCanDonate] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();

	const { resultMessage, confirmButton } = useStyles();

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

	const handleConfirmClick = () => {
		navigate(`/events/${reference}/confirmation`);
	};

	return (
		<>
			<CardComponent>
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
			</CardComponent>
			<Button className={confirmButton} onClick={handleConfirmClick}>
				Confirm
			</Button>
		</>
	);
};

export default CanDonate;
