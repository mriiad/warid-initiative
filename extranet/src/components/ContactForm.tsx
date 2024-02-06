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
					responseMessage='Your message has been sent successfully!'
					actionMessage='We will get back to you shortly.'
					isSuccess={isSuccessResponse}
					isError={isErrorResponse}
					errorMessage={errorMessage}
				/>
				<Button
					onClick={handleSendAnotherMessage}
					className={button}
					style={{ marginTop: '20px' }}
				>
					Send another message
				</Button>
			</FormContainer>
		);
	}

	return (
		<FormContainer className={align}>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Contact Us
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
										label='First Name'
										required
										{...field}
										error={Boolean(errors.firstname)}
										helperText={
											errors.firstname ? 'First name is required' : ''
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
										label='Last Name'
										required
										{...field}
										error={Boolean(errors.lastname)}
										helperText={errors.lastname ? 'Last name is required' : ''}
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
										label='Email'
										required
										{...field}
										error={Boolean(errors.email)}
										helperText={errors.email ? 'Email is required' : ''}
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
										label='Phone Number'
										required
										{...field}
										error={Boolean(errors.phoneNumber)}
										helperText={
											errors.phoneNumber ? 'Phone number is required' : ''
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
									label='Subject'
									required
									{...field}
									error={Boolean(errors.subject)}
									helperText={errors.subject ? 'Subject is required' : ''}
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
									label='Message'
									required
									multiline
									rows={4}
									{...field}
									error={Boolean(errors.message)}
									helperText={errors.message ? 'Message is required' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							Submit
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default ContactForm;
