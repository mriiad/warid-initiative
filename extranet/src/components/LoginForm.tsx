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
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { LoginFormData } from '../data/authData';
import { authStyles, mainStyles } from '../styles/mainStyles';

const LoginForm = () => {
	const { container, formContainer, bar, button, formWrapper, signUp, form } =
		authStyles();
	const { textButton } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<LoginFormData>();

	const navigate = useNavigate();

	const loginMutation = useMutation((data: FormData) => {
		return axios.post('http://localhost:3000/api/auth/login', data); // Adjust the URL as needed for your API endpoint
	});

	const [, setIsFormSubmitted] = useState<boolean>(false);
	const onSubmit = (formData: FormData) => {
		loginMutation.mutate(formData, {
			onSuccess: () => {
				console.log('Login successful!');
				setIsFormSubmitted(true);
				// Redirect to a different route upon successful login
				navigate('/signup'); // Adjust the route as needed
			},
			onError: (error) => {
				console.error('Error logging in:', error);
			},
		});
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
						Log In
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
									name='password'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<TextField
											fullWidth
											type='password'
											label='Password'
											required
											{...field}
											error={Boolean(errors.password)}
											helperText={errors.password ? 'Password is required' : ''}
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
									Log In
								</Button>
							</Grid>
						</Grid>
					</form>
				</Box>
			</div>
		</Container>
	);
};

export default LoginForm;
