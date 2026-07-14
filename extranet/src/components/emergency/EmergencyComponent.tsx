import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Emergency } from '../../data/Emergency';
import { useConfirmEmergency, useUnconfirmedEmergencies } from '../../hooks';
import { emergencyListRedesignStyles } from '../../styles/emergencyListRedesign';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import SnackbarComponent from '../shared/SnackbarComponent';
import EmergencyCard from './EmergencyCard';

const EmergencyComponent = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get('page') || '1', 10);

	const [totalPages, setTotalPages] = useState(0);
	const [message, setMessage] = useState<string | null>(null);

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
		emptyState,
		paginationRow,
	} = emergencyListRedesignStyles();

	const { data: emergenciesResponse, isLoading } = useUnconfirmedEmergencies(page);

	useEffect(() => {
		if (emergenciesResponse?.data) {
			setTotalPages(Math.ceil(emergenciesResponse.data.totalItems / 10));
		}
	}, [emergenciesResponse]);

	const emergencies: Emergency[] = emergenciesResponse?.data?.emergencies || [];
	const totalItems = emergenciesResponse?.data?.totalItems ?? 0;

	const mutation = useConfirmEmergency();

	const handleConfirmEmergency = (emergencyId: string) => {
		mutation.mutate(emergencyId, {
			onSuccess: () => setMessage(t('emergency.list.confirmSuccess')),
			onError: () => setMessage(t('emergency.list.confirmError')),
		});
	};

	const handleNextPage = () => {
		if (page < totalPages) setSearchParams({ page: String(page + 1) });
	};

	const handlePrevPage = () => {
		if (page > 1) setSearchParams({ page: String(page - 1) });
	};

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('emergency.list.title')}</Typography>
				<IconButton aria-label={t('admin.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>🚨</div>
					<div style={{ flexGrow: 1 }}>
						<Typography className={heroTitle}>{t('emergency.list.title')}</Typography>
						<Typography className={heroSubtitle}>{t('emergency.list.heroSubtitle')}</Typography>
					</div>
					<div>
						<div className={heroCount}>{totalItems}</div>
						<div className={heroCountLabel}>{t('emergency.list.countLabel')}</div>
					</div>
				</div>

				{isLoading ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
						<CircularProgress />
					</div>
				) : emergencies.length === 0 ? (
					<div className={emptyState}>{t('emergency.list.empty')}</div>
				) : (
					emergencies.map((emergency) => (
						<EmergencyCard
							key={emergency._id}
							emergency={emergency}
							onConfirm={() => handleConfirmEmergency(emergency._id)}
							isConfirming={mutation.isPending && mutation.variables === emergency._id}
						/>
					))
				)}

				{totalPages > 1 && (
					<div className={paginationRow}>
						<Button disabled={page === 1 || isLoading} onClick={handlePrevPage}>
							{t('common.previous')}
						</Button>
						<Button disabled={page >= totalPages || isLoading} onClick={handleNextPage}>
							{t('common.next')}
						</Button>
					</div>
				)}
			</div>

			<RedesignBottomNav />

			<SnackbarComponent
				open={!!message}
				message={message || ''}
				handleClose={() => setMessage(null)}
			/>
		</div>
	);
};

export default EmergencyComponent;
