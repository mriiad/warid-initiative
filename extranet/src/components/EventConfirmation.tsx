import { OpenInNew } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { MutationErrorWithData, useTypedMutation } from '../hook/useTypedHook';
import { confirmEventPresence } from '../utils/queries';

interface SuccessfulResponse {
	message: string;
}

const EventConfirmation: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token } = useAuth();
	const navigate = useNavigate();
	const [isConfirmed, setIsConfirmed] = useState(false);

	const handleNavigate = (ref: string) => () => navigate(`/events/${ref}`);

	const { mutate, isLoading, isError, error, data } = useTypedMutation<
		SuccessfulResponse,
		MutationErrorWithData
	>(() => confirmEventPresence(reference, token), {
		onSuccess: ({ message }) => {
			setIsConfirmed(true);
			setTimeout(() => navigate('/events'), 3000);
		},
		onError: (error) => {
			console.error('Error:', error);
		},
		retry: false,
	});

	useEffect(() => {
		mutate();
	}, [reference, token, mutate]);

	if (isLoading) return <div>Confirming your presence...</div>;
	if (isConfirmed) return <div>{data?.message}</div>;

	if (isError && error?.data) {
		const { errorMessage, details } = error.data;
		const reference = details?.reference;

		return (
			<div>
				{errorMessage}
				{reference && <OpenInNew onClick={handleNavigate(reference)} />}
			</div>
		);
	}

	return null;
};

export default EventConfirmation;
