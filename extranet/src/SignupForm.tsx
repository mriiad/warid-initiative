import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import styled from 'styled-components';

// TO-DO : react-query
interface FormData {
	username: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	email: string;
	gender: string;
	password: string;
	passwordConfirmation: string;
	phoneNumber: string;
	bloodGroup: string;
	lastDonationDate: string;
	donationType: string;
}

const FormContainer = styled.form`
	background: #ede4ff;
	border-radius: 20px;
	padding: 20px;
	margin-top: 20px;
	width: 50%;
`;

const useStyles = makeStyles((theme) => ({
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100vh',
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
		height: '100vh',
	},
	bar: {
		height: '4px',
		width: '55px',
		display: 'block',
		margin: '8px auto 0',
		backgroundColor: '#6528F7',
	},
	button: {
		background:
			'linear-gradient(90deg, rgba(118,5,186,1) 29%, rgba(159,7,204,1) 61%)',
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
}));

const SignupForm: React.FC = () => {
	const {
		container,
		imageContainer,
		image,
		formContainer,
		bar,
		button,
		formWrapper,
	} = useStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
		getValues,
	} = useForm<FormData>();

	const signUpMutation = useMutation((data: FormData) => {
		return axios.put('http://localhost:3000/api/auth/signup', data);
	});

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

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);

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

	const validatePasswordConfirmation = (value) => {
		const password = getValues('password'); // Get the value of the password field
		return password === value || 'Passwords do not match'; // Compare with the confirmation password field
	};

	return (
		<FormContainer>
			<div className={imageContainer}>
				<img src='your_image_url.jpg' alt='logo' className={image} />
			</div>
			<div className={formContainer}>
				<Box className={formWrapper}>
					<Typography variant='h3' align='center' gutterBottom>
						Sign Up
						<span className={bar}></span>
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)}>
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
											{...field}
											error={Boolean(errors.username)}
											helperText={errors.username ? 'Username is required' : ''}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={6}>
								<Controller
									name='firstName'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											label='First Name'
											{...field}
											error={Boolean(errors.firstName)}
											helperText={
												errors.firstName ? 'First Name is required' : ''
											}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={6}>
								<Controller
									name='lastName'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											label='Last Name'
											{...field}
											error={Boolean(errors.lastName)}
											helperText={
												errors.lastName ? 'Last Name is required' : ''
											}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Controller
									name='birthDate'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											type='date'
											label='Birth Date'
											{...field}
											error={Boolean(errors.birthDate)}
											helperText={
												errors.birthDate ? 'Birth Date is required' : ''
											}
											InputLabelProps={{
												shrink: true,
											}}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Controller
									name='gender'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											select
											label='Gender'
											{...field}
											error={Boolean(errors.gender)}
											helperText={errors.gender ? 'Gender is required' : ''}
										>
											<option value='male'>Male</option>
											<option value='female'>Female</option>
											<option value='other'>Other</option>
										</TextField>
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
							<Grid item xs={6}>
								<Controller
									name='password'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											type='password'
											label='Password'
											{...field}
											error={Boolean(errors.password)}
											helperText={errors.password ? 'Password is required' : ''}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={6}>
								<Controller
									name='passwordConfirmation'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											type='password'
											label='Password Confirmation'
											{...field}
											error={Boolean(errors.passwordConfirmation)}
											helperText={
												errors.passwordConfirmation
													? errors.passwordConfirmation.message
													: ''
											}
										/>
									)}
									rules={{
										required: 'Password Confirmation is required',
										validate: validatePasswordConfirmation,
									}}
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
											label='Phone Number'
											{...field}
											value={phoneNumber}
											onChange={onChange}
											error={Boolean(errors.phoneNumber)}
											helperText={
												errors.phoneNumber
													? 'Please enter a valid phone number'
													: ''
											}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={6}>
								<Controller
									name='bloodGroup'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											select
											label='Blood Group'
											{...field}
											error={Boolean(errors.bloodGroup)}
											helperText={
												errors.bloodGroup ? 'Blood Group is required' : ''
											}
										>
											<option value='A+'>A+</option>
											<option value='A-'>A-</option>
											<option value='B+'>B+</option>
											<option value='B-'>B-</option>
											<option value='AB+'>AB+</option>
											<option value='AB-'>AB-</option>
											<option value='O+'>O+</option>
											<option value='O-'>O-</option>
										</TextField>
									)}
								/>
							</Grid>
							<Grid item xs={6}>
								<Controller
									name='donationType'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											select
											label='Donation Type'
											{...field}
											error={Boolean(errors.donationType)}
											helperText={
												errors.donationType ? 'Donation Type is required' : ''
											}
										>
											<option value=''>Select a donation type</option>
											<option value='wholeBlood'>Whole Blood Donation</option>
											<option value='powerRed'>Power Red Donation</option>
											<option value='platelet'>Platelet Donation</option>
											<option value='plasma'>Plasma Donation</option>
										</TextField>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Controller
									name='lastDonationDate'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											type='date'
											label='Last Donation Date'
											{...field}
											error={Boolean(errors.lastDonationDate)}
											helperText={
												errors.lastDonationDate
													? 'Last Donation Date is required'
													: ''
											}
											InputLabelProps={{
												shrink: true,
											}}
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
		</FormContainer>
	);
};

export default SignupForm;
