import { useEffect, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import styled from 'styled-components';
import { User } from '../data/User';
import UserCard from './UserCard';
import { useNavigate } from 'react-router-dom';

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

	const handleDelete = (userId: string) => {
		// To handle 
		console.log(`Deleting user with ID ${userId}`);
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
							Previous
						</Button>
						<Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
							Next
						</Button>

					</div>

				</>
			)}
		</UsersContainer>


	);

};

export default UsersComponent;
