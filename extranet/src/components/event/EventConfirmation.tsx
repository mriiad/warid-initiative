import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useConfirmPresence, useEvent } from '../../hooks';
import { flowRedesignStyles } from '../../styles/flowRedesign';
import API_CONFIG from '../../utils/apiConfig';

const EventConfirmation: React.FC = () => {
	const { t } = useTranslation();
	const { reference } = useParams<{ reference: string }>();
	const { token } = useAuth();
	const navigate = useNavigate();
	const [isConfirmed, setIsConfirmed] = useState(false);

	const { flowCenter, flowIconCircle, flowTitle } = flowRedesignStyles();

	const handleNavigate = (ref: string) => () => navigate(`/events/${ref}`);

	const { data: eventData, isLoading: isEventLoading, isError: isEventError } = useEvent(
		reference || ''
	);
	const confirmPresenceMutation = useConfirmPresence();

	const handleConfirmPresence = (eventId: string) => {
		confirmPresenceMutation.mutate(
			{ eventId, token },
			{
				onSuccess: () => {
					setIsConfirmed(true);
					setTimeout(() => navigate('/events'), API_CONFIG.ui.redirectDelay);
				},
				onError: (error) => {
					console.error('Error:', error);
				},
			}
		);
	};

	useEffect(() => {
		// GET /api/events/:reference responds with `{ message, event }`, so the
		// event's own fields live at `eventData.data.event` -- reading
		// `eventData.data._id` sent eventId: undefined to the backend.
		if (eventData?.data?.event && token) {
			handleConfirmPresence(eventData.data.event._id);
		}
	}, [eventData, token]);

	if (isEventLoading || confirmPresenceMutation.isPending) {
		return (
			<div className={flowCenter}>
				<CircularProgress />
				<Typography className={flowTitle}>{t('events.confirmation.confirming')}</Typography>
			</div>
		);
	}

	if (isConfirmed) {
		return (
			<div className={flowCenter}>
				<div className={flowIconCircle} style={{ backgroundColor: '#DCEFC9', color: '#5C8A2B' }}>
					<CheckCircleIcon fontSize='large' />
				</div>
				<Typography className={flowTitle}>{t('events.confirmation.confirmed')}</Typography>
			</div>
		);
	}

	if (isEventError || confirmPresenceMutation.isError) {
		const error = confirmPresenceMutation.error as any;
		const errorMessage =
			error?.response?.data?.message || t('events.confirmation.unexpectedError');
		const details = error?.response?.data?.details;
		const errorReference = details?.reference;

		return (
			<div className={flowCenter}>
				<div className={flowIconCircle} style={{ backgroundColor: '#FBE4EA', color: '#C56D86' }}>
					<ErrorOutlineIcon fontSize='large' />
				</div>
				<Typography className={flowTitle}>{errorMessage}</Typography>
				{errorReference && (
					<IconButton aria-label={t('admin.viewDetails')} onClick={handleNavigate(errorReference)}>
						<OpenInNewIcon />
					</IconButton>
				)}
			</div>
		);
	}

	return null;
};

export default EventConfirmation;
