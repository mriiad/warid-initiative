import { Tune } from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import NoUserFound from './NoUserFound';
import ConfirmationDialog from './shared/ConfirmationDialog';
import SnackbarComponent from './shared/SnackbarComponent';
import UserCard from './UserCard';
import UserFilter from './UserFilter';

const UsersContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 96px;
	padding-bottom: 128px;
`;

const FilterHeader = styled.div`
	width: 100%;
	max-width: 1200px;
	margin: 0 auto 24px auto;
	padding: 0 20px;
`;

const FilterBar = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: linear-gradient(135deg, ${colors.rose}15, ${colors.purple}15);
	border: 1px solid ${colors.rose}30;
	border-radius: 16px;
	padding: 16px 24px;
	margin-bottom: 16px;
	box-shadow: 0 4px 20px rgba(255, 48, 103, 0.1);
`;

const FilterButton = styled(Button)`
	background: linear-gradient(
		135deg,
		${colors.rose},
		${colors.purple}
	) !important;
	color: white !important;
	border-radius: 12px !important;
	padding: 12px 24px !important;
	font-weight: 600 !important;
	font-size: 14px !important;
	text-transform: none !important;
	box-shadow: 0 4px 15px rgba(255, 48, 103, 0.3) !important;
	transition: all 0.3s ease !important;

	&:hover {
		transform: translateY(-2px) !important;
		box-shadow: 0 8px 25px rgba(255, 48, 103, 0.4) !important;
	}

	&.MuiButton-root {
		min-height: 48px;
	}
`;

