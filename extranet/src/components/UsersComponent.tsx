import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';
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
		try {
			setIsLoading(true);
			setNoUsersFound(false);
			const response = await axios.post(
				'http://localhost:3000/api/searchUsers',
				{ ...Object.fromEntries(filters), page: currentPage, perPage: 10 }
			);
			setUsers(response.data.users || []);
			setTotalPages(Math.ceil(response.data.totalItems / 10));
			filters.set('page', currentPage.toString());
			setSearchParams(filters);
		} catch (error) {
			if (error.response && error.response.status === 404) {
				setNoUsersFound(true);
			} else {
				console.error('Error applying filters', error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleFilterChange = (newFilters: Filters) => {
		const params = new URLSearchParams();
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
		setSearchParams(params);
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
				<Button
					variant='contained'
					color='primary'
					className={button}
					onClick={() => setIsFilterOpen(true)}
					style={{ position: 'fixed', bottom: 100, right: 20, zIndex: 1000 }}
				>
					Filter
				</Button>
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
