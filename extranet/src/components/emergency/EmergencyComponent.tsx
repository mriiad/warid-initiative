import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Emergency } from '../../data/Emergency';
import EmergencyCard from './EmergencyCard';
import { fetchUnconfirmedEmergencies, confirmEmergency } from '../../utils/queries';
import { useAuth } from '../../auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';

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
    } = useQuery(
        ['unconfirmedEmergencies', page],
        () => fetchUnconfirmedEmergencies(page, token),
        {
            enabled: !!token,
            keepPreviousData: true,
        }
    );

    // Update emergencies and totalPages when data arrives
    useEffect(() => {
        if (emergenciesResponse) {
            setTotalPages(Math.ceil(emergenciesResponse.totalItems / 10));
        }
    }, [emergenciesResponse]);

    const emergencies: Emergency[] = emergenciesResponse?.emergencies || [];

    const mutation = useMutation(
        (emergencyId: string) => confirmEmergency(emergencyId, token),
        {
            onSuccess: (_, emergencyId) => {
                // Remove confirmed emergency from local cache
                queryClient.setQueryData<EmergenciesResponse>(['unconfirmedEmergencies', page], oldData => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        emergencies: oldData.emergencies.filter(e => e._id !== emergencyId),
                        totalItems: oldData.totalItems - 1,
                    };
                });
                setSnackbarMessage('Emergency confirmed successfully!');
                setSnackbarOpen(true);
            },
            onError: (error) => {
                console.error('Error confirming emergency:', error);
                setSnackbarMessage('Error confirming emergency. Please try again.');
                setSnackbarOpen(true);
            },
        }
    );

    const handleConfirmEmergency = (emergencyId: string) => {
        mutation.mutate(emergencyId);
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
            {(isLoading || mutation.isLoading) ? (
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
                            isConfirming={mutation.isLoading}
                        />
                    ))}
                </div>
            )}

            <div className={classes.pagination}>
                <Button disabled={page === 1 || isLoading} onClick={handlePrevPage}>
                    Previous
                </Button>
                <Button disabled={page >= totalPages || isLoading} onClick={handleNextPage}>
                    Next
                </Button>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </EmergenciesContainer>
    );
};

export default EmergencyComponent;
