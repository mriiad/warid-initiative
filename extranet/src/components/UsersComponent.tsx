import { Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authStyles, mainStyles } from '../styles/mainStyles';
import UserCard from './UserCard';
import UserFilter from './UserFilter';

const UsersContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const UsersComponent = () => {
	const navigate = useNavigate();
	const { bar, button, form } = authStyles();
	const { textButton, subTitle } = mainStyles();
	const [users, setUsers] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState({});

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
		navigate(`/users?page=${page}`);
	}, [page, navigate]);

	const handleFilterApply = async (newFilters) => {
		setFilters(newFilters);
		try {
			setIsLoading(true);
			const response = await axios.post(
				'http://localhost:3000/api/searchUsers',
				newFilters
			);
			setUsers(response.data.users || []);
			setTotalPages(1);
		} catch (error) {
			console.error('Error applying filters', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdate = (userId) => {
		console.log(`Updating user with ID ${userId}`);
	};

	const handleDelete = (userId) => {
		console.log(`Deleting user with ID ${userId}`);
	};

	const handleMakeAdmin = (userId) => {
		console.log(`Making user with ID ${userId} as admin`);
	};

	return (
		<>
			<Button
				variant='contained'
				color='primary'
				className={button}
				onClick={() => setIsFilterOpen(true)}
				style={{ position: 'fixed', bottom: 100, right: 20, zIndex: 1000 }}
			>
				Filter
			</Button>
			<UserFilter
				open={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				onApply={handleFilterApply}
			/>
			<UsersContainer>
				{isLoading ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							minHeight: '100vh',
						}}
					>
						<CircularProgress />
					</div>
				) : (
					users.map((user, index) => (
						<UserCard
							key={user._id}
							user={user}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
							onMakeAdmin={handleMakeAdmin}
							animationDelay={`${index * 0.2}s`}
						/>
					))
				)}
			</UsersContainer>
			{!isLoading && users.length === 0 && (
				<Typography variant='h6'>No users found.</Typography>
			)}
			{!isLoading && totalPages > 1 && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '64px',
					}}
				>
					<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
						Previous
					</Button>
					<Button
						disabled={page >= totalPages}
						onClick={() => setPage(page + 1)}
					>
						Next
					</Button>
				</div>
			)}
		</>
	);
};

export default UsersComponent;
