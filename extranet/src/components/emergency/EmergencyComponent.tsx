import { Button, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Emergency } from '../../data/Emergency';
import EmergencyCard from './EmergencyCard';
import { fetchUnconfirmedEmergencies, confirmEmergency } from '../../utils/queries';
import { useAuth } from '../../auth/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSearchParams } from 'react-router-dom';

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

const EmergencyComponent = () => {
    const classes = useStyles();
    const [emergencies, setEmergencies] = useState<Emergency[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);

    const handleConfirmEmergency = async (emergencyId: string) => {
        try {
            setIsLoading(true);
            await confirmEmergency(emergencyId, token);
            setEmergencies(prev => prev.filter(e => e._id !== emergencyId));
            setSnackbarMessage("Emergency confirmed successfully!");
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error confirming emergency:', error);
            setSnackbarMessage("Error confirming emergency. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setIsLoading(false);
        }
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
    useEffect(() => {
        const fetchEmergencies = async () => {
            try {
                setIsLoading(true);
                const response = await fetchUnconfirmedEmergencies(page, token);
                setEmergencies(response?.emergencies || []);
                setTotalPages(Math.ceil(response.totalItems / 8));
            } catch (error) {
                console.error('Error fetching emergencies', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmergencies();
    }, [page, token]);

    return (
        <EmergenciesContainer>
            {isLoading ? (
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
