import {
	AccountCircle,
	Bloodtype,
	Cake,
	Cancel,
	Edit,
	Email,
	LocationOn,
	Lock,
	Person,
	Phone,
	Save,
	Visibility,
	VisibilityOff,
} from '@mui/icons-material';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Fade,
	Grid,
	IconButton,
	MenuItem,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { motion } from 'framer-motion';
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
import colors from '../../styles/colors';
import { cities, formatDate, formatDateForDisplay } from '../../utils/utils';

import { BloodGroup } from '@/data/constants';
import { useQueryClient } from '@tanstack/react-query';

const useStyles = makeStyles({
	root: {
		minHeight: '100vh',
		padding: '20px 16px',
		'@media (min-width: 600px)': {
			padding: '40px 20px',
		},
		'@media (min-width: 960px)': {
			padding: '60px 24px',
		},
	},
	container: {
		maxWidth: 900,
		margin: '0 auto',
		padding: '0 8px',
		'@media (min-width: 600px)': {
			padding: '0 16px',
		},
		'@media (min-width: 960px)': {
			padding: '0',
		},
	},
	header: {
		textAlign: 'center',
		marginBottom: 24,
		'@media (min-width: 600px)': {
			marginBottom: 40,
		},
	},
	avatarContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		marginBottom: 24,
		'@media (min-width: 600px)': {
			marginBottom: 30,
		},
	},
	avatar: {
		width: 100,
		height: 100,
		background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.purple} 100%)`,
		border: `4px solid rgba(255, 255, 255, 0.8)`,
		boxShadow: '0 8px 32px rgba(255, 48, 103, 0.3)',
		marginBottom: 16,
		'@media (min-width: 600px)': {
			width: 120,
			height: 120,
		},
	},
	welcomeText: {
		color: colors.purple,
		fontSize: '2rem',
		fontWeight: 700,
		marginBottom: 8,
		textShadow: '0 2px 4px rgba(0,0,0,0.1)',
		'@media (min-width: 600px)': {
			fontSize: '2.5rem',
		},
	},
	subtitle: {
		color: colors.darkPurple,
		fontSize: '1rem',
		textAlign: 'center',
		maxWidth: 600,
		margin: '0 auto',
		opacity: 0.8,
		'@media (min-width: 600px)': {
			fontSize: '1.1rem',
		},
	},
	profileCard: {
		background: 'rgba(255, 255, 255, 0.98)',
		backdropFilter: 'blur(20px)',
		borderRadius: '16px',
		border: `1px solid rgba(59, 42, 130, 0.08)`,
		boxShadow: '0 8px 32px rgba(59, 42, 130, 0.08)',
		marginBottom: 24,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		'@media (min-width: 600px)': {
			borderRadius: '20px',
			boxShadow: '0 16px 48px rgba(59, 42, 130, 0.12)',
			marginBottom: 30,
		},
		'@media (min-width: 960px)': {
			borderRadius: '24px',
			boxShadow: '0 20px 60px rgba(59, 42, 130, 0.15)',
			'&:hover': {
				transform: 'translateY(-4px)',
				boxShadow: '0 32px 80px rgba(59, 42, 130, 0.2)',
			},
		},
	},
	passwordCard: {
		background: 'rgba(255, 255, 255, 0.98)',
		backdropFilter: 'blur(20px)',
		borderRadius: '16px',
		border: `1px solid rgba(59, 42, 130, 0.08)`,
		boxShadow: '0 8px 32px rgba(59, 42, 130, 0.08)',
		marginBottom: 24,
		transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
		'@media (min-width: 600px)': {
			borderRadius: '20px',
			boxShadow: '0 16px 48px rgba(59, 42, 130, 0.12)',
			marginBottom: 30,
		},
		'@media (min-width: 960px)': {
			borderRadius: '24px',
			boxShadow: '0 20px 60px rgba(59, 42, 130, 0.15)',
			'&:hover': {
				transform: 'translateY(-4px)',
				boxShadow: '0 32px 80px rgba(59, 42, 130, 0.2)',
			},
		},
	},
	sectionHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingBottom: 12,
		borderBottom: `2px solid ${colors.purple}20`,
		'@media (min-width: 600px)': {
			marginBottom: 24,
			paddingBottom: 16,
		},
	},
	sectionTitle: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		margin: 0,
		color: colors.purple,
		fontSize: '1.25rem',
		fontWeight: 600,
		'@media (min-width: 600px)': {
			fontSize: '1.5rem',
			gap: 12,
		},
	},
	sectionIcon: {
		color: colors.rose,
		fontSize: '1.5rem',
		'@media (min-width: 600px)': {
			fontSize: '2rem',
		},
	},
	fieldContainer: {
		marginBottom: 20,
	},
	fieldLabel: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		marginBottom: 8,
		fontWeight: 600,
		color: colors.darkPurple,
		fontSize: '0.9rem',
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
	},
	fieldIcon: {
		fontSize: '1.2rem',
		color: colors.purple,
	},
	fieldValue: {
		fontSize: '1rem',
		color: '#333',
		fontWeight: 500,
		padding: '12px 16px',
		backgroundColor: '#f8f9fa',
		borderRadius: '12px',
		border: '1px solid #e9ecef',
		transition: 'all 0.2s ease',
	},
	editField: {
		'& .MuiOutlinedInput-root': {
			borderRadius: '12px',
			backgroundColor: 'white',
			transition: 'all 0.2s ease',
			'& fieldset': {
				borderColor: '#e9ecef',
			},
			'&:hover fieldset': {
				borderColor: colors.purple,
			},
			'&.Mui-focused fieldset': {
				borderColor: colors.rose,
				borderWidth: '2px',
			},
		},
		'& .MuiSelect-select': {
			padding: '12px 16px',
		},
		'& .MuiInputBase-input': {
			padding: '12px 16px',
		},
	},
	actionButtons: {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		marginTop: 20,
		paddingTop: 12,
		borderTop: `1px solid ${colors.purple}10`,
		'@media (min-width: 600px)': {
			flexDirection: 'row',
			justifyContent: 'flex-end',
			marginTop: 24,
			paddingTop: 16,
		},
	},
	saveButton: {
		background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.purple} 100%)`,
		color: 'white',
		borderRadius: '10px',
		padding: '12px 20px',
		fontWeight: 600,
		fontSize: '0.9rem',
		width: '100%',
		transition: 'all 0.3s ease',
		'@media (min-width: 600px)': {
			borderRadius: '12px',
			padding: '10px 24px',
			fontSize: '1rem',
			width: 'auto',
		},
		'&:hover': {
			background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 25px rgba(255, 48, 103, 0.3)',
		},
	},
	cancelButton: {
		border: `2px solid ${colors.purple}`,
		color: colors.purple,
		borderRadius: '10px',
		padding: '12px 20px',
		fontWeight: 600,
		fontSize: '0.9rem',
		width: '100%',
		transition: 'all 0.3s ease',
		'@media (min-width: 600px)': {
			borderRadius: '12px',
			padding: '10px 24px',
			fontSize: '1rem',
			width: 'auto',
		},
		'&:hover': {
			backgroundColor: colors.purple,
			color: 'white',
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 25px rgba(59, 42, 130, 0.2)',
		},
	},
	editButton: {
		background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
		color: 'white',
		borderRadius: '10px',
		padding: '12px 20px',
		fontWeight: 600,
		fontSize: '0.9rem',
		width: '100%',
		transition: 'all 0.3s ease',
		'@media (min-width: 600px)': {
			borderRadius: '12px',
			padding: '10px 24px',
			fontSize: '1rem',
			width: 'auto',
		},
		'&:hover': {
			background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.purple} 100%)`,
			transform: 'translateY(-2px)',
			boxShadow: '0 8px 25px rgba(59, 42, 130, 0.3)',
		},
	},
	passwordField: {
		'& .MuiOutlinedInput-root': {
			borderRadius: '12px',
			backgroundColor: 'white',
			'& fieldset': {
				borderColor: '#e9ecef',
			},
			'&:hover fieldset': {
				borderColor: colors.purple,
			},
			'&.Mui-focused fieldset': {
				borderColor: colors.rose,
				borderWidth: '2px',
			},
		},
	},

	loadingContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '400px',
	},
	errorContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '400px',
	},
	snackbar: {
		'& .MuiSnackbar-root': {
			borderRadius: '12px',
		},
	},
	alert: {
		borderRadius: '12px',
		boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
	},
	alertActionsContainer: {
		marginTop: 16,
		display: 'flex',
		justifyContent: 'center',
		gap: 12,
	},
	alertMessageWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		textAlign: 'center',
	},
});

const ProfileComponent = () => {
	const {
		root,
		container,
		avatarContainer,
		avatar,
		welcomeText,
		subtitle,
		profileCard,
		passwordCard,
		sectionHeader,
		sectionTitle,
		sectionIcon,
		fieldContainer,
		fieldLabel,
		fieldIcon,
		fieldValue,
		editField,
		actionButtons,
		saveButton,
		cancelButton,
		editButton,
		passwordField,
		loadingContainer,
		errorContainer,
		snackbar,
		alert,
		alertActionsContainer,
		alertMessageWrapper,
	} = useStyles();
	const { token, setToken, setIsAdmin, setUserId } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [isEditingInfo, setIsEditingInfo] = useState(false);
	const [isEditingPassword, setIsEditingPassword] = useState(false);

	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

	const showSnackbar = (message: string, severity: 'success' | 'error') => {
		setSnackbarMessage(message);
		setSnackbarSeverity(severity);
		setSnackbarOpen(true);
	};

	// fetch user profile
	const { data: userInfo, isLoading, isError, refetch } = useUserProfile();

	// Handle userInfo data changes
	useEffect(() => {
		if (userInfo && userInfo.data) {
			const data = userInfo.data;
			setEditedUserInfo({
				firstname: data.firstname || '',
				lastname: data.lastname || '',
				birthdate: formatDate(data.birthdate) || '',
				bloodGroup: data.bloodGroup || BloodGroup.None,
				city: data.city || '',
				phoneNumber: String(data.phoneNumber || ''),
				email: data.email || '',
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
		// Convert phoneNumber back to number for API
		const apiData = {
			...updatedInfo,
			phoneNumber: Number(updatedInfo.phoneNumber) || 0,
		};
		updateProfileMutation.mutate(
			{ userId: 'me', data: apiData as any },
			{
				onSuccess: () => {
					showSnackbar('Profile updated successfully!', 'success');
					setIsEditingInfo(false);
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
					showSnackbar('Password updated successfully!', 'success');
					setIsEditingPassword(false);
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

	// Helper function to get icon for each field
	const getFieldIcon = (field: string) => {
		switch (field) {
			case 'firstname':
			case 'lastname':
				return <Person className={fieldIcon} />;
			case 'email':
				return <Email className={fieldIcon} />;
			case 'phoneNumber':
				return <Phone className={fieldIcon} />;
			case 'birthdate':
				return <Cake className={fieldIcon} />;
			case 'bloodGroup':
				return <Bloodtype className={fieldIcon} />;
			case 'city':
				return <LocationOn className={fieldIcon} />;
			default:
				return <AccountCircle className={fieldIcon} />;
		}
	};

	if (isLoading) {
		return (
			<Box className={loadingContainer}>
				<motion.div
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					<CircularProgress size={60} sx={{ color: 'white' }} />
				</motion.div>
			</Box>
		);
	}

	if (isError) {
		return (
			<Box className={errorContainer}>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Alert
						severity='error'
						sx={{
							borderRadius: '16px',
							fontSize: '1.1rem',
							padding: '20px',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
						}}
					>
						Failed to load profile. Please try again.
					</Alert>
				</motion.div>
			</Box>
		);
	}

	return (
		<Box className={root}>
			<Container className={container}>
				{/* Profile Information Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					<Card
						className={profileCard}
						sx={{
							borderRadius: { xs: '16px', sm: '20px', md: '24px' },
						}}
					>
						<CardContent
							sx={{
								padding: { xs: '20px', sm: '24px', md: '32px' },
							}}
						>
							<Box className={sectionHeader}>
								<Typography variant='h5' className={sectionTitle}>
									<Person className={sectionIcon} />
									Personal Information
								</Typography>
								{!isEditingInfo && (
									<IconButton
										onClick={() => setIsEditingInfo(true)}
										sx={{
											backgroundColor: colors.purple,
											color: 'white',
											'&:hover': {
												backgroundColor: colors.darkPurple,
												transform: 'scale(1.1)',
											},
											transition: 'all 0.3s ease',
										}}
									>
										<Edit />
									</IconButton>
								)}
							</Box>

							<Grid container spacing={3}>
								{Object.entries(userFieldDisplayNames).map(
									([field, label], index) => (
										<Grid item xs={12} md={6} key={field}>
											<motion.div
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.4, delay: index * 0.1 }}
												className={fieldContainer}
											>
												<Typography className={fieldLabel}>
													{getFieldIcon(field)}
													{label}
												</Typography>
												{isEditingInfo ? (
													field === 'bloodGroup' ? (
														<TextField
															select
															fullWidth
															value={
																editedUserInfo[
																	field as keyof typeof editedUserInfo
																]
															}
															onChange={(e) =>
																setEditedUserInfo({
																	...editedUserInfo,
																	[field]: e.target.value as BloodGroup,
																})
															}
															className={editField}
															variant='outlined'
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
															fullWidth
															value={
																editedUserInfo[
																	field as keyof typeof editedUserInfo
																]
															}
															onChange={(e) =>
																setEditedUserInfo({
																	...editedUserInfo,
																	[field]: e.target.value,
																})
															}
															className={editField}
															variant='outlined'
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
															fullWidth
															value={
																editedUserInfo[
																	field as keyof typeof editedUserInfo
																]
															}
															onChange={(e) =>
																setEditedUserInfo({
																	...editedUserInfo,
																	[field]: e.target.value,
																})
															}
															className={editField}
															variant='outlined'
														/>
													) : (
														<TextField
															type='text'
															fullWidth
															value={
																editedUserInfo[
																	field as keyof typeof editedUserInfo
																]
															}
															onChange={(e) =>
																setEditedUserInfo({
																	...editedUserInfo,
																	[field]: e.target.value,
																})
															}
															className={editField}
															variant='outlined'
														/>
													)
												) : (
													<Box className={fieldValue}>
														{field === 'birthdate'
															? userInfo &&
															  userInfo.data &&
															  formatDateForDisplay(
																	userInfo.data[
																		field as keyof typeof userInfo.data
																	]
															  )
															: userInfo &&
															  userInfo.data &&
															  userInfo.data[
																	field as keyof typeof userInfo.data
															  ]}
													</Box>
												)}
											</motion.div>
										</Grid>
									)
								)}
							</Grid>

							{/* Action Buttons */}
							{isEditingInfo && (
								<Fade in={isEditingInfo}>
									<Box className={actionButtons}>
										<Button
											variant='outlined'
											onClick={() => {
												if (userInfo && userInfo.data) {
													const data = userInfo.data;
													setEditedUserInfo({
														firstname: data.firstname || '',
														lastname: data.lastname || '',
														birthdate: new Date(data.birthdate || '')
															.toISOString()
															.split('T')[0],
														bloodGroup: data.bloodGroup || BloodGroup.None,
														city: data.city || '',
														phoneNumber: String(data.phoneNumber || ''),
														email: data.email || '',
													});
												}
												setIsEditingInfo(false);
											}}
											className={cancelButton}
											startIcon={<Cancel />}
										>
											Cancel
										</Button>
										<Button
											variant='contained'
											onClick={handleInfoSave}
											className={saveButton}
											startIcon={<Save />}
										>
											Save Changes
										</Button>
									</Box>
								</Fade>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Password Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Card
						className={passwordCard}
						sx={{
							borderRadius: { xs: '16px', sm: '20px', md: '24px' },
						}}
					>
						<CardContent
							sx={{
								padding: { xs: '20px', sm: '24px', md: '32px' },
							}}
						>
							<Box className={sectionHeader}>
								<Typography variant='h5' className={sectionTitle}>
									<Lock className={sectionIcon} />
									Password Security
								</Typography>
								{!isEditingPassword && (
									<IconButton
										onClick={() => setIsEditingPassword(true)}
										sx={{
											backgroundColor: colors.purple,
											color: 'white',
											'&:hover': {
												backgroundColor: colors.darkPurple,
												transform: 'scale(1.1)',
											},
											transition: 'all 0.3s ease',
										}}
									>
										<Edit />
									</IconButton>
								)}
							</Box>

							{isEditingPassword ? (
								<Fade in={isEditingPassword}>
									<Box>
										{/* Current Password */}
										<Box className={fieldContainer}>
											<Typography className={fieldLabel}>
												<Lock className={fieldIcon} />
												Current Password
											</Typography>
											<TextField
												type={showCurrentPassword ? 'text' : 'password'}
												fullWidth
												value={currentPassword}
												onChange={(e) => setCurrentPassword(e.target.value)}
												className={passwordField}
												variant='outlined'
												InputProps={{
													endAdornment: (
														<IconButton
															onClick={() =>
																setShowCurrentPassword(!showCurrentPassword)
															}
															edge='end'
														>
															{showCurrentPassword ? (
																<VisibilityOff />
															) : (
																<Visibility />
															)}
														</IconButton>
													),
												}}
											/>
										</Box>

										{/* New Password */}
										<Box className={fieldContainer}>
											<Typography className={fieldLabel}>
												<Lock className={fieldIcon} />
												New Password
											</Typography>
											<TextField
												type={showNewPassword ? 'text' : 'password'}
												fullWidth
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												className={passwordField}
												variant='outlined'
												InputProps={{
													endAdornment: (
														<IconButton
															onClick={() =>
																setShowNewPassword(!showNewPassword)
															}
															edge='end'
														>
															{showNewPassword ? (
																<VisibilityOff />
															) : (
																<Visibility />
															)}
														</IconButton>
													),
												}}
											/>
										</Box>

										{/* Confirm Password */}
										<Box className={fieldContainer}>
											<Typography className={fieldLabel}>
												<Lock className={fieldIcon} />
												Confirm New Password
											</Typography>
											<TextField
												type={showConfirmPassword ? 'text' : 'password'}
												fullWidth
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className={passwordField}
												variant='outlined'
												InputProps={{
													endAdornment: (
														<IconButton
															onClick={() =>
																setShowConfirmPassword(!showConfirmPassword)
															}
															edge='end'
														>
															{showConfirmPassword ? (
																<VisibilityOff />
															) : (
																<Visibility />
															)}
														</IconButton>
													),
												}}
											/>
										</Box>

										{error && (
											<Alert
												severity='error'
												sx={{ borderRadius: '12px', mb: 2 }}
											>
												{error}
											</Alert>
										)}

										<Box className={actionButtons}>
											<Button
												variant='outlined'
												onClick={() => {
													setCurrentPassword('');
													setNewPassword('');
													setConfirmPassword('');
													setIsEditingPassword(false);
													setError('');
												}}
												className={cancelButton}
												startIcon={<Cancel />}
											>
												Cancel
											</Button>
											<Button
												variant='contained'
												onClick={handlePasswordSave}
												className={saveButton}
												startIcon={<Save />}
											>
												Update Password
											</Button>
										</Box>
									</Box>
								</Fade>
							) : (
								<Box sx={{ textAlign: 'center', py: 4 }}>
									<Lock
										sx={{
											fontSize: '4rem',
											color: colors.purple,
											mb: 2,
											opacity: 0.7,
										}}
									/>
									<Typography
										variant='h6'
										sx={{ color: colors.darkPurple, mb: 2 }}
									>
										Password Protected
									</Typography>
									<Typography variant='body2' sx={{ color: '#666', mb: 3 }}>
										Your password is securely stored and protected
									</Typography>
									<Button
										variant='contained'
										onClick={() => setIsEditingPassword(true)}
										className={editButton}
										startIcon={<Edit />}
									>
										Change Password
									</Button>
								</Box>
							)}
						</CardContent>
					</Card>
				</motion.div>

				{/* Extra spacing after password card */}
				<Box sx={{ height: { xs: 40, sm: 60, md: 80 } }} />

				{/* Snackbar */}
				<Snackbar
					open={snackbarOpen}
					autoHideDuration={6000}
					onClose={() => setSnackbarOpen(false)}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
					className={snackbar}
				>
					<Alert
						onClose={() => setSnackbarOpen(false)}
						severity={snackbarSeverity}
						className={alert}
					>
						{snackbarMessage}
					</Alert>
				</Snackbar>
			</Container>
		</Box>
	);
};

export default ProfileComponent;
