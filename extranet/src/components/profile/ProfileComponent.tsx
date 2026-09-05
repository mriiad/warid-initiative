import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import LogoutIcon from '@mui/icons-material/Logout';
import {
	CircularProgress,
	FormControl,
	IconButton,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BloodGroup } from '@/data/constants';
import { useAuth as useAuthContext } from '../../auth/AuthContext';
import { UserFormData } from '@/types';
import { useAuth, useUpdateMyProfile, useUpdatePassword, useUserProfile } from '../../hooks';
import { authRedesignStyles } from '../../styles/authRedesign';
import { eventDetailRedesignStyles } from '../../styles/eventDetailRedesign';
import { profileRedesignStyles } from '../../styles/profileRedesign';
import { userDetailRedesignStyles } from '../../styles/userDetailRedesign';
import { cities, formatDateForDisplay } from '../../utils/utils';
import PasswordField from '../shared/PasswordField';
import PhoneNumberField from '../shared/PhoneNumberField';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import SnackbarComponent from '../shared/SnackbarComponent';
import Ltr from '../shared/Ltr';
import { PASSWORD_MIN_LENGTH } from '../../data/constants';

// `ltr` marks the values that are LTR-directional data rather than prose:
// under the app's RTL direction a trailing +/- would otherwise be moved to
// the wrong visual side ("O+" as "+O", "+212..." as "212...+"). See #384.
const profileFields: { field: keyof UserFormData; labelKey: string; ltr?: boolean }[] = [
	{ field: 'firstname', labelKey: 'profile.firstName' },
	{ field: 'lastname', labelKey: 'profile.lastName' },
	{ field: 'birthdate', labelKey: 'profile.birthdate' },
	{ field: 'bloodGroup', labelKey: 'profile.bloodGroup', ltr: true },
	{ field: 'city', labelKey: 'profile.city' },
	{ field: 'phoneNumber', labelKey: 'profile.phoneNumber', ltr: true },
	{ field: 'email', labelKey: 'profile.email', ltr: true },
];

