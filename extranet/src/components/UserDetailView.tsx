import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import { Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { hasAdminRole } from '../auth/adminAccess';
import { useAuth } from '../auth/AuthContext';
import { useAdminUserDetail, useDeleteUser, useToggleAdminStatus } from '../hooks';
import { eventDetailRedesignStyles } from '../styles/eventDetailRedesign';
import { eventOverviewCardStyles } from '../styles/eventOverviewCard';
import { userDetailRedesignStyles } from '../styles/userDetailRedesign';
import ConfirmationDialog from './shared/ConfirmationDialog';
import NotFoundPage from './NotFoundPage';
import RedesignBottomNav from './shared/RedesignBottomNav';
import SnackbarComponent from './shared/SnackbarComponent';

const UserDetailView = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { userId } = useParams<{ userId: string }>();
	const { isAdmin, adminRole } = useAuth();
	// Principal-Admin-only (issue #183), same as the Route-level gate in
	// App.tsx -- this is the belt-and-suspenders self-guard that was already
	// here for plain isAdmin.
	const isPrincipalAdmin = hasAdminRole(isAdmin, adminRole, []);
	const { data: userInfo, isLoading } = useAdminUserDetail(userId as string);
	const deleteUser = useDeleteUser();
	const toggleAdminStatus = useToggleAdminStatus();

	const [confirmDelete, setConfirmDelete] = useState(false);
	const [confirmMakeAdmin, setConfirmMakeAdmin] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const { topBar, topBarDivider, topBarTitle, content } = eventDetailRedesignStyles();
	const { actionsRow, primaryActionButton, iconSquareButton, iconSquareButtonNeutral } =
		eventOverviewCardStyles();
	const {
		screen,
		profileCard,
		avatar,
		availabilityBadge,
		availabilityAvailable,
		availabilityUnavailable,
		name,
		city,
		infoCard,
		infoCardLabel,
		infoCardValue,
		infoCardAction,
	} = userDetailRedesignStyles();

	if (!isPrincipalAdmin) {
		return <NotFoundPage />;
	}

	const user = userInfo?.data;
	const fullName = user ? [user.firstname, user.lastname].filter(Boolean).join(' ') : '';

	const handleDelete = () => {
		if (!user?.username) return;
		deleteUser.mutate(user.username, {
			onSuccess: () => {
				setMessage(t('users.list.deleteSuccess'));
				setTimeout(() => navigate('/users'), 1500);
			},
			onError: (error: any) => {
				setMessage(
					t('users.list.deleteError', {
						message: error.response?.data?.message || error.message,
					})
				);
			},
		});
		setConfirmDelete(false);
	};

	const handleMakeAdmin = () => {
		if (!userId) return;
		toggleAdminStatus.mutate(userId, {
			onSuccess: () => {
				setMessage(t('users.list.makeAdminSuccess', { username: user?.username }));
			},
			onError: (error: any) => {
				setMessage(
					t('users.list.makeAdminError', {
						message: error.response?.data?.message || error.message,
					})
				);
			},
		});
		setConfirmMakeAdmin(false);
	};

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('admin.usersList')}</Typography>
				<IconButton aria-label={t('admin.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			{isLoading || !user ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
					<CircularProgress />
				</div>
			) : (
				<div className={content}>
					<div className={profileCard}>
						<div className={avatar}>{(fullName || user.username || '?').charAt(0).toUpperCase()}</div>
						<span
							className={`${availabilityBadge} ${
								user.canDonate ? availabilityAvailable : availabilityUnavailable
							}`}
						>
							{user.canDonate ? t('users.detail.available') : t('users.detail.unavailable')}
						</span>
						<Typography className={name}>{fullName || user.username}</Typography>
						{user.city && <Typography className={city}>{user.city}</Typography>}

						<div className={actionsRow} style={{ marginTop: '16px' }}>
							<Button
								type='button'
								className={primaryActionButton}
								onClick={() => navigate(`/users/update/${userId}`)}
							>
								{t('common.edit')}
								<EditIcon fontSize='small' />
							</Button>
							{!user.isAdmin && (
								<IconButton
									className={iconSquareButton}
									aria-label={t('users.card.makeAdmin')}
									onClick={() => setConfirmMakeAdmin(true)}
								>
									<PersonAddIcon />
								</IconButton>
							)}
							<IconButton
								className={iconSquareButtonNeutral}
								aria-label={t('users.card.delete')}
								onClick={() => setConfirmDelete(true)}
							>
								<DeleteIcon />
							</IconButton>
						</div>
					</div>

					<div className={infoCard}>
						<div>
							<Typography className={infoCardLabel}>{t('users.detail.bloodType')}</Typography>
							<Typography className={infoCardValue}>{user.bloodGroup || '—'}</Typography>
						</div>
						<div className={infoCardAction}>
							<BloodtypeIcon fontSize='small' />
						</div>
					</div>

					<div className={infoCard}>
						<div>
							<Typography className={infoCardLabel}>{t('users.detail.phoneNumber')}</Typography>
							<Typography className={infoCardValue}>{user.phoneNumber || '—'}</Typography>
						</div>
						{user.phoneNumber && (
							<IconButton
								className={infoCardAction}
								aria-label={t('users.detail.call')}
								component='a'
								href={`tel:${user.phoneNumber}`}
							>
								<PhoneIcon fontSize='small' />
							</IconButton>
						)}
					</div>

					<div className={infoCard}>
						<div>
							<Typography className={infoCardLabel}>{t('users.detail.mail')}</Typography>
							<Typography className={infoCardValue}>{user.email || '—'}</Typography>
						</div>
						{user.email && (
							<IconButton
								className={infoCardAction}
								aria-label={t('users.detail.sendMail')}
								component='a'
								href={`mailto:${user.email}`}
							>
								<EmailIcon fontSize='small' />
							</IconButton>
						)}
					</div>
				</div>
			)}

			<RedesignBottomNav />

			<ConfirmationDialog
				open={confirmDelete}
				title={t('users.list.deleteTitle')}
				message={t('users.list.deleteConfirm', { username: user?.username })}
				confirmText={t('common.delete')}
				cancelText={t('common.cancel')}
				onConfirm={handleDelete}
				onCancel={() => setConfirmDelete(false)}
				warning
			/>
			<ConfirmationDialog
				open={confirmMakeAdmin}
				title={t('users.list.makeAdminTitle')}
				message={t('users.list.makeAdminConfirm', { username: user?.username })}
				confirmText={t('users.card.makeAdmin')}
				cancelText={t('common.cancel')}
				onConfirm={handleMakeAdmin}
				onCancel={() => setConfirmMakeAdmin(false)}
			/>
			<SnackbarComponent
				open={!!message}
				message={message || ''}
				handleClose={() => setMessage(null)}
			/>
		</div>
	);
};

export default UserDetailView;
