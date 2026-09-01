import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	Button,
	FormControl,
	FormHelperText,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BLOOD_GROUP_OPTIONS } from '../../data/constants';
import { useCreateEmergency } from '../../hooks';
import { authRedesignStyles } from '../../styles/authRedesign';
import { eventsListRedesignStyles } from '../../styles/eventsListRedesign';
import { cities } from '../../utils/utils';
import PhoneNumberField from '../shared/PhoneNumberField';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import ResponseAnimation from '../shared/ResponseAnimation';
import Ltr from '../shared/Ltr';
import { useShortDate } from '../../hooks';

// Form data interface for the form (with string phoneNumber for validation)
interface EmergencyFormData {
	bloodGroup: string;
	city: string;
	phoneNumber: string;
	details: string;
}

const EmergencyForm = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { input, primaryButton } = authRedesignStyles();
	const { screen, topBar, topBarDivider, topBarTitle, content, hero, heroIcon, heroTitle } =
		eventsListRedesignStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
		setError,
		reset,
	} = useForm<EmergencyFormData>();

	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState(false);
	const [isErrorResponse, setIsErrorResponse] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const mutation = useCreateEmergency();

	const handleFormSubmit = (formData: EmergencyFormData) => {
		const payload = {
			bloodGroup: formData.bloodGroup as any,
			city: formData.city,
			phoneNumber: formData.phoneNumber,
			details: formData.details,
		};

		mutation.mutate(payload, {
			onSuccess: () => {
				setIsFormSubmitted(true);
				setIsSuccessResponse(true);
				setIsErrorResponse(false);
				reset();
			},
			onError: (error: any) => {
				if (error?.response?.data?.errorKeys) {
					error.response.data.errorKeys.forEach(
						(errorKey: keyof EmergencyFormData) => {
							setError(errorKey, {
								message: t('emergency.form.fieldInvalid', { field: errorKey }),
							});
						}
					);
				}

				// The response body lives at error.response.data (apiClient's
				// interceptor forwards the raw Axios error unchanged) --
				// error.data is always undefined, so this used to always fall
				// through to the generic fallback below. See issue #342.
				setErrorMessage(
					error?.response?.data?.message || t('emergency.form.genericError')
				);
				setIsFormSubmitted(true);
				setIsErrorResponse(true);
				setIsSuccessResponse(false);
			},
			onSettled: () => {
				setLoading(false);
				setTimeout(() => {
					setIsFormSubmitted(false);
				}, 8000);
			},
		});
	};

	const onSubmit = (formData: EmergencyFormData) => {
		setLoading(true);
		setIsFormSubmitted(false);
		setErrorMessage(null);
		handleFormSubmit(formData);
	};

	const shortDate = useShortDate();
	const todayLabel = shortDate(new Date());

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('emergency.form.title')}</Typography>
				<div style={{ width: '40px' }} />
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>🚨</div>
					<Typography className={heroTitle}>{t('emergency.form.title')}</Typography>
					<Typography style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '4px' }}>
						{todayLabel}
					</Typography>
				</div>

				{isFormSubmitted ? (
					<ResponseAnimation
						responseMessage={t('emergency.form.successTitle')}
						actionMessage={t('emergency.form.successBody')}
						isSuccess={isSuccessResponse}
						isError={isErrorResponse}
						errorMessage={errorMessage}
					/>
				) : (
					<form onSubmit={handleSubmit(onSubmit)}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
							<Controller
								name='bloodGroup'
								control={control}
								defaultValue=''
								rules={{ required: t('emergency.form.bloodGroupRequired') }}
								render={({ field }) => (
									<FormControl fullWidth className={input} error={Boolean(errors.bloodGroup)}>
										<InputLabel>{t('emergency.form.bloodGroup')}</InputLabel>
										<Select {...field} label={t('emergency.form.bloodGroup')}>
											<MenuItem value=''>
												<em>{t('emergency.form.none')}</em>
											</MenuItem>
											{BLOOD_GROUP_OPTIONS.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													<Ltr>{option.label}</Ltr>
												</MenuItem>
											))}
										</Select>
										<FormHelperText>{errors.bloodGroup?.message}</FormHelperText>
									</FormControl>
								)}
							/>

							<Controller
								name='city'
								rules={{ required: t('emergency.form.cityRequired') }}
								control={control}
								defaultValue=''
								render={({ field }) => (
									<FormControl fullWidth className={input} error={Boolean(errors.city)}>
										<InputLabel>{t('emergency.form.city')}</InputLabel>
										<Select {...field} label={t('emergency.form.city')}>
											<MenuItem value=''>
												<em>{t('emergency.form.none')}</em>
											</MenuItem>
											{cities.map((city) => (
												<MenuItem key={city} value={city}>
													{city}
												</MenuItem>
											))}
										</Select>
										<FormHelperText>{errors.city?.message}</FormHelperText>
									</FormControl>
								)}
							/>

							<Controller
								name='phoneNumber'
								control={control}
								defaultValue=''
								rules={{
									required: t('emergency.form.phoneRequired'),
									pattern: {
										value: /^\+[1-9]\d{6,14}$/,
										message: t('emergency.form.phoneInvalid'),
									},
								}}
								render={({ field: { ref: _ref, ...field } }) => (
									<PhoneNumberField
										label={t('emergency.form.phone')}
										{...field}
										error={Boolean(errors.phoneNumber)}
										helperText={errors.phoneNumber?.message}
									/>
								)}
							/>

							<Controller
								name='details'
								control={control}
								defaultValue=''
								rules={{ required: t('emergency.form.detailsRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('emergency.form.details')}
										multiline
										rows={4}
										error={Boolean(errors.details)}
										helperText={errors.details?.message}
									/>
								)}
							/>

							<Button type='submit' fullWidth className={primaryButton} disabled={loading}>
								{loading ? t('emergency.form.submitting') : t('emergency.form.submit')}
							</Button>
						</div>
					</form>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default EmergencyForm;
