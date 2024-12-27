import { Button, CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import colors from '../styles/colors';
import { fetchCanDonate, fetchEventByReference } from '../utils/queries';
import CardComponent from './shared/CardComponent';
import { useTranslation } from 'react-i18next';

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
	const { t }: { t: (key: string) => string } = useTranslation();
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();

	const { resultMessage, confirmButton } = useStyles();

	const {
		data: canDonate,
		isLoading: isLoadingCanDonate,
		isError: hasDonationCheckError,
	} = useQuery('canDonate', fetchCanDonate);

	const {
		data: event,
		isLoading: isLoadingEvent,
		isError,
	} = useQuery(['event', reference], () => fetchEventByReference(reference));

	const handleConfirmClick = () => {
		navigate(`/events/${reference}/confirmation`);
	};

	return (
		<>
			<CardComponent>
				{isLoadingCanDonate ? (
					<CircularProgress />
				) : canDonate === null ? (
					<Typography className={resultMessage}>
						 {t('EventParticipation.notSure')}
					</Typography>
				) : canDonate ? (
					<Typography className={resultMessage}>
					     {t('EventParticipation.can')}
					</Typography>
				) : (
					<Typography className={resultMessage}>
						 {t('EventParticipation.cant')}
					</Typography>
				)}
			</CardComponent>

			<Button className={confirmButton} onClick={handleConfirmClick}>
			    {t('EventParticipation.confirm')}
			</Button>
		</>
	);
};

export default CanDonate;
