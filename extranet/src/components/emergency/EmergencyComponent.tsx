import { Alert, Button, CircularProgress, Snackbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../auth/AuthContext';
import { Emergency } from '../../data/Emergency';
import { useConfirmEmergency, useUnconfirmedEmergencies } from '../../hooks';
import API_CONFIG from '../../utils/apiConfig';
import EmergencyCard from './EmergencyCard';

const EmergenciesContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const useStyles = makeStyles({
	emergenciesList: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '20px',
		justifyContent: 'center',
	},
	fallBack: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
	pagination: {
		marginBottom: '64px',
		marginTop: '32px',
		display: 'flex',
		gap: '10px',
	},
});
interface EmergenciesResponse {
	emergencies: Emergency[];
	totalItems: number;
}

const EmergencyComponent = () => {
	const classes = useStyles();
	const { token } = useAuth();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get('page') || '1', 10);
	const queryClient = useQueryClient();

	const [totalPages, setTotalPages] = useState(0);

	const {
		data: emergenciesResponse,
		isLoading,
		error,
	} = useUnconfirmedEmergencies(page);

	useEffect(() => {
		if (emergenciesResponse?.data) {
			setTotalPages(Math.ceil(emergenciesResponse.data.totalItems / 10));
		}
	}, [emergenciesResponse]);

	const emergencies: Emergency[] = emergenciesResponse?.data?.emergencies || [];

	const mutation = useConfirmEmergency();

	const handleConfirmEmergency = (emergencyId: string) => {
		mutation.mutate(emergencyId, {
			onSuccess: () => {
				setSnackbarMessage('Emergency confirmed successfully!');
				setSnackbarOpen(true);
			},
			onError: (error) => {
				setSnackbarMessage('Error confirming emergency. Please try again.');
				setSnackbarOpen(true);
			},
		});
	};

	const handleCloseSnackbar = () => {
		setSnackbarOpen(false);
	};

	const handleNextPage = () => {
		if (page < totalPages) {
			setSearchParams({ page: String(page + 1) });
		}
	};

	const handlePrevPage = () => {
		if (page > 1) {
			setSearchParams({ page: String(page - 1) });
		}
	};

	return (
		<EmergenciesContainer>
			{isLoading || mutation.isPending ? (
				<div className={classes.fallBack}>
					<CircularProgress />
				</div>
			) : (
				<div className={classes.emergenciesList}>
					{emergencies.map((emergency, index) => (
						<EmergencyCard
							key={emergency._id}
							emergency={emergency}
							animationDelay={`${index * 0.2}s`}
							onConfirm={() => handleConfirmEmergency(emergency._id)}
							isConfirming={
								mutation.isPending && mutation.variables === emergency._id
							}
						/>
					))}
				</div>
			)}

			<div className={classes.pagination}>
				<Button disabled={page === 1 || isLoading} onClick={handlePrevPage}>
					Previous
				</Button>
				<Button
					disabled={page >= totalPages || isLoading}
					onClick={handleNextPage}
				>
					Next
				</Button>
			</div>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={API_CONFIG.ui.snackbarDuration}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity='success'
					sx={{ width: '100%' }}
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</EmergenciesContainer>
	);
};

export default EmergencyComponent;
