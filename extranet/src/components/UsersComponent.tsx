import { useEffect, useState } from 'react';
import { Button, CircularProgress, Snackbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import styled from 'styled-components';
import { User } from '../data/User';
import UserCard from './UserCard';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from '../utils/queries';
import { useAuth } from '../auth/AuthContext';

const UsersContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const useStyles = makeStyles({
	usersList: {
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
	},
});

const UsersComponent = () => {

	const navigate = useNavigate();

	const { usersList, fallBack, pagination } = useStyles();
	const [users, setUsers] = useState<User[] | null>([]);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	const [message, setMessage] = useState<string | null>(null);

    const { token } = useAuth();


	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`http://localhost:3000/api/users?page=${page}`
				);
				setUsers(response.data.users);
				setTotalPages(Math.ceil(response.data.totalItems / 10));
			} catch (error) {
				console.error('Error fetching users', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers();
		navigate(`/users?page=${page}`); // Log the URL
	}, [page, navigate]);

	const handleUpdate = (userId: string) => {
		// To handle 
		console.log(`Updating user with ID ${userId}`);
	};

	const handleDelete = async(username: string) => {
		// To handle 
		console.log(`Deleting user with name ${username}`);
		const confirmDelete = window.confirm(`Are you sure you want to delete the user ${username}?`);
		if (!confirmDelete) return;

		try {
			setIsLoading(true);
			await deleteUser(username, token);
			setUsers((prevUsers) => prevUsers?.filter((user) => user.username !== username) || []);
			setMessage("User deleted successfully");
		} catch (error) {
			setMessage(`Error deleting user: ${error.message}`);
		} finally {
			setIsLoading(false);
		}

	};
	const handleCloseSnackbar = () => {
		setMessage(null);
	};


	const handleMakeAdmin = (userId: string) => {
		// To handle 
		console.log(`Making user with ID ${userId} as admin`);
	};

	return (
		<UsersContainer className={usersList}>
			{isLoading ? (
				<div className={fallBack}>
					<CircularProgress />
				</div>
			) : (
				<>
					{users.map((user, index) => (
						<UserCard
							key={user._id}
							user={user}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
							onMakeAdmin={handleMakeAdmin}
							animationDelay={`${index * 0.2}s`}
						/>
					))}
					<div className={pagination}>

						<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
							السابق
						</Button>
						<Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
							التالي
						</Button>

					</div>
                    {message && (
						<Snackbar
							open={Boolean(message)}
							autoHideDuration={4000}
							onClose={handleCloseSnackbar}
							message={message}
						/>
					)}

				</>
			)}
		</UsersContainer>


	);

};

export default UsersComponent;
