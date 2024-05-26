import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { authStyles, mainStyles } from '../styles/mainStyles';
import NoUserFound from './NoUserFound';
import UserCard from './UserCard';
import UserFilter from './UserFilter';

const UsersContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

interface Filters {
	username?: string;
	firstname?: string;
	lastname?: string;
	age?: [number, number];
	availableForDonation?: boolean;
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

	const page = parseInt(searchParams.get('page') || '1', 10);
	const username = searchParams.get('username') || '';
	const firstname = searchParams.get('firstname') || '';
	const lastname = searchParams.get('lastname') || '';
	const minAge = parseInt(searchParams.get('minAge') || '', 10);
	const maxAge = parseInt(searchParams.get('maxAge') || '', 10);
	const availableForDonation =
		searchParams.get('availableForDonation') === 'true';

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
		if (newFilters.age && newFilters.age.length === 2) {
			params.set('minAge', newFilters.age[0].toString());
			params.set('maxAge', newFilters.age[1].toString());
		}
		if (newFilters.availableForDonation !== undefined) {
			params.set(
				'availableForDonation',
				newFilters.availableForDonation.toString()
			);
		}
		setSearchParams(params);
		handleFilterApply(params, 1);
	};

	const handleUpdate = (userId: string) => {
		console.log(`Updating user with ID ${userId}`);
	};

	const handleDelete = (userId: string) => {
		console.log(`Deleting user with ID ${userId}`);
	};

	const handleMakeAdmin = (userId: string) => {
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
				onApply={handleFilterChange}
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
				) : noUsersFound ? (
					<NoUserFound />
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
						Previous
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
						Next
					</Button>
				</div>
			)}
		</>
	);
};

export default UsersComponent;