const ActiveFilters = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
`;

interface Filters {
	username?: string;
	firstname?: string;
	lastname?: string;
	email?: string;
	phoneNumber?: string;
	gender?: string;
	bloodGroup?: string;
	age?: [number, number];
	availableForDonation?: boolean;
	isAdmin?: boolean;
}

const UsersComponent: React.FC = () => {
	const navigate = useNavigate();
	const { bar, button, form } = authStyles();
	const { textButton, subTitle } = mainStyles();
	const [users, setUsers] = useState<any[]>([]);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [noUsersFound, setNoUsersFound] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	// Confirmation dialog state
	const [confirmationDialog, setConfirmationDialog] = useState({
		open: false,
		title: '',
		message: '',
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		onConfirm: () => {},
		warning: false,
	});

	const page = parseInt(searchParams.get('page') || '1', 10);
	const username = searchParams.get('username') || '';
	const firstname = searchParams.get('firstname') || '';
	const lastname = searchParams.get('lastname') || '';
	const minAge = parseInt(searchParams.get('minAge') || '', 10);
	const maxAge = parseInt(searchParams.get('maxAge') || '', 10);
	const availableForDonation =
		searchParams.get('availableForDonation') === 'true';
	const bloodGroup = searchParams.get('bloodGroup') || '';

	const [message, setMessage] = useState<string | null>(null);

	const { token, isAdmin } = useAuth();

	// Get active filters for display
	const getActiveFilters = () => {
		const activeFilters = [];
		if (username) activeFilters.push({ key: 'username', value: username });
		if (firstname) activeFilters.push({ key: 'firstname', value: firstname });
		if (lastname) activeFilters.push({ key: 'lastname', value: lastname });
		if (bloodGroup)
			activeFilters.push({ key: 'bloodGroup', value: bloodGroup });
		if (minAge || maxAge)
			activeFilters.push({
				key: 'age',
				value: `${minAge || 18}-${maxAge || 65}`,
			});
		if (availableForDonation)
			activeFilters.push({ key: 'availableForDonation', value: 'Yes' });
		return activeFilters;
	};

	// Remove a specific filter
	const removeFilter = (filterKey: string) => {
		const newParams = new URLSearchParams(searchParams);
		switch (filterKey) {
			case 'username':
				newParams.delete('username');
				break;
			case 'firstname':
				newParams.delete('firstname');
				break;
			case 'lastname':
				newParams.delete('lastname');
				break;
			case 'bloodGroup':
				newParams.delete('bloodGroup');
				break;
			case 'age':
				newParams.delete('minAge');
				newParams.delete('maxAge');
				break;
			case 'availableForDonation':
				newParams.delete('availableForDonation');
				break;
		}
		newParams.set('page', '1');
		setSearchParams(newParams);
		handleFilterApply(newParams, 1);
	};

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setIsLoading(true);
				setNoUsersFound(false);
				const response = await axios.get(
					`http://localhost:3000/api/users?page=${page}`
				);
				setUsers(response.data.users);
				setTotalPages(Math.ceil(response.data.totalItems / 10));
			} catch (error) {
				if (error.response && error.response.status === 404) {
					setNoUsersFound(true);
				} else {
					console.error('Error fetching users', error);
				}
			} finally {
				setIsLoading(false);
			}
		};

		if (!searchParams.toString()) {
			fetchUsers();
		} else {
			handleFilterApply(searchParams, page);
		}
		navigate(`/users?${searchParams.toString()}`);
	}, [page, searchParams]);

	const handleFilterApply = async (
		filters: URLSearchParams,
		currentPage: number = 1
	) => {
		console.log(
			'🚀 handleFilterApply called with filters:',
			Object.fromEntries(filters),
			'page:',
			currentPage
		);
		try {
			setIsLoading(true);
			setNoUsersFound(false);
			console.log('📡 Making API call to /api/searchUsers...');
			const response = await axios.post(
				'http://localhost:3000/api/searchUsers',
				{ ...Object.fromEntries(filters), page: currentPage, perPage: 10 }
			);
			console.log('✅ API response received:', response.data);
			setUsers(response.data.users || []);
			setTotalPages(Math.ceil(response.data.totalItems / 10));
			filters.set('page', currentPage.toString());
			setSearchParams(filters);
			console.log('📊 State updated with filtered results');
		} catch (error) {
			console.error('❌ Error applying filters:', error);
			if (error.response && error.response.status === 404) {
				setNoUsersFound(true);
				console.log('📭 No users found (404)');
			} else {
				console.error('🔥 Unexpected error:', error);
			}
		} finally {
			setIsLoading(false);
			console.log('🔄 Loading state set to false');
		}
	};

	const handleFilterChange = (newFilters: Filters) => {
		console.log('🎯 handleFilterChange called with filters:', newFilters);
		const params = new URLSearchParams();

		// Handle empty filters (reset case)
		if (Object.keys(newFilters).length === 0) {
			console.log('🔄 Empty filters detected (reset case)');
			handleFilterApply(params, 1);
			return;
		}

		// Handle actual filters
		console.log('🔧 Processing actual filters...');
		if (newFilters.username) params.set('username', newFilters.username);
		if (newFilters.firstname) params.set('firstname', newFilters.firstname);
		if (newFilters.lastname) params.set('lastname', newFilters.lastname);
		if (newFilters.email) params.set('email', newFilters.email);
		if (newFilters.phoneNumber)
			params.set('phoneNumber', newFilters.phoneNumber);
		if (newFilters.gender) params.set('gender', newFilters.gender);
		if (newFilters.bloodGroup) params.set('bloodGroup', newFilters.bloodGroup);
		if (newFilters.age && newFilters.age.length === 2) {
			params.set('minAge', newFilters.age[0].toString());
			params.set('maxAge', newFilters.age[1].toString());
		}
		// Only include donation filter when explicitly enabled
		if (newFilters.availableForDonation === true) {
			params.set('availableForDonation', 'true');
		}
		// Only include isAdmin when explicitly enabled
		if (newFilters.isAdmin === true) {
			params.set('isAdmin', 'true');
		}

		console.log('📤 Final params for API call:', Object.fromEntries(params));
		handleFilterApply(params, 1);
	};

	const handleUpdate = (userId: string) => {
		console.log(`Updating user with ID ${userId}`);
		navigate(`/users/update/${userId}`);
	};

	const handleDelete = async (userId: string, username: string) => {
		console.log(`Deleting user with name ${username}`);
		setConfirmationDialog({
			open: true,
			title: 'Delete User',
			message: `Are you sure you want to delete the user "${username}"? This action cannot be undone.`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
			onConfirm: async () => {
				try {
					setIsLoading(true);
					setConfirmationDialog({ ...confirmationDialog, open: false });

					const response = await axios.delete(
						`http://localhost:3000/api/deleteUser/${username}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (response.status === 200) {
						setUsers(
							(prevUsers) =>
								prevUsers?.filter((user) => user._id !== userId) || []
						);
						setMessage('User deleted successfully');
					}
				} catch (error) {
					console.error('Error deleting user:', error);
					setMessage(
						`Error deleting user: ${
							error.response?.data?.message || error.message
						}`
					);
				} finally {
					setIsLoading(false);
				}
			},
			warning: true,
		});
	};
	const handleCloseSnackbar = () => {
		setMessage(null);
	};

	const handleCloseConfirmationDialog = () => {
		setConfirmationDialog({ ...confirmationDialog, open: false });
	};

	const handleMakeAdmin = async (userId: string, username: string) => {
		console.log(`Making user with ID ${userId} as admin`);
		setConfirmationDialog({
			open: true,
			title: 'Make User Admin',
			message: `Are you sure you want to make "${username}" an admin? This will give them full administrative privileges.`,
			confirmText: 'Make Admin',
			cancelText: 'Cancel',
			onConfirm: async () => {
				try {
					setIsLoading(true);
					setConfirmationDialog({ ...confirmationDialog, open: false });

					const response = await axios.patch(
						`http://localhost:3000/api/users/${userId}/admin`,
						{},
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					if (response.status === 200) {
						// Update the user in the list to reflect admin status
						setUsers(
							(prevUsers) =>
								prevUsers?.map((user) =>
									user._id === userId ? { ...user, isAdmin: true } : user
								) || []
						);
						setMessage(`${username} is now an admin`);
					}
				} catch (error) {
					console.error('Error making user admin:', error);
					setMessage(
						`Error making user admin: ${
							error.response?.data?.message || error.message
						}`
					);
				} finally {
					setIsLoading(false);
				}
			},
			warning: false,
		});
	};

	return (
		<>
			{isAdmin && (
				<FilterHeader>
					<FilterBar>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Typography
								variant='h6'
								sx={{ color: colors.purple, fontWeight: 'bold' }}
							>
								Users List
							</Typography>
							<Typography
								variant='body2'
								sx={{ color: colors.purple, opacity: 0.7 }}
							>
								{users.length} users found
							</Typography>
						</Box>
						<FilterButton
							variant='contained'
							startIcon={<Tune />}
							onClick={() => setIsFilterOpen(true)}
						>
							Advanced Filters
						</FilterButton>
					</FilterBar>

					{(() => {
						const activeFilters = getActiveFilters();
						return (
							activeFilters.length > 0 && (
								<ActiveFilters>
									<Typography
										variant='body2'
										sx={{ color: colors.purple, mr: 1 }}
									>
										Active filters:
									</Typography>
									{activeFilters.map((filter) => (
										<Chip
											key={filter.key}
											label={`${filter.key}: ${filter.value}`}
											onDelete={() => removeFilter(filter.key)}
											size='small'
											sx={{
												backgroundColor: colors.rose + '20',
												color: colors.purple,
												fontWeight: '500',
												'& .MuiChip-deleteIcon': {
													color: colors.rose,
													'&:hover': {
														color: colors.purple,
													},
												},
											}}
										/>
									))}
									<Button
										size='small'
										onClick={() => {
											setSearchParams(new URLSearchParams());
											handleFilterApply(new URLSearchParams(), 1);
										}}
										sx={{
											color: colors.rose,
											textTransform: 'none',
											fontSize: '12px',
											'&:hover': {
												color: colors.purple,
											},
										}}
									>
										Clear All
									</Button>
								</ActiveFilters>
							)
						);
					})()}
				</FilterHeader>
			)}
			{isAdmin && (
				<UserFilter
					open={isFilterOpen}
					onClose={() => setIsFilterOpen(false)}
					onApply={handleFilterChange}
				/>
			)}
			<UsersContainer>
				{isLoading ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							minHeight: '100vh',
							paddingTop: '96px',
							paddingBottom: '128px',
						}}
					>
						<CircularProgress />
					</div>
				) : noUsersFound ? (
					<NoUserFound />
				) : (
					users.map((user, index) => (
						<UserCard
							key={user._id}
							user={user}
							onUpdate={handleUpdate}
							onDelete={(userId) => handleDelete(userId, user.username)}
							onMakeAdmin={(userId) => handleMakeAdmin(userId, user.username)}
							animationDelay={`${index * 0.2}s`}
							isAdmin={isAdmin}
						/>
					))
				)}
			</UsersContainer>
			{!isLoading && !noUsersFound && totalPages > 1 && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '64px',
					}}
				>
					<Button
						disabled={page === 1}
						onClick={() =>
							setSearchParams({
								...Object.fromEntries(searchParams),
								page: (page - 1).toString(),
							})
						}
					>
						السابق
					</Button>
					<Button
						disabled={page >= totalPages}
						onClick={() =>
							setSearchParams({
								...Object.fromEntries(searchParams),
								page: (page + 1).toString(),
							})
						}
					>
						التالي
					</Button>
				</div>
			)}
			{message && (
				<SnackbarComponent
					open={!!message}
					message={message}
					handleClose={handleCloseSnackbar}
				/>
			)}
			<ConfirmationDialog
				open={confirmationDialog.open}
				title={confirmationDialog.title}
				message={confirmationDialog.message}
				confirmText={confirmationDialog.confirmText}
				cancelText={confirmationDialog.cancelText}
				onConfirm={confirmationDialog.onConfirm}
				onCancel={handleCloseConfirmationDialog}
				warning={confirmationDialog.warning}
			/>
		</>
	);
};

export default UsersComponent;
