import {
	Box,
	Button,
	Container,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'react-phone-number-input/style.css';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../data/authData';
import { authStyles, mainStyles } from '../styles/mainStyles';

const SignupForm = () => {
	const { container, formContainer, bar, button, formWrapper, signUp, form } =
		authStyles();
	const { subTitle, textButton } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<SignupFormData>();

	const navigate = useNavigate();

	const signUpMutation = useMutation((data: FormData) => {
		return axios.put('http://localhost:3000/api/auth/signup', data);
	});

	const [, setIsFormSubmitted] = useState<boolean>(false);
	const onSubmit = (formData: FormData) => {
		signUpMutation.mutate(formData, {
			onSuccess: () => {
				console.log('Form submitted successfully!');
				setIsFormSubmitted(true);
			},
			onError: (error) => {
				console.error('Error submitting form:', error);
			},
		});
	};

	const [, setPhoneNumber] = useState('');
	const onChange = (e) => {
		const re = /^[0-9\b]+$/;
		if (e.target.value === '' || re.test(e.target.value)) {
			setPhoneNumber(e.target.value);
		}
	};

	const validateEmail = (value) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) || 'Please enter a valid email address.';
	};

	return (
		<Container maxWidth='md' className={container}>
			<div className={formContainer}>
				<Box className={formWrapper}>
					<Typography
						variant='h2'
						align='center'
						gutterBottom
						className={signUp}
					>
						Sign Up
						<span className={bar}></span>
					</Typography>
					<Typography variant='h6' align='center' gutterBottom>
						<span className={subTitle}>Do you have an account?</span>{' '}
						<span className={textButton} onClick={() => navigate('/login')}>
							Login
						</span>
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)} className={form}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<Controller
									name='username'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											label='Username'
											required
											{...field}
											error={Boolean(errors.username)}
											helperText={errors.username ? 'Username is required' : ''}
										/>
									)}
								/>
							</Grid>
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
											helperText={errors.email?.message || ''}
										/>
									)}
									rules={{
										required: 'Email is required',
										validate: validateEmail,
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<Controller
									name='password'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											type='password'
											required
											label='Password'
											{...field}
											error={Boolean(errors.password)}
											helperText={errors.password ? 'Password is required' : ''}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Controller
									name='phoneNumber'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											label='Phone number'
											type='tel'
											required
											{...field}
											error={Boolean(errors.username)}
											helperText={errors.username ? 'Username is required' : ''}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Button
									type='submit'
									color='primary'
									style={{ color: 'white' }}
									className={button}
								>
									Submit
								</Button>
							</Grid>
						</Grid>
					</form>
				</Box>
			</div>
		</Container>
	);
};

export default SignupForm;
