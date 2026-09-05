// ContactForm.tsx
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { contactService, usersService } from '../services';
import type { UserProfileResponse } from '../types';
import { authRedesignStyles } from '../styles/authRedesign';
import { eventsListRedesignStyles } from '../styles/eventsListRedesign';
import PhoneNumberField from './shared/PhoneNumberField';
import RedesignBottomNav from './shared/RedesignBottomNav';
import ResponseAnimation from './shared/ResponseAnimation';

interface ContactFormData {
	firstname: string;
	lastname: string;
	email: string;
	phoneNumber: string;
	subject: string;
	message: string;
}

const ContactForm = () => {
	const { t } = useTranslation();
	const { token } = useAuth();
	const navigate = useNavigate();
	const { input, primaryButton } = authRedesignStyles();
	const { screen, topBar, topBarDivider, topBarTitle, content, hero, heroIcon, heroTitle, heroSubtitle } =
		eventsListRedesignStyles();

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState<boolean>(false);
	const [isErrorResponse, setIsErrorResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	// UserProfileResponse, not ProfileFormData: GET /api/user/profile returns
	// only `{ gender }` when the user has no Profile document yet, so every
	// field but gender is genuinely optional. The reads below already guard
	// for that (`|| ''`, `?.firstname`) -- the state type just claimed
	// otherwise.
	const [localUserProfile, setLocalUserProfile] =
		useState<UserProfileResponse | null>(null);
	const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

	useEffect(() => {
		if (token) {
			setIsProfileLoading(true);
			usersService
				.getMyProfile()
				.then((response) => {
					setLocalUserProfile(response.data);
				})
				.catch((error) => {
					console.error('Error fetching user profile:', error);
				})
				.finally(() => {
					setIsProfileLoading(false);
				});
		} else {
			setLocalUserProfile(null);
		}
	}, [token]);

	const {
		handleSubmit,
		formState: { errors },
		control,
		setValue,
		reset,
	} = useForm<ContactFormData>({
		defaultValues: {
			firstname: '',
			lastname: '',
			email: '',
			phoneNumber: '',
			subject: '',
			message: '',
		},
	});

	// Prefill form fields if user profile is available
	useEffect(() => {
		if (!isProfileLoading && localUserProfile) {
			setValue('firstname', localUserProfile.firstname || '');
			setValue('lastname', localUserProfile.lastname || '');
		}
	}, [localUserProfile, setValue, isProfileLoading]);

	const onSubmit = async (formData: ContactFormData) => {
		try {
			setIsFormSubmitted(true);
			await contactService.sendMessage(formData);
			console.log('Contact form submitted successfully!');
			setIsSuccessResponse(true);
			setIsErrorResponse(false);
		} catch (error) {
			console.error('Error submitting contact form:', error);
			setIsErrorResponse(true);
			setIsSuccessResponse(false);
			// error.message is Axios's own generic text ("Request failed with
			// status code 500"), not the backend's reason -- that lives at
			// error.response.data.message. See issue #344.
			setErrorMessage(
				error.response?.data?.message || error.message || t('contact.genericError')
			);
		}
	};

	// Every Controller below used to carry no `rules` at all, so errors.* was
	// never populated: the six translated contact.*Required strings were dead
	// in all three locales, and for a signed-out sender -- whose email and
	// phone are the only way to answer them -- neither was format-checked.
	// See issue #415.
	const validateEmail = (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) || t('contact.emailInvalid');
	};

	// Same shape SignupForm and EmergencyForm accept (E.164).
	const validatePhoneNumber = (value: string) =>
		/^\+[1-9]\d{6,14}$/.test(value) || t('contact.phoneInvalid');

	const handleSendAnotherMessage = () => {
		setIsFormSubmitted(false);
		if (isSuccessResponse) reset();
	};

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('contact.title')}</Typography>
				<div style={{ width: '40px' }} />
			</div>

			<div className={content}>
				{isFormSubmitted ? (
					<div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '32px 24px', textAlign: 'center' }}>
						<ResponseAnimation
							responseMessage={t('contact.successTitle')}
							actionMessage={t('contact.successBody')}
							isSuccess={isSuccessResponse}
							isError={isErrorResponse}
							errorMessage={errorMessage}
						/>
						<Button onClick={handleSendAnotherMessage} className={primaryButton} fullWidth style={{ marginTop: '16px' }}>
							{t('contact.sendAnother')}
						</Button>
					</div>
				) : (
					<>
						<div className={hero}>
							<div className={heroIcon}>
								<MailOutlineIcon />
							</div>
							<Typography className={heroTitle}>{t('contact.title')}</Typography>
							<Typography className={heroSubtitle}>{t('contact.heroSubtitle')}</Typography>
						</div>

						{/* noValidate: every field below passes `required`, which sets
						    the native HTML attribute -- the browser's own check would
						    otherwise block submit before react-hook-form runs, in the
						    browser's UI language rather than the app's. See issue #415. */}
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								{!localUserProfile?.firstname && (
									<Controller
										name='firstname'
										control={control}
										rules={{ required: t('contact.firstNameRequired') }}
										render={({ field }) => (
											<TextField
												fullWidth
												className={input}
												label={t('contact.firstName')}
												required
												{...field}
												error={Boolean(errors.firstname)}
												helperText={errors.firstname ? t('contact.firstNameRequired') : ''}
											/>
										)}
									/>
								)}
								{!localUserProfile?.lastname && (
									<Controller
										name='lastname'
										control={control}
										rules={{ required: t('contact.lastNameRequired') }}
										render={({ field }) => (
											<TextField
												fullWidth
												className={input}
												label={t('contact.lastName')}
												required
												{...field}
												error={Boolean(errors.lastname)}
												helperText={errors.lastname ? t('contact.lastNameRequired') : ''}
											/>
										)}
									/>
								)}
								{!token && (
									<Controller
										name='email'
										control={control}
										rules={{
											required: t('contact.emailRequired'),
											validate: validateEmail,
										}}
										render={({ field }) => (
											<TextField
												fullWidth
												className={input}
												label={t('contact.email')}
												required
												{...field}
												error={Boolean(errors.email)}
												helperText={(errors.email?.message as string) || ''}
											/>
										)}
									/>
								)}
								{!token && (
									<Controller
										name='phoneNumber'
										control={control}
										defaultValue=''
										rules={{
											required: t('contact.phoneRequired'),
											validate: validatePhoneNumber,
										}}
										// PhoneNumberField rather than a bare TextField, matching
										// SignupForm and EmergencyForm: it carries the country
										// picker that makes the E.164 rule above something a user
										// can actually satisfy, instead of asking them to know to
										// type '+212' into an unlabelled box.
										render={({ field: { ref: _ref, ...field } }) => (
											<PhoneNumberField
												label={t('contact.phone')}
												{...field}
												error={Boolean(errors.phoneNumber)}
												helperText={(errors.phoneNumber?.message as string) || ''}
											/>
										)}
									/>
								)}
								<Controller
									name='subject'
									control={control}
									rules={{ required: t('contact.subjectRequired') }}
									render={({ field }) => (
										<TextField
											fullWidth
											className={input}
											label={t('contact.subject')}
											required
											{...field}
											error={Boolean(errors.subject)}
											helperText={errors.subject ? t('contact.subjectRequired') : ''}
										/>
									)}
								/>
								<Controller
									name='message'
									control={control}
									rules={{ required: t('contact.messageRequired') }}
									render={({ field }) => (
										<TextField
											fullWidth
											className={input}
											label={t('contact.message')}
											required
											multiline
											rows={4}
											{...field}
											error={Boolean(errors.message)}
											helperText={errors.message ? t('contact.messageRequired') : ''}
										/>
									)}
								/>
								<Button type='submit' fullWidth className={primaryButton}>
									{t('contact.submit')}
								</Button>
							</div>
						</form>
					</>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default ContactForm;
