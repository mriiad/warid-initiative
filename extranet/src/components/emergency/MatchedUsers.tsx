import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from '@mui/styles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
	confirmUserInEmergency,
	fetchEmergencyMatchUsers,
} from '../../utils/queries';

interface MatchedUser {
	_id: string;
	phoneNumber: string;
	firstname: string;
	lastname: string;
}

const useStyles = makeStyles({
	root: {
		width: '100%',
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
		height: '200px',
	},
	noResultsIcon: {
		fontSize: '50px',
		marginRight: '10px',
	},
	title: {
		marginBottom: '16px',
		fontWeight: 'bold',
		textAlign: 'center',
		width: '100%',
	},
	table: {
		minWidth: 400,
	},
	actionCell: {
		width: '120px',
	},
	pagination: {
		marginBottom: '64px',
		marginTop: '32px',
		display: 'flex',
		gap: '10px',
	},
	arrowBackIcon: {
		color: '#3B2A82',
		fontSize: '100px',
	},
});

const MatchedUsers = () => {
	const { emergencyId } = useParams<{ emergencyId: string }>();
	const { token } = useAuth();
	const classes = useStyles();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
		'success'
	);
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get('page') || '1', 10);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Track the loading state for each user
	const [loadingUsers, setLoadingUsers] = useState<{ [key: string]: boolean }>(
		{}
	);

	const { data, isLoading, isError } = useQuery({
		queryKey: ['matchedUsers', emergencyId, page],
		queryFn: () => fetchEmergencyMatchUsers(emergencyId, token, page),
		keepPreviousData: true,
	});

	const mutation = useMutation({
		mutationFn: (userId: string) =>
			confirmUserInEmergency(emergencyId!, userId, token),
		onMutate: (userId: string) => {
			// Set loading state for the user being confirmed
			setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['matchedUsers', emergencyId, page],
			});
			setSnackbarMessage('User confirmed successfully!');
			setSnackbarSeverity('success');
			setSnackbarOpen(true);
		},
		onError: () => {
			setSnackbarMessage('Failed to confirm user.');
			setSnackbarSeverity('error');
			setSnackbarOpen(true);
		},
		onSettled: () => {
			// Reset loading state after the mutation is completed
			setLoadingUsers((prev) => {
				const newState = { ...prev };
				Object.keys(newState).forEach((userId) => {
					newState[userId] = false;
				});
				return newState;
			});
		},
	});

	const handleConfirmUser = (userId: string) => {
		mutation.mutate(userId);
	};

	const handleCloseSnackbar = () => {
		setSnackbarOpen(false);
	};

	const handleNextPage = () => {
		if (page < Math.ceil((data?.totalItems || 0) / 1)) {
			setSearchParams({ page: String(page + 1) });
		}
	};

	const handlePrevPage = () => {
		if (page > 1) {
			setSearchParams({ page: String(page - 1) });
		}
	};

	if (isLoading) {
		return (
			<Box className={classes.fallBack}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError || !data) {
		return (
			<Box className={classes.noResultsContainer}>
				<Typography variant='h6' color='error'>
					Failed to load matched users.
				</Typography>
			</Box>
		);
	}
	const matchedUsers: MatchedUser[] = data.matchingUsers;
	const totalPages = Math.ceil(data.totalItems / 10);

	return (
		<div className={classes.root}>
			<Box sx={{ alignSelf: 'flex-start' }}>
				<IconButton onClick={() => navigate('/emergencies')}>
					<ArrowBackIcon className={classes.arrowBackIcon} />
				</IconButton>
			</Box>
			{matchedUsers.length === 0 ? (
				<Box className={classes.noResultsContainer}>
					<SearchOffIcon className={classes.noResultsIcon} color='action' />
					<Typography variant='h6' color='textSecondary'>
						No matched users found.
					</Typography>
				</Box>
			) : (
				<>
					<Typography variant='h5' className={classes.title}>
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
											variant='contained'
											color='primary'
											size='small'
											onClick={() => handleConfirmUser(matched._id)}
											disabled={loadingUsers[matched._id]}
										>
											{loadingUsers[matched._id] ? 'Confirming...' : 'Confirm'}
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

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
				</>
			)}

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={4000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert
					onClose={handleCloseSnackbar}
					severity={snackbarSeverity}
					sx={{ width: '100%' }}
				>
					{snackbarMessage}
				</Alert>
			</Snackbar>
		</div>
	);
};

export default MatchedUsers;
