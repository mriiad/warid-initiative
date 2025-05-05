import { useEffect, useState } from 'react';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Chip,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { fetchEmergencyMatchUsers, confirmUserInEmergency } from '../../utils/queries';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface MatchedUser {
    _id: string;
    phoneNumber: string;
    firstname: string;
    lastname: string;
}

const useStyles = makeStyles({
    root: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    fallBack: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
    },
    noResultsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px'
    },
    noResultsIcon: {
        fontSize: '50px',
        marginRight: '10px'
    },
    title: {
        marginBottom: '16px',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%'
    },
    table: {
        minWidth: 400
    },
    actionCell: {
        width: '120px'
    },
    pagination: {
        marginBottom: '64px',
        marginTop: '32px',
        display: 'flex',
        gap: '10px',
    },
});

const MatchedUsers = () => {
    const { emergencyId } = useParams<{ emergencyId: string }>();
    const { token } = useAuth();
    const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const classes = useStyles();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [totalPages, setTotalPages] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchEmergencyMatchUsers(emergencyId, token, page);
                setMatchedUsers(data.matchingUsers);
                setTotalPages(Math.ceil(data.totalItems / 1));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [emergencyId, token, page]);

    const handleConfirmUser = async (userId: string) => {
        try {
            await confirmUserInEmergency(emergencyId!, userId, token);
            setMatchedUsers(prevUsers =>
                prevUsers.filter(matched =>
                    matched._id !== userId
                )
            );
            setSnackbarMessage("User confirmed successfully!");
            setSnackbarOpen(true);
            setSnackbarSeverity('success');
        } catch (error) {
            console.error(error);
            setSnackbarMessage("Failed to confirm user.");
            setSnackbarOpen(true);
            setSnackbarSeverity('error');

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

    return (
        <div className={classes.root}>
            {loading ? (
                <Box className={classes.fallBack}>
                    <CircularProgress />
                </Box>
            ) : matchedUsers.length === 0 ? (
                <Box className={classes.noResultsContainer}>
                    <SearchOffIcon className={classes.noResultsIcon} color="action" />
                    <Typography variant="h6" color="textSecondary">
                        No matched users found.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Typography variant="h5" className={classes.title}>
                        Matched Users
                    </Typography>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell className={classes.actionCell}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {matchedUsers.map((matched) => (
                                <TableRow key={matched._id}>
                                    <TableCell>{matched.firstname}</TableCell>
                                    <TableCell>{matched.lastname}</TableCell>
                                    <TableCell>{matched.phoneNumber}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleConfirmUser(matched._id)}
                                        >
                                            Confirm
                                        </Button>

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            )}
            <div className={classes.pagination}>
                <Button disabled={page === 1 || loading} onClick={handlePrevPage}>
                    Previous
                </Button>
                <Button disabled={page >= totalPages || loading} onClick={handleNextPage}>
                    Next
                </Button>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </div>

    );
};

export default MatchedUsers;
