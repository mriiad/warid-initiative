import { OpenInNew } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

import { useConfirmPresence, useEvent } from '../../hooks';
import API_CONFIG from '../../utils/apiConfig';

const EventConfirmation: React.FC = () => {
	const { t } = useTranslation();
	const { reference } = useParams<{ reference: string }>();
	const { token } = useAuth();
	const navigate = useNavigate();
	const [isConfirmed, setIsConfirmed] = useState(false);

	const handleNavigate = (ref: string) => () => navigate(`/events/${ref}`);

	const {
		data: eventData,
		isLoading: isEventLoading,
		isError: isEventError,
	} = useEvent(reference || '');
	const confirmPresenceMutation = useConfirmPresence();

	const handleConfirmPresence = (eventId: string) => {
		confirmPresenceMutation.mutate(
			{ eventId, token },
			{
				onSuccess: (response) => {
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
		if (eventData?.data && token) {
			handleConfirmPresence(eventData.data._id);
		}
	}, [eventData, token]);

	if (isEventLoading || confirmPresenceMutation.isPending)
		return <div>{t('events.confirmation.confirming')}</div>;
	if (isConfirmed) return <div>{t('events.confirmation.confirmed')}</div>;

	if (isEventError || confirmPresenceMutation.isError) {
		const error = confirmPresenceMutation.error as any;
		const errorMessage =
			error?.response?.data?.errorMessage ||
			t('events.confirmation.unexpectedError');
		const details = error?.response?.data?.details;
		const errorReference = details?.reference;

		return (
			<div>
				{errorMessage}
				{errorReference && (
					<OpenInNew onClick={handleNavigate(errorReference)} />
				)}
			</div>
		);
	}

	return null;
};

export default EventConfirmation;