const ProfileComponent = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { setToken, setUserId, setIsAdmin } = useAuthContext();
	const { logout } = useAuth();

	const { topBar, topBarDivider, topBarTitle, content } = eventDetailRedesignStyles();
	const { profileCard, avatar, name, infoCard, infoCardLabel, infoCardValue, infoCardAction } =
		userDetailRedesignStyles();
	const { input } = authRedesignStyles();
	const {
		sectionHeaderRow,
		sectionTitle,
		editToggleButton,
		actionsRow,
		cancelButton,
		saveButton,
		passwordPrompt,
		passwordPromptIcon,
		passwordPromptBody,
		changePasswordButton,
	} = profileRedesignStyles();

	const [isEditingInfo, setIsEditingInfo] = useState(false);
	const [isEditingPassword, setIsEditingPassword] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [editedUserInfo, setEditedUserInfo] = useState<UserFormData>({
		firstname: '',
		lastname: '',
		city: '',
		birthdate: '',
		bloodGroup: BloodGroup.None,
		phoneNumber: '',
		email: '',
	});

	const [message, setMessage] = useState<string | null>(null);

	const { data: userInfo, isLoading, isError } = useUserProfile();

	useEffect(() => {
		if (userInfo && userInfo.data) {
			const data = userInfo.data;
			setEditedUserInfo({
				firstname: data.firstname || '',
				lastname: data.lastname || '',
				birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : '',
				bloodGroup: data.bloodGroup || BloodGroup.None,
				city: data.city || '',
				phoneNumber: String(data.phoneNumber || ''),
				email: data.email || '',
			});
		}
	}, [userInfo]);

	useEffect(() => {
		if (isError) setMessage(t('profile.loadError'));
	}, [isError, t]);

	const updateProfileMutation = useUpdateMyProfile();
	const updatePasswordMutation = useUpdatePassword();

	const validatePhoneNumber = (value: string) => {
		if (!value) return t('auth.signup.phoneRequired');
		if (!/^\+[1-9]\d{6,14}$/.test(value)) return t('profile.phoneInvalid');
		return true;
	};

	const validateEmail = (value: string) => {
		if (!value) return t('auth.signup.emailRequired');
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('profile.emailInvalid');
		return true;
	};

	const handleInfoSave = () => {
		const phoneValidationResult = validatePhoneNumber(editedUserInfo.phoneNumber);
		const emailValidationResult = validateEmail(editedUserInfo.email);

		if (phoneValidationResult !== true) {
			setMessage(phoneValidationResult);
			return;
		}
		if (emailValidationResult !== true) {
			setMessage(emailValidationResult);
			return;
		}

		const apiData = { ...editedUserInfo };
		updateProfileMutation.mutate(apiData, {
			onSuccess: () => {
				setMessage(t('profile.updateSuccess'));
				setIsEditingInfo(false);
			},
			onError: () => setMessage(t('profile.updateError')),
		});
	};

	const handleLogout = () => {
		logout.mutate(undefined, {
			// onSettled, not onSuccess: signing out must not depend on the
			// server call succeeding. useLogout clears localStorage the same
			// way; this clears the in-memory auth state and leaves the page,
			// so a failed request can't strand the user on a logged-in screen
			// with their session half-cleared. The failure is still surfaced
			// by useLogout's onError. See issue #404.
			onSettled: () => {
				setToken(null);
				setUserId(null);
				setIsAdmin(false);
				navigate('/login');
			},
		});
	};

	const handleCancelInfo = () => {
		if (userInfo && userInfo.data) {
			const data = userInfo.data;
			setEditedUserInfo({
				firstname: data.firstname || '',
				lastname: data.lastname || '',
				birthdate: data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : '',
				bloodGroup: data.bloodGroup || BloodGroup.None,
				city: data.city || '',
				phoneNumber: String(data.phoneNumber || ''),
				email: data.email || '',
			});
		}
		setIsEditingInfo(false);
	};

	const handlePasswordSave = () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			setMessage(t('profile.passwordFieldsRequired'));
			return;
		}
		// This screen applied no minimum at all, so it accepted a
		// one-character password. The server enforces it too now -- this is
		// the earlier, friendlier half. See issue #395.
		if (newPassword.length < PASSWORD_MIN_LENGTH) {
			setMessage(t('auth.signup.passwordMinLength'));
			return;
		}
		if (newPassword !== confirmPassword) {
			setMessage(t('profile.passwordsMismatch'));
			return;
		}
		updatePasswordMutation.mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					setMessage(t('profile.passwordUpdateSuccess'));
					setIsEditingPassword(false);
					setCurrentPassword('');
					setNewPassword('');
					setConfirmPassword('');
				},
				onError: (error: any) => {
					setMessage(error.response?.data?.message || t('profile.passwordUpdateError'));
				},
			}
		);
	};

	const handleCancelPassword = () => {
		setCurrentPassword('');
		setNewPassword('');
		setConfirmPassword('');
		setIsEditingPassword(false);
	};

	const fullName = userInfo?.data
		? [userInfo.data.firstname, userInfo.data.lastname].filter(Boolean).join(' ')
		: '';

	const renderFieldValue = (field: keyof UserFormData) => {
		if (!userInfo?.data) return '—';
		if (field === 'birthdate') return formatDateForDisplay(userInfo.data.birthdate) || '—';
		return String(userInfo.data[field as keyof typeof userInfo.data] ?? '—');
	};

	const renderFieldEditor = (field: keyof UserFormData) => {
		if (field === 'bloodGroup') {
			return (
				<FormControl fullWidth className={input}>
					<Select
						value={editedUserInfo.bloodGroup}
						onChange={(e) =>
							setEditedUserInfo({ ...editedUserInfo, bloodGroup: e.target.value as BloodGroup })
						}
					>
						{Object.values(BloodGroup)
							.filter((bg) => bg !== '')
							.map((group) => (
								<MenuItem key={group} value={group}>
									{group}
								</MenuItem>
							))}
					</Select>
				</FormControl>
			);
		}
		if (field === 'phoneNumber') {
			return (
				<PhoneNumberField
					label=''
					value={editedUserInfo.phoneNumber}
					onChange={(value) => setEditedUserInfo({ ...editedUserInfo, phoneNumber: value })}
				/>
			);
		}
		if (field === 'city') {
			return (
				<FormControl fullWidth className={input}>
					<Select
						value={editedUserInfo.city}
						onChange={(e) => setEditedUserInfo({ ...editedUserInfo, city: e.target.value })}
					>
						{cities.map((city) => (
							<MenuItem key={city} value={city}>
								{city}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			);
		}
		return (
			<TextField
				fullWidth
				className={input}
				type={field === 'birthdate' ? 'date' : 'text'}
				InputLabelProps={field === 'birthdate' ? { shrink: true } : undefined}
				value={editedUserInfo[field as keyof typeof editedUserInfo]}
				onChange={(e) => setEditedUserInfo({ ...editedUserInfo, [field]: e.target.value })}
			/>
		);
	};

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#F4F3F6', paddingBottom: '160px' }}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('profile.pageTitle')}</Typography>
				<IconButton aria-label={t('profile.logout')} onClick={handleLogout}>
					<LogoutIcon />
				</IconButton>
			</div>

			{isLoading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
					<CircularProgress />
				</div>
			) : (
				<div className={content}>
					<div className={profileCard}>
						<div className={avatar}>{(fullName || '?').charAt(0).toUpperCase()}</div>
						<Typography className={name}>{fullName || '—'}</Typography>
					</div>

					<div className={profileCard}>
						<div className={sectionHeaderRow}>
							<Typography className={sectionTitle}>{t('profile.personalInformation')}</Typography>
							{!isEditingInfo && (
								<IconButton
									className={editToggleButton}
									aria-label={t('common.edit')}
									onClick={() => setIsEditingInfo(true)}
								>
									<EditIcon fontSize='small' />
								</IconButton>
							)}
						</div>

						{isEditingInfo ? (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
								{profileFields.map(({ field, labelKey }) => (
									<div key={field}>
										<Typography
											style={{ fontSize: '11px', color: '#8A8690', marginBottom: '4px', fontWeight: 600 }}
										>
											{t(labelKey)}
										</Typography>
										{renderFieldEditor(field)}
									</div>
								))}
								<div className={actionsRow}>
									<Button className={cancelButton} onClick={handleCancelInfo}>
										{t('profile.cancel')}
									</Button>
									<Button className={saveButton} onClick={handleInfoSave}>
										{t('profile.save')}
									</Button>
								</div>
							</div>
						) : (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								{profileFields.map(({ field, labelKey, ltr }) => (
									<div className={infoCard} key={field}>
										<div>
											<Typography className={infoCardLabel}>{t(labelKey)}</Typography>
											<Typography className={infoCardValue}>
												{ltr ? <Ltr>{renderFieldValue(field)}</Ltr> : renderFieldValue(field)}
											</Typography>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className={profileCard}>
						<div className={sectionHeaderRow}>
							<Typography className={sectionTitle}>{t('profile.passwordSecurity')}</Typography>
							{!isEditingPassword && (
								<IconButton
									className={editToggleButton}
									aria-label={t('profile.changePassword')}
									onClick={() => setIsEditingPassword(true)}
								>
									<EditIcon fontSize='small' />
								</IconButton>
							)}
						</div>

						{isEditingPassword ? (
							<div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
								<PasswordField
									fullWidth
									className={input}
									label={t('profile.currentPassword')}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
								/>
								<PasswordField
									fullWidth
									className={input}
									label={t('profile.newPassword')}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
								/>
								<PasswordField
									fullWidth
									className={input}
									label={t('profile.confirmNewPassword')}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
								<div className={actionsRow}>
									<Button className={cancelButton} onClick={handleCancelPassword}>
										{t('profile.cancel')}
									</Button>
									<Button className={saveButton} onClick={handlePasswordSave}>
										{t('profile.updatePassword')}
									</Button>
								</div>
							</div>
						) : (
							<div className={passwordPrompt}>
								<div className={passwordPromptIcon}>
									<LockIcon />
								</div>
								<Typography className={passwordPromptBody}>
									{t('profile.passwordProtectedBody')}
								</Typography>
								<Button className={changePasswordButton} onClick={() => setIsEditingPassword(true)}>
									{t('profile.changePassword')}
								</Button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* regression (issue #328): /FAQ and /contact still exist and were
				redesigned onto the same styling system, but nothing in the
				current navigation links to either one -- the only place that
				ever did was the old, pre-redesign MobileNavbar, which is now
				unreachable for practically every route a normal user visits. */}
			<div className={profileCard}>
				<Typography className={sectionTitle} style={{ marginBottom: '16px' }}>
					{t('profile.helpSectionTitle')}
				</Typography>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<button
						type='button'
						className={infoCard}
						style={{ width: '100%', border: 'none', cursor: 'pointer', font: 'inherit' }}
						onClick={() => navigate('/FAQ')}
					>
						<Typography className={infoCardLabel}>{t('faq.pageTitle')}</Typography>
						<span className={infoCardAction} aria-hidden='true'>
							<ArrowForwardIcon fontSize='small' />
						</span>
					</button>
					<button
						type='button'
						className={infoCard}
						style={{ width: '100%', border: 'none', cursor: 'pointer', font: 'inherit' }}
						onClick={() => navigate('/contact')}
					>
						<Typography className={infoCardLabel}>{t('contact.title')}</Typography>
						<span className={infoCardAction} aria-hidden='true'>
							<ArrowForwardIcon fontSize='small' />
						</span>
					</button>
				</div>
			</div>

			<RedesignBottomNav />

			<SnackbarComponent open={!!message} message={message || ''} handleClose={() => setMessage(null)} />
		</div>
	);
};

export default ProfileComponent;
