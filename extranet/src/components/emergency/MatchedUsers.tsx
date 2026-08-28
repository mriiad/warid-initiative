import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, Checkbox, CircularProgress, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useConfirmUserInEmergency, useEmergencyMatchUsers } from '../../hooks';
import { matchedUsersRedesignStyles } from '../../styles/matchedUsersRedesign';
import type { MatchedUser } from '../../types';
import API_CONFIG from '../../utils/apiConfig';
import Pagination from '../shared/Pagination';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import SnackbarComponent from '../shared/SnackbarComponent';

const MatchedUsers = () => {
	const { t } = useTranslation();
	const { emergencyId } = useParams<{ emergencyId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const emergencyContext = location.state as
		| { bloodGroup?: string; city?: string; details?: string }
		| null;
	const requestedBloodGroup = emergencyContext?.bloodGroup;

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
		whatsappButton,
		emptyState,
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

	// Marks every selected donor as contacted for this emergency, after the
	// WhatsApp messages below have been opened.
	const confirmSelectedUsers = async () => {
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

	// wa.me expects the full international number with no '+', spaces or
	// leading zeros -- PhoneNumberField already stores numbers as E.164
	// (e.g. '+212600000000'), so stripping every non-digit is enough.
	const buildWhatsappUrl = (phoneNumber: string, text: string) =>
		`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

	const handleSendWhatsapp = async () => {
		if (selected.size === 0) {
			setMessage(t('emergency.matchedUsers.noSelection'));
			return;
		}

		const detailsLine = emergencyContext?.details ? `${emergencyContext.details}\n` : '';
		const whatsappMessage = t('emergency.matchedUsers.whatsappMessageTemplate', {
			bloodGroup: requestedBloodGroup || '',
			city: emergencyContext?.city || '',
			details: detailsLine,
			// Fixed config value, not the emergency's own submitted contact
			// number -- every message shows the same official Warid number
			// regardless of which admin sends it or which emergency it's for.
			phoneNumber: API_CONFIG.emergency.whatsappContactNumber,
		});

		// Opened synchronously, in the same tick as the click that triggered
		// this handler -- doing this after an `await` loses the "opened from
		// a user gesture" trust most browsers require, and every tab beyond
		// the first would get silently popup-blocked.
		Array.from(selected).forEach((userId) => {
			const user = matchedUsers.find((u) => u._id === userId);
			if (user) {
				window.open(buildWhatsappUrl(user.phoneNumber, whatsappMessage), '_blank', 'noopener,noreferrer');
			}
		});

		await confirmSelectedUsers();
	};

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<div style={{ flexGrow: 1 }}>
					<Typography className={topBarTitle}>{t('emergency.matchedUsers.pageTitle')}</Typography>
					{requestedBloodGroup && (
						<Typography className={userBloodGroup} style={{ textAlign: 'center' }}>
							{t('emergency.matchedUsers.requestedFor', { bloodGroup: requestedBloodGroup })}
						</Typography>
					)}
				</div>
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
										{user.bloodGroup && (
											<Typography className={userBloodGroup}>{user.bloodGroup}</Typography>
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

						<Pagination
							page={page}
							totalPages={totalPages}
							onPageChange={(newPage) => setSearchParams({ page: String(newPage) })}
							disabled={isLoading}
						/>
					</>
				)}
			</div>

			{matchedUsers.length > 0 && (
				<div className={actionBar}>
					<Button
						type='button'
						className={whatsappButton}
						onClick={handleSendWhatsapp}
						disabled={isSending}
						startIcon={<WhatsAppIcon />}
					>
						{t('emergency.matchedUsers.sendWhatsapp')}
					</Button>
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
