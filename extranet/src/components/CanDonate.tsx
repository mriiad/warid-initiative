import { Button, CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCanDonate, useEvent } from '../hooks';
import colors from '../styles/colors';
import { formatDate } from '../utils/utils';
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
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();

	const { resultMessage, confirmButton } = useStyles();

	const {
		data: canDonate,
		isLoading: isLoadingCanDonate,
		isError: hasDonationCheckError,
	} = useCanDonate();

	const {
		data: event,
		isLoading: isLoadingEvent,
		isError,
	} = useEvent(reference || '');

	const handleConfirmClick = () => {
		if (canDonate) {
			if (event?.data && !event.data.isGeneric) {
				// For non-generic events, include both the event reference and date
				navigate(
					`/donate?eventRef=${reference}&eventDate=${formatDate(
						event.data.date
					)}`
				);
			} else {
				// For generic events, only include reference
				navigate(`/donate?eventRef=${reference}`);
			}
		} else {
			navigate(`/events/${reference}/confirmation`);
		}
	};

	return (
		<>
			<CardComponent>
				{isLoadingCanDonate ? (
					<CircularProgress />
				) : canDonate === null ? (
					<Typography className={resultMessage}>
						{t('canDonate.unableToDetermine')}
					</Typography>
				) : canDonate ? (
					<Typography className={resultMessage}>
						{t('canDonate.canDonate')}
					</Typography>
				) : (
					<Typography className={resultMessage}>
						{t('canDonate.cannotDonate')}
					</Typography>
				)}
			</CardComponent>

			<Button className={confirmButton} onClick={handleConfirmClick}>
				{t('canDonate.confirm')}
			</Button>
		</>
	);
};

export default CanDonate;
