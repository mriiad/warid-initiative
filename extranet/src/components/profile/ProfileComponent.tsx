import {
	Alert,
	Button,
	CircularProgress,
	MenuItem,
	Snackbar,
	TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/AuthContext';
import {
	userFieldDisplayNames,
	UserFormData,
} from '../../data/ProfileFormData';

import {
	useUpdatePassword,
	useUpdateProfile,
	useUserProfile,
} from '../../hooks';
import { cities, formatDate, formatDateForDisplay } from '../../utils/utils';

import { BloodGroup } from '@/data/constants';
import { useQueryClient } from '@tanstack/react-query';

const useStyles = makeStyles({
	container: {
		width: 400,
		margin: '0 auto',
		padding: 10,
	},
	section: {
		marginBottom: 30,
		padding: 20,
		borderRadius: 12,
		border: '1px solid #e0e0e0',
		backgroundColor: '#ffffff',
		boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
	},
	sectionTitle: {
		marginBottom: 15,
		color: '#3B2A82',
		fontWeight: 600,
		borderBottom: '1px solid #ccc',
		paddingBottom: 8,
	},
	title: {
		marginTop: 0,
		marginBottom: 10,
		color: '#3B2A82',
		textAlign: 'center',
		fontSize: '2.3rem',
		fontWeight: 'bold',
	},
	infoRow: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	label: {
		fontWeight: 'bold',
		marginRight: 8,
		minWidth: 140,
	},
	value: {
		color: '#555',
		flex: 1,
	},
	fullWidthField: {
		flex: 1,
	},
	snackbar: {
		marginTop: 20,
	},
	alert: {
		width: '100%',
	},
	alertActionsContainer: {
		marginTop: 8,
		display: 'flex',
		justifyContent: 'center',
		gap: 8,
	},
	alertMessageWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
});

const ProfileComponent = () => {
	const classes = useStyles();
	const { token, setToken, setIsAdmin, setUserId } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [isEditingInfo, setIsEditingInfo] = useState(false);
	const [isEditingPassword, setIsEditingPassword] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');

	const [editedUserInfo, setEditedUserInfo] = useState<UserFormData>({
		firstname: '',
		lastname: '',
		city: '',
		birthdate: '',
		bloodGroup: BloodGroup.None,
		phoneNumber: '',
		email: '',
	});

	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState('');
	const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
		'success'
	);
	const [lastAction, setLastAction] = useState<
		'infoUpdate' | 'passwordUpdate' | null
	>(null);

	const showSnackbar = (message: string, severity: 'success' | 'error') => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarOpen(true);
	};

	// fetch user profile
	const { data: userInfo, isLoading, isError, refetch } = useUserProfile();

	// Handle userInfo data changes
	useEffect(() => {
		if (userInfo) {
			setEditedUserInfo({
				firstname: userInfo.firstname || '',
				lastname: userInfo.lastname || '',
				birthdate: formatDate(userInfo.birthdate) || '',
				bloodGroup: userInfo.bloodGroup || BloodGroup.None,
				city: userInfo.city || '',
				phoneNumber: userInfo.phoneNumber || '',
				email: userInfo.email || '',
			});
		}
	}, [userInfo]);

	// Handle query error
	useEffect(() => {
		if (isError) {
			showSnackbar('Failed to load profile.', 'error');
		}
	}, [isError]);

	// update profile mutation
	const updateProfileMutation = useUpdateProfile();

	const handleUpdateProfile = (updatedInfo: UserFormData) => {
		updateProfileMutation.mutate(
			{ userId: 'me', data: updatedInfo },
			{
				onSuccess: () => {
					showSnackbar('Profile updated successfully!', 'success');
					setIsEditingInfo(false);
					setLastAction('infoUpdate');
				},
				onError: () => {
					showSnackbar('Failed to update profile.', 'error');
				},
			}
		);
	};
	const updatePasswordMutation = useUpdatePassword();

	const handleUpdatePassword = ({
		currentPassword,
		newPassword,
	}: {
		currentPassword: string;
		newPassword: string;
	}) => {
		updatePasswordMutation.mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					showSnackbar(
						'Password updated successfully! You can choose to logout for security.',
						'success'
					);
					setIsEditingPassword(false);
					setLastAction('passwordUpdate');
					setCurrentPassword('');
					setNewPassword('');
					setConfirmPassword('');
					setError('');
				},
				onError: (error: any) => {
					const message =
						error.response?.data?.message || 'Failed to update password.';
					showSnackbar(message, 'error');
					console.error('Error updating password:', error);
				},
			}
		);
	};

	// logout
	const logoutMutation = useLogout();

	const handleLogout = () => {
		logoutMutation.mutate(undefined, {
			onSuccess: () => {
				localStorage.clear();
				setToken(null);
				setUserId(null);
				setIsAdmin(null);
				navigate('/login');
			},
			onError: (error) => {
				console.error('Logout error', error);
			},
		});
	};

	const handleInfoSave = () => {
		// Validate phone and email as before...
		const phoneValidationResult = validatePhoneNumber(
			editedUserInfo.phoneNumber
		);
		const emailValidationResult = validateEmail(editedUserInfo.email);

		if (phoneValidationResult !== true) {
			showSnackbar(phoneValidationResult, 'error');
			return;
		}

		if (emailValidationResult !== true) {
			showSnackbar(emailValidationResult, 'error');
			return;
		}

		handleUpdateProfile(editedUserInfo);
	};

	const handlePasswordSave = () => {
		if (newPassword !== confirmPassword) {
			showSnackbar('New password and confirmation do not match.', 'error');
			return;
		}
		if (!currentPassword || !newPassword || !confirmPassword) {
			showSnackbar('All password fields must be filled.', 'error');
			return;
		}
		handleUpdatePassword({ currentPassword, newPassword });
	};

	// Email & phone number validation functions
	const phoneValidationRules = {
		required: 'Phone number is required',
		pattern: {
			value: /^[0-9]+$/,
			message: 'Phone number must contain only numbers',
		},
		validate: (value: string) =>
			value.length === 10 || 'Phone number must be exactly 10 digits',
	};

	const emailValidationRules = {
		required: 'Email is required',
		pattern: {
			value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			message: 'Please enter a valid email address',
		},
	};

	const validatePhoneNumber = (value: string) => {
		if (!value) return phoneValidationRules.required;
		if (!phoneValidationRules.pattern.value.test(value))
			return phoneValidationRules.pattern.message;
		if (value.length !== 10) return phoneValidationRules.validate(value);
		return true;
	};

	const validateEmail = (value: string) => {
		if (!value) return emailValidationRules.required;
		if (!emailValidationRules.pattern.value.test(value))
			return emailValidationRules.pattern.message;
		return true;
	};

	if (isLoading) return <CircularProgress />;
	if (isError) return <Alert severity='error'>Failed to load profile.</Alert>;

	return (
		<div className={classes.container}>
			<h1 className={classes.title}>Profile</h1>

			{/* User Info Section */}
			<div className={classes.section}>
				<h3 className={classes.sectionTitle}>User Information</h3>
				{Object.entries(userFieldDisplayNames).map(([field, label]) => (
					<div className={classes.infoRow} key={field}>
						<span className={classes.label}>{label}:</span>
						{isEditingInfo ? (
							field === 'bloodGroup' ? (
								<TextField
									select
									size='small'
									value={editedUserInfo[field as keyof typeof editedUserInfo]}
									onChange={(e) =>
										setEditedUserInfo({
											...editedUserInfo,
											[field]: e.target.value as BloodGroup,
										})
									}
									className={classes.fullWidthField}
								>
									{Object.values(BloodGroup)
										.filter((bg) => bg !== '')
										.map((group) => (
											<MenuItem key={group} value={group}>
												{group}
											</MenuItem>
										))}
								</TextField>
							) : field === 'city' ? (
								<TextField
									select
									size='small'
									value={editedUserInfo[field as keyof typeof editedUserInfo]}
									onChange={(e) =>
										setEditedUserInfo({
											...editedUserInfo,
											[field]: e.target.value,
										})
									}
									className={classes.fullWidthField}
								>
									{cities.map((city) => (
										<MenuItem key={city} value={city}>
											{city}
										</MenuItem>
									))}
								</TextField>
							) : field === 'birthdate' ? (
								<TextField
									type='date'
									size='small'
									value={editedUserInfo[field as keyof typeof editedUserInfo]}
									onChange={(e) =>
										setEditedUserInfo({
											...editedUserInfo,
											[field]: e.target.value,
										})
									}
									className={classes.fullWidthField}
								/>
							) : (
								<TextField
									type='text'
									size='small'
									value={editedUserInfo[field as keyof typeof editedUserInfo]}
									onChange={(e) =>
										setEditedUserInfo({
											...editedUserInfo,
											[field]: e.target.value,
										})
									}
									className={classes.fullWidthField}
								/>
							)
						) : (
							<span className={classes.value}>
								{field === 'birthdate'
									? userInfo &&
									  formatDateForDisplay(
											userInfo[field as keyof typeof userInfo]
									  )
									: userInfo && userInfo[field as keyof typeof userInfo]}
							</span>
						)}
					</div>
				))}

				{isEditingInfo ? (
					<>
						<Button
							variant='contained'
							color='primary'
							onClick={handleInfoSave}
							sx={{ mr: 1 }}
						>
							Save
						</Button>
						<Button
							variant='outlined'
							color='secondary'
							onClick={() => {
								if (userInfo)
									setEditedUserInfo({
										firstname: userInfo.firstname,
										lastname: userInfo.lastname,
										birthdate: new Date(userInfo.birthdate)
											.toISOString()
											.split('T')[0],
										bloodGroup: userInfo.bloodGroup,
										city: userInfo.city,
										phoneNumber: userInfo.phoneNumber,
										email: userInfo.email,
									});
								setIsEditingInfo(false);
							}}
						>
							Cancel
						</Button>
					</>
				) : (
					<Button
						variant='contained'
						color='primary'
						onClick={() => setIsEditingInfo(true)}
					>
						Edit Info
					</Button>
				)}
			</div>

			{/* Password Section */}
			<div className={classes.section}>
				<h3 className={classes.sectionTitle}>Password</h3>

				{isEditingPassword ? (
					<>
						<div className={classes.infoRow}>
							<span className={classes.label}>Current Password:</span>
							<TextField
								type='password'
								size='small'
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								className={classes.fullWidthField}
							/>
						</div>
						<div className={classes.infoRow}>
							<span className={classes.label}>New Password:</span>
							<TextField
								type='password'
								size='small'
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className={classes.fullWidthField}
							/>
						</div>
						<div className={classes.infoRow}>
							<span className={classes.label}>Confirm New Password:</span>
							<TextField
								type='password'
								size='small'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className={classes.fullWidthField}
							/>
						</div>
						{error && <p style={{ color: 'red' }}>{error}</p>}
						<Button
							variant='contained'
							color='primary'
							onClick={handlePasswordSave}
							sx={{ mr: 1 }}
						>
							Save
						</Button>
						<Button
							variant='outlined'
							color='secondary'
							onClick={() => {
								setCurrentPassword('');
								setNewPassword('');
								setConfirmPassword('');
								setIsEditingPassword(false);
								setError('');
							}}
						>
							Cancel
						</Button>
					</>
				) : (
					<>
						<div className={classes.infoRow}>
							<span className={classes.label}>Current Password:</span>
							<TextField
								type='password'
								size='small'
								value='passwordplaceholder'
								disabled
								className={classes.fullWidthField}
							/>
						</div>
						<Button
							variant='contained'
							color='primary'
							onClick={() => setIsEditingPassword(true)}
						>
							Change Password
						</Button>
					</>
				)}
			</div>

			{/* Snackbar */}

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={6000}
				onClose={() => setSnackbarOpen(false)}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				className={classes.snackbar}
			>
				<Alert
					onClose={() => setSnackbarOpen(false)}
					severity={snackbarSeverity}
					className={classes.alert}
				>
					{lastAction === 'passwordUpdate' ? (
						<div className={classes.alertMessageWrapper}>
							<div>{snackbarMessage}</div>
							<div className={classes.alertActionsContainer}>
								<Button
									variant='contained'
									color='secondary'
									size='small'
									onClick={handleLogout}
								>
									Logout
								</Button>
								<Button
									variant='contained'
									color='inherit'
									size='small'
									onClick={() => setSnackbarOpen(false)}
								>
									Stay Logged In
								</Button>
							</div>
						</div>
					) : (
						snackbarMessage
					)}
				</Alert>
			</Snackbar>
		</div>
	);
};

export default ProfileComponent;
