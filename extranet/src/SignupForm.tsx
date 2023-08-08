import {
	Box,
	Button,
	Container,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import 'react-phone-number-input/style.css';
import { useMutation } from 'react-query';

interface FormData {
	username: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	email: string;
	gender: string;
	password: string;
	phoneNumber: string;
	bloodGroup: string;
	lastDonationDate: string;
	donationType: string;
}

const useStyles = makeStyles({
	formWrapper: {
		background: 'rgba(252, 252, 252, 0.25)',
		borderRadius: '20px',
		padding: '20px',
		marginTop: '20px',
		width: '70%',
	},
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	imageContainer: {
		flexBasis: '100%',
	},
	image: {
		width: '100%',
		height: 'auto',
	},
	formContainer: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bar: {
		height: '4px',
		width: '55px',
		display: 'block',
		margin: '8px auto 0',
		backgroundColor: 'rgb(59, 42, 130)',
	},
	button: {
		background:
			'linear-gradient(90deg, rgb(193, 46, 111) 100%, rgba(159,7,204,1) 0%)',
		borderRadius: '10px',
		padding: '10px 20px',
		fontSize: '16px',
		border: 'none',
		boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
		transition: 'transform 0.3s ease',
		cursor: 'pointer',
		'&:hover': {
			transform: 'scale(1.1)',
		},
	},
	signUp: {
		color: 'rgb(255, 48, 103)',
	},
	form: {
		textAlign: 'center',
	},
});

const SignupForm: React.FC = () => {
	const { container, formContainer, bar, button, formWrapper, signUp, form } =
		useStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<FormData>();

	const signUpMutation = useMutation((data: FormData) => {
		return axios.put('http://localhost:3000/api/auth/signup', data);
	});

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
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

	const [phoneNumber, setPhoneNumber] = useState('');
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
						variant='h3'
						align='center'
						gutterBottom
						className={signUp}
					>
						Sign Up
						<span className={bar}></span>
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
