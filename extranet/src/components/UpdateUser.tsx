import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	Button,
	CircularProgress,
	FormControl,
	FormHelperText,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { BLOOD_GROUP_OPTIONS } from '../data/constants';
import { authRedesignStyles } from '../styles/authRedesign';
import { eventDetailRedesignStyles } from '../styles/eventDetailRedesign';
import { userDetailRedesignStyles } from '../styles/userDetailRedesign';
import { cities } from '../utils/utils';
import RedesignBottomNav from './shared/RedesignBottomNav';
import SnackbarComponent from './shared/SnackbarComponent';

interface UpdateUserFormData {
	firstname: string;
	lastname: string;
	birthdate: string;
	bloodGroup: string;
	city: string;
	phoneNumber: string;
	email: string;
}

const UpdateUser = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { userId } = useParams<{ userId: string }>();
	const { input, primaryButton } = authRedesignStyles();
	const { screen, topBar, topBarDivider, topBarTitle, content } = eventDetailRedesignStyles();
	const { avatar } = userDetailRedesignStyles();
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [message, setMessage] = useState('');

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<UpdateUserFormData>({
		defaultValues: {
			firstname: '',
			lastname: '',
			birthdate: '',
			bloodGroup: '',
			city: '',
			phoneNumber: '',
			email: '',
		},
	});

	// Fetch user data
	const { data: userData, isLoading } = useQuery({
		queryKey: ['user', userId],
		queryFn: async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`http://localhost:3000/api/users/profile/${userId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			return response.data;
		},
		enabled: !!userId,
	});

	// Reset form when userData is loaded
	useEffect(() => {
		if (userData) {
			reset({
				firstname: userData.firstname || '',
				lastname: userData.lastname || '',
				birthdate: userData.birthdate
					? new Date(userData.birthdate).toISOString().split('T')[0]
					: '',
				bloodGroup: userData.bloodGroup || '',
				city: userData.city || '',
				phoneNumber: userData.phoneNumber || '',
				email: userData.email || '',
			});
		}
	}, [userData, reset]);

	const onSubmit = async (data: UpdateUserFormData) => {
		try {
			const token = localStorage.getItem('token');
			await axios.put(`http://localhost:3000/api/users/${userId}`, data, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setMessage(t('users.update.success'));
			setShowSnackbar(true);

			setTimeout(() => {
				navigate('/users');
			}, 2000);
		} catch (error) {
			console.error('Error updating user:', error);
			setMessage(t('users.update.error'));
			setShowSnackbar(true);
		}
	};

	const fullName = userData
		? [userData.firstname, userData.lastname].filter(Boolean).join(' ')
		: '';

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('users.update.title')}</Typography>
				<div style={{ width: '40px' }} />
			</div>

			{isLoading ? (
				<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
					<CircularProgress />
				</div>
			) : (
				<div className={content}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
						<div className={avatar} style={{ width: '48px', height: '48px', fontSize: '18px', marginBottom: 0 }}>
							{(fullName || userData?.username || '?').charAt(0).toUpperCase()}
						</div>
						<div>
							<Typography style={{ fontWeight: 700, fontSize: '15px', color: '#1F1B24' }}>
								{fullName || userData?.username}
							</Typography>
							{userData?.username && (
								<Typography style={{ fontSize: '13px', color: '#8A8690' }}>
									{userData.username}
								</Typography>
							)}
						</div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
							<Controller
								name='firstname'
								control={control}
								rules={{ required: t('users.update.firstNameRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('users.update.firstName')}
										error={Boolean(errors.firstname)}
										helperText={errors.firstname?.message}
									/>
								)}
							/>
							<Controller
								name='lastname'
								control={control}
								rules={{ required: t('users.update.lastNameRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('users.update.lastName')}
										error={Boolean(errors.lastname)}
										helperText={errors.lastname?.message}
									/>
								)}
							/>
							<Controller
								name='email'
								control={control}
								rules={{
									required: t('users.update.emailRequired'),
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: t('users.update.emailInvalid'),
									},
								}}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										type='email'
										className={input}
										label={t('users.update.email')}
										error={Boolean(errors.email)}
										helperText={errors.email?.message}
									/>
								)}
							/>
							<Controller
								name='phoneNumber'
								control={control}
								rules={{ required: t('users.update.phoneRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('users.update.phone')}
										error={Boolean(errors.phoneNumber)}
										helperText={errors.phoneNumber?.message}
									/>
								)}
							/>
							<Controller
								name='birthdate'
								control={control}
								rules={{ required: t('users.update.birthdateRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										type='date'
										className={input}
										label={t('users.update.birthdate')}
										error={Boolean(errors.birthdate)}
										helperText={errors.birthdate?.message}
										InputLabelProps={{ shrink: true }}
									/>
								)}
							/>
							<Controller
								name='city'
								control={control}
								rules={{ required: t('users.update.cityRequired') }}
								render={({ field }) => (
									<FormControl fullWidth error={Boolean(errors.city)} className={input}>
										<InputLabel>{t('users.update.city')}</InputLabel>
										<Select {...field} label={t('users.update.city')}>
											{cities.map((city) => (
												<MenuItem key={city} value={city}>
													{city}
												</MenuItem>
											))}
										</Select>
										{errors.city && <FormHelperText>{errors.city.message}</FormHelperText>}
									</FormControl>
								)}
							/>
							<Controller
								name='bloodGroup'
								control={control}
								rules={{ required: t('users.update.bloodGroupRequired') }}
								render={({ field }) => (
									<FormControl fullWidth error={Boolean(errors.bloodGroup)} className={input}>
										<InputLabel>{t('users.update.bloodGroup')}</InputLabel>
										<Select {...field} label={t('users.update.bloodGroup')}>
											{BLOOD_GROUP_OPTIONS.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
										</Select>
										{errors.bloodGroup && (
											<FormHelperText>{errors.bloodGroup.message}</FormHelperText>
										)}
									</FormControl>
								)}
							/>
							<Button type='submit' fullWidth className={primaryButton}>
								{t('users.update.submit')}
							</Button>
						</div>
					</form>
				</div>
			)}

			<RedesignBottomNav />

			<SnackbarComponent
				open={showSnackbar}
				message={message}
				handleClose={() => setShowSnackbar(false)}
			/>
		</div>
	);
};

export default UpdateUser;
