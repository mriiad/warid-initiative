// ContactForm.tsx
import { Button, Grid, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authStyles } from '../styles/mainStyles';
import { fetchUserProfile } from '../utils/queries';
import FormContainer from './shared/FormContainer';

const useStyles = makeStyles({
	align: {
		marginBottom: '80px',
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
	const { align } = useStyles();
	const navigate = useNavigate();

	const [localUserProfile, setLocalUserProfile] = useState(null);

	const { data: userProfile, isLoading: isProfileLoading } = useQuery(
		'userProfile',
		fetchUserProfile,
		{
			enabled: !!token,
			cacheTime: 0,
			staleTime: 0,
			onSuccess: (data) => {
				setLocalUserProfile(userProfile);
			},
			onError: (err: any) => {
				if (err.response && err.response.status === 401) {
					setLocalUserProfile(null);
				}
			},
		}
	);

	const { firstname, lastname } = localUserProfile || {};

	const {
		handleSubmit,
		formState: { errors },
		control,
		setValue,
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
			setValue('email', localUserProfile.email || '');
			setValue('phoneNumber', localUserProfile.phoneNumber || '');
		}
		if (!token) setLocalUserProfile(null);
	}, [localUserProfile, setValue, isProfileLoading, token]);

	const contactMutation = useMutation((data: ContactFormData) => {
		return axios.post('http://localhost:3000/api/contact-us', data);
	});

	const onSubmit = (formData: ContactFormData) => {
		contactMutation.mutate(formData, {
			onSuccess: () => {
				console.log('Contact form submitted successfully!');
				navigate('/');
			},
			onError: (error) => {
				console.error('Error submitting contact form:', error);
			},
		});
	};

	return (
		<FormContainer className={align}>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Contact Us
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					{!firstname && (
						<Grid item xs={12}>
							<Controller
								name='firstname'
								control={control}
								defaultValue=''
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
					{!lastname && (
						<Grid item xs={12}>
							<Controller
								name='lastname'
								control={control}
								defaultValue=''
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
								defaultValue=''
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
								defaultValue=''
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
							defaultValue=''
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
							defaultValue=''
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
