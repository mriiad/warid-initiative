import { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { confirmEventPresence } from '../utils/queries';

interface MutationResponse {
	message: string;
}

const EventConfirmation: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token } = useAuth();
	const [isConfirmed, setIsConfirmed] = useState(false);
	const navigate = useNavigate();

	const mutation = useMutation<MutationResponse>(
		() => confirmEventPresence(reference, token),
		{
			onSuccess: () => {
				setIsConfirmed(true);
				setTimeout(() => {
					navigate('/events');
				}, 3000);
			},
			retry: false,
		}
	);

	useEffect(() => {
		mutation.mutate();
	}, []);

	return (
		<>
			{mutation.isLoading ? (
				<div>Confirming your presence...</div>
			) : isConfirmed ? (
				<div>Successfully confirmed!</div>
			) : mutation.isError ? (
				<div>An error occurred, please try again later.</div>
			) : null}
		</>
	);
};

export default EventConfirmation;
