import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PeopleIcon from '@mui/icons-material/People';
import TuneIcon from '@mui/icons-material/Tune';
import { Chip, CircularProgress, IconButton, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RedesignBottomNav from './shared/RedesignBottomNav';
import { usersListRedesignStyles } from '../styles/usersListRedesign';
import NoUserFound from './NoUserFound';
import UserFilter from './UserFilter';

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
	const { t } = useTranslation();
	const navigate = useNavigate();
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
	const bloodGroup = searchParams.get('bloodGroup') || '';

	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		content,
		hero,
		heroIcon,
		heroTitle,
		heroSubtitle,
		heroCount,
		heroCountLabel,
		userRow,
		userAvatar,
		userName,
		userMeta,
		emptyState,
		paginationRow,
	} = usersListRedesignStyles();

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
			activeFilters.push({ key: 'availableForDonation', value: t('common.yes') });
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
			console.error('Error applying filters:', error);
			if (error.response && error.response.status === 404) {
				setNoUsersFound(true);
			} else {
				console.error('Unexpected error:', error);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleFilterChange = (newFilters: Filters) => {
		const params = new URLSearchParams();

		if (Object.keys(newFilters).length === 0) {
			handleFilterApply(params, 1);
			return;
		}

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
		if (newFilters.availableForDonation === true) {
			params.set('availableForDonation', 'true');
		}
		if (newFilters.isAdmin === true) {
			params.set('isAdmin', 'true');
		}

		handleFilterApply(params, 1);
	};

	const activeFilters = getActiveFilters();

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('users.list.title')}</Typography>
				<IconButton
					aria-label={t('users.list.advancedFilters')}
					onClick={() => setIsFilterOpen(true)}
				>
					<TuneIcon />
				</IconButton>
			</div>

			<UserFilter
				open={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				onApply={handleFilterChange}
			/>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<PeopleIcon />
					</div>
					<div style={{ flexGrow: 1 }}>
						<Typography className={heroTitle}>{t('users.list.title')}</Typography>
						<Typography className={heroSubtitle}>{t('users.list.heroSubtitle')}</Typography>
					</div>
					<div>
						<div className={heroCount}>{users.length}</div>
						<div className={heroCountLabel}>{t('users.list.countLabel')}</div>
					</div>
				</div>

				{activeFilters.length > 0 && (
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						{activeFilters.map((filter) => (
							<Chip
								key={filter.key}
								label={`${filter.key}: ${filter.value}`}
								onDelete={() => removeFilter(filter.key)}
								size='small'
							/>
						))}
					</div>
				)}

				{isLoading ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
						<CircularProgress />
					</div>
				) : noUsersFound || users.length === 0 ? (
					<NoUserFound />
				) : (
					<>
						{users.map((user) => {
							const fullName = [user.profile?.firstname, user.profile?.lastname]
								.filter(Boolean)
								.join(' ');
							return (
								<button
									key={user._id}
									type='button'
									className={userRow}
									onClick={() => navigate(`/users/${user._id}`)}
								>
									<div className={userAvatar}>
										{(fullName || user.username || '?').charAt(0).toUpperCase()}
									</div>
									<div style={{ flexGrow: 1 }}>
										<Typography className={userName}>
											{fullName || user.username}
										</Typography>
										<Typography className={userMeta}>
											{[user.phoneNumber, user.profile?.bloodGroup]
												.filter(Boolean)
												.join('   ')}
										</Typography>
									</div>
									<span
										aria-hidden='true'
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: '40px',
											height: '40px',
											backgroundColor: '#F1EFF4',
											borderRadius: '12px',
											flexShrink: 0,
										}}
									>
										<ArrowForwardIcon fontSize='small' />
									</span>
								</button>
							);
						})}
						{totalPages > 1 && (
							<div className={paginationRow}>
								<button
									disabled={page === 1}
									onClick={() =>
										setSearchParams({
											...Object.fromEntries(searchParams),
											page: (page - 1).toString(),
										})
									}
								>
									{t('common.previous')}
								</button>
								<button
									disabled={page >= totalPages}
									onClick={() =>
										setSearchParams({
											...Object.fromEntries(searchParams),
											page: (page + 1).toString(),
										})
									}
								>
									{t('common.next')}
								</button>
							</div>
						)}
					</>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default UsersComponent;
