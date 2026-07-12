// ContactForm.tsx
import { Button, Grid, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { ProfileFormData } from '../data/ProfileFormData';
import { authStyles } from '../styles/mainStyles';
import API_CONFIG, { buildApiUrl } from '../utils/apiConfig';
import FormContainer from './shared/FormContainer';
import ResponseAnimation from './shared/ResponseAnimation';

const useStyles = makeStyles({
	align: {
		marginBottom: '80px',
	},
	formWrapper: {
		marginBottom: '88px',
	},
});

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
	const { bar, button, signUp, form } = authStyles();
	const { align, formWrapper } = useStyles();

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState<boolean>(false);
	const [isErrorResponse, setIsErrorResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	const [localUserProfile, setLocalUserProfile] =
		useState<ProfileFormData>(null);
	const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);

	useEffect(() => {
		if (token) {
			setIsProfileLoading(true);
			axios
				.get('/api/user/profile')
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
			await axios.post(buildApiUrl(API_CONFIG.endpoints.contact), formData);
			console.log('Contact form submitted successfully!');
			setIsSuccessResponse(true);
			setIsErrorResponse(false);
		} catch (error) {
			console.error('Error submitting contact form:', error);
			setIsErrorResponse(true);
			setIsSuccessResponse(false);
			setErrorMessage(error.message || t('contact.genericError'));
		}
	};

	const handleSendAnotherMessage = () => {
		setIsFormSubmitted(false);
		if (isSuccessResponse) reset();
	};

	if (isFormSubmitted) {
		return (
			<FormContainer className={formWrapper}>
				<ResponseAnimation
					responseMessage={t('contact.successTitle')}
					actionMessage={t('contact.successBody')}
					isSuccess={isSuccessResponse}
					isError={isErrorResponse}
					errorMessage={errorMessage}
				/>
				<Button
					onClick={handleSendAnotherMessage}
					className={button}
					style={{ marginTop: '20px' }}
				>
					{t('contact.sendAnother')}
				</Button>
			</FormContainer>
		);
	}

	return (
		<FormContainer className={align}>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				{t('contact.title')}
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					{!localUserProfile?.firstname && (
						<Grid item xs={12}>
							<Controller
								name='firstname'
								control={control}
								render={({ field }) => (
									<TextField
										fullWidth
										label={t('contact.firstName')}
										required
										{...field}
										error={Boolean(errors.firstname)}
										helperText={
											errors.firstname ? t('contact.firstNameRequired') : ''
										}
									/>
								)}
							/>
						</Grid>
					)}
					{!localUserProfile?.lastname && (
						<Grid item xs={12}>
							<Controller
								name='lastname'
								control={control}
								render={({ field }) => (
									<TextField
										fullWidth
										label={t('contact.lastName')}
										required
										{...field}
										error={Boolean(errors.lastname)}
										helperText={
											errors.lastname ? t('contact.lastNameRequired') : ''
										}
									/>
								)}
							/>
						</Grid>
					)}
					{!token && (
						<Grid item xs={12}>
							<Controller
								name='email'
								control={control}
								render={({ field }) => (
									<TextField
										fullWidth
										label={t('contact.email')}
										required
										{...field}
										error={Boolean(errors.email)}
										helperText={errors.email ? t('contact.emailRequired') : ''}
									/>
								)}
							/>
						</Grid>
					)}
					{!token && (
						<Grid item xs={12}>
							<Controller
								name='phoneNumber'
								control={control}
								render={({ field }) => (
									<TextField
										fullWidth
										label={t('contact.phone')}
										required
										{...field}
										error={Boolean(errors.phoneNumber)}
										helperText={
											errors.phoneNumber ? t('contact.phoneRequired') : ''
										}
									/>
								)}
							/>
						</Grid>
					)}
					<Grid item xs={12}>
						<Controller
							name='subject'
							control={control}
							render={({ field }) => (
								<TextField
									fullWidth
									label={t('contact.subject')}
									required
									{...field}
									error={Boolean(errors.subject)}
									helperText={errors.subject ? t('contact.subjectRequired') : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='message'
							control={control}
							render={({ field }) => (
								<TextField
									fullWidth
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
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							{t('contact.submit')}
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default ContactForm;
