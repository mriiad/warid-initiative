import {
	Alert,
	Button,
	Grid,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginFormData } from '../data/authData';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const LoginForm = () => {
	const { setToken, setUserId, setIsAdmin } = useAuth();

	const { bar, button, signUp, form } = authStyles();
	const { textButton, subTitle } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<LoginFormData>();

	const navigate = useNavigate();
	const location = useLocation();
	const passwordReset = location.state?.passwordReset;
	const [openSnackbar, setOpenSnackbar] = useState(passwordReset);

	const handleCloseSnackbar = () => {
		setOpenSnackbar(false);
	};

	const loginMutation = useMutation((data: FormData) => {
		return axios.post('http://localhost:3000/api/auth/login', data);
	});

	const [, setIsFormSubmitted] = useState<boolean>(false);
	const onSubmit = (formData: FormData) => {
		loginMutation.mutate(formData, {
			onSuccess: (data) => {
				console.log('Login successful!');
				console.log('data: ', data);
				setToken(data.data.token);
				setUserId(data.data.userId);
				setIsAdmin(data.data.isAdmin);
				localStorage.setItem('token', data.data.token);
				localStorage.setItem('userId', data.data.userId);
				localStorage.setItem('isAdmin', String(data.data.isAdmin));
				localStorage.setItem('refreshToken', data.data.refreshToken);
				setIsFormSubmitted(true);
				navigate('/events?page=1');
			},
			onError: (error) => {
				console.error('Error logging in:', error);
			},
		});
	};

	return (
		<FormContainer>
			<Snackbar
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				open={openSnackbar}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
			>
				<Alert
					onClose={handleCloseSnackbar}
					style={{ backgroundColor: colors.green, color: 'white' }}
				>
					Your password has been reset successfully!
				</Alert>
			</Snackbar>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Log In
				<span className={bar}></span>
			</Typography>
			<Typography variant='h6' align='center' gutterBottom>
				<span className={subTitle}>Don't have an account? </span>
				<span className={textButton} onClick={() => navigate('/signup')}>
					Signup
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
					<Grid item xs={12}>
						<Typography
							variant='body2'
							align='center'
							gutterBottom
							className={textButton}
							onClick={() => navigate('/request-reset-password')}
						>
							Forgot Password?
						</Typography>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default LoginForm;
