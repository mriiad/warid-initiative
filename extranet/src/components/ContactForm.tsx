// ContactForm.tsx
import { Button, Grid, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../auth/AuthContext';
import { ProfileFormData } from '../data/ProfileFormData';
import { authStyles } from '../styles/mainStyles';
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
			await axios.post('http://localhost:3000/api/contact-us', formData);
			console.log('Contact form submitted successfully!');
			setIsSuccessResponse(true);
			setIsErrorResponse(false);
		} catch (error) {
			console.error('Error submitting contact form:', error);
			setIsErrorResponse(true);
			setIsSuccessResponse(false);
			setErrorMessage(error.message || 'Error submitting contact form');
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
					responseMessage='تم إرسال رسالتك بنجاح!'
					actionMessage='سنقوم بالرد عليك قريبًا.'
					isSuccess={isSuccessResponse}
					isError={isErrorResponse}
					errorMessage={errorMessage}
				/>
				<Button
					onClick={handleSendAnotherMessage}
					className={button}
					style={{ marginTop: '20px' }}
				>
					إرسال رسالة أخرى
				</Button>
			</FormContainer>
		);
	}

	return (
		<FormContainer className={align}>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				تواصل معنا
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
										label='الاسم الشخصي '
										required
										{...field}
										error={Boolean(errors.firstname)}
										helperText={
											errors.firstname ? 'الاسم الشخصي مطلوب' : ''
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
										label='الاسم العائلي'
										required
										{...field}
										error={Boolean(errors.lastname)}
										helperText={errors.lastname ? 'الاسم العائلي مطلوب' : ''}
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
										label='البريد الإلكتروني'
										required
										{...field}
										error={Boolean(errors.email)}
										helperText={errors.email ? 'البريد الإلكتروني مطلوب' : ''}
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
										label='رقم الهاتف'
										required
										{...field}
										error={Boolean(errors.phoneNumber)}
										helperText={
											errors.phoneNumber ? 'رقم الهاتف مطلوب' : ''
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
									label='الموضوع'
									required
									{...field}
									error={Boolean(errors.subject)}
									helperText={errors.subject ? 'الموضوع مطلوب' : ''}
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
									label='الرسالة'
									required
									multiline
									rows={4}
									{...field}
									error={Boolean(errors.message)}
									helperText={errors.message ? 'الرسالة مطلوبة' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							إرسال
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default ContactForm;
