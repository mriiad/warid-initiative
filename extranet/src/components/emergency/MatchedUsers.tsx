import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, Checkbox, CircularProgress, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useConfirmUserInEmergency, useEmergencyMatchUsers } from '../../hooks';
import { matchedUsersRedesignStyles } from '../../styles/matchedUsersRedesign';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import SnackbarComponent from '../shared/SnackbarComponent';

interface MatchedUser {
	_id: string;
	phoneNumber: string;
	firstname: string;
	lastname: string;
}

const MatchedUsers = () => {
	const { t } = useTranslation();
	const { emergencyId } = useParams<{ emergencyId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const bloodGroup = (location.state as { bloodGroup?: string } | null)?.bloodGroup;

	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		content,
		selectRow,
		selectToggle,
		userRow,
		userAvatar,
		userInfo,
		userName,
		userBloodGroup,
		checkbox,
		actionBar,
		sendButton,
		whatsappButton,
		emptyState,
		paginationRow,
	} = matchedUsersRedesignStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const page = parseInt(searchParams.get('page') || '1', 10);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [message, setMessage] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);

	const { data: response, isLoading, isError } = useEmergencyMatchUsers(emergencyId!, page);
	const mutation = useConfirmUserInEmergency();

	const matchedUsers: MatchedUser[] = response?.data?.matchingUsers || [];
	const totalPages = Math.ceil((response?.data?.totalItems || 0) / 10);

	const toggleUser = (userId: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(userId)) next.delete(userId);
			else next.add(userId);
			return next;
		});
	};

	const toggleSelectAll = () => {
		setSelected((prev) =>
			prev.size === matchedUsers.length ? new Set() : new Set(matchedUsers.map((u) => u._id))
		);
	};

	const handleSend = async () => {
		if (selected.size === 0) {
			setMessage(t('emergency.matchedUsers.noSelection'));
			return;
		}
		setIsSending(true);
		const results = await Promise.allSettled(
			Array.from(selected).map((userId) =>
				mutation.mutateAsync({ emergencyId: emergencyId!, userId })
			)
		);
		setIsSending(false);
		const failures = results.filter((r) => r.status === 'rejected').length;
		if (failures > 0) {
			setMessage(t('emergency.matchedUsers.bulkConfirmError'));
		} else {
			setMessage(t('emergency.matchedUsers.bulkConfirmSuccess', { count: selected.size }));
			setSelected(new Set());
		}
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
				<Typography className={topBarTitle}>{t('emergency.matchedUsers.pageTitle')}</Typography>
				<IconButton aria-label={t('admin.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			<div className={content}>
				{isLoading ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
						<CircularProgress />
					</div>
				) : isError ? (
					<div className={emptyState}>{t('emergency.matchedUsers.failedToLoad')}</div>
				) : matchedUsers.length === 0 ? (
					<div className={emptyState}>{t('emergency.matchedUsers.noResults')}</div>
				) : (
					<>
						<div className={selectRow}>
							<Button type='button' className={selectToggle} onClick={toggleSelectAll}>
								{t('emergency.matchedUsers.selectLabel')}
							</Button>
						</div>

						{matchedUsers.map((user) => {
							const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');
							const isChecked = selected.has(user._id);
							return (
								<div className={userRow} key={user._id} onClick={() => toggleUser(user._id)}>
									<div className={userAvatar}>
										{(fullName || '?').charAt(0).toUpperCase()}
									</div>
									<div className={userInfo}>
										<Typography className={userName}>{fullName || user.phoneNumber}</Typography>
										{bloodGroup && (
											<Typography className={userBloodGroup}>{bloodGroup}</Typography>
										)}
									</div>
									<Checkbox
										className={checkbox}
										checked={isChecked}
										onChange={() => toggleUser(user._id)}
										onClick={(e) => e.stopPropagation()}
									/>
								</div>
							);
						})}

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
					</>
				)}
			</div>

			{matchedUsers.length > 0 && (
				<div className={actionBar}>
					<Button
						type='button'
						className={sendButton}
						onClick={handleSend}
						disabled={isSending}
					>
						{t('emergency.matchedUsers.sendSms')}
					</Button>
					<IconButton
						className={whatsappButton}
						aria-label={t('emergency.matchedUsers.sendWhatsapp')}
						onClick={handleSend}
						disabled={isSending}
					>
						<WhatsAppIcon />
					</IconButton>
				</div>
			)}

			<RedesignBottomNav />

			<SnackbarComponent
				open={!!message}
				message={message || ''}
				handleClose={() => setMessage(null)}
			/>
		</div>
	);
};

export default MatchedUsers;
