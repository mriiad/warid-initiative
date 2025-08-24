import { Button, CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import colors from '../styles/colors';
import { fetchCanDonate, fetchEventByReference } from '../utils/queries';
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
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();

	const { resultMessage, confirmButton } = useStyles();

	const {
		data: canDonate,
		isLoading: isLoadingCanDonate,
		isError: hasDonationCheckError,
	} = useQuery({
		queryKey: ['canDonate'],
		queryFn: fetchCanDonate,
	});

	const {
		data: event,
		isLoading: isLoadingEvent,
		isError,
	} = useQuery({
		queryKey: ['event', reference],
		queryFn: () => fetchEventByReference(reference),
	});

	const handleConfirmClick = () => {
		if (canDonate) {
			if (event && !event.isGeneric) {
				// For non-generic events, include both the event reference and date
				navigate(
					`/donate?eventRef=${reference}&eventDate=${formatDate(event.date)}`
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
						غير قادر على تحديد الأهلية.
					</Typography>
				) : canDonate ? (
					<Typography className={resultMessage}>
						بناءً على تاريخ تبرعك الأخير، يُسمح لك بالتبرع.
					</Typography>
				) : (
					<Typography className={resultMessage}>
						عذرًا، لا يُسمح لك بالتبرع.
					</Typography>
				)}
			</CardComponent>

			<Button className={confirmButton} onClick={handleConfirmClick}>
				تأكيد
			</Button>
		</>
	);
};

export default CanDonate;
