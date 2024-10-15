import {
	Button,
	CircularProgress,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginFormData, SignupFormData } from '../data/authData';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';
import SnackbarComponent from './shared/SnackbarComponent';


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
	const [passwordResetSnackbarOpen, setPasswordResetSnackbarOpen] =
		useState(passwordReset);
	const [signUpSnackbarOpen, setSignUpSnackbarOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// This method will prevent showing another page (/events) while the 'check-profile' is in progress
	// CircularProgress will be displayed until the getting the boolean: isProfileComplete
	const checkProfileCompleteness = async () => {
		setIsLoading(true);
		try {
			const response = await axios.get('/api/user/check-profile');
			setIsLoading(false);
			console.log('response.data', response.data);
			const { isProfileComplete } = response.data;
			return isProfileComplete;
		} catch (error) {
			console.error('Error checking profile completeness:', error);
			setIsLoading(false);
			return false;
		}
	};

	useEffect(() => {
		if (new URLSearchParams(location.search).has('new-user')) {
			setSignUpSnackbarOpen(true);
		}
	}, [location]);

	const loginMutation = useMutation((data: SignupFormData) => {
		return axios.post('http://localhost:3000/api/auth/login', data);
	});

	const [, setIsFormSubmitted] = useState<boolean>(false);
	const onSubmit = (formData: SignupFormData) => {
		loginMutation.mutate(formData, {
			onSuccess: async (data) => {
				setToken(data.data.token);
				setUserId(data.data.userId);
				setIsAdmin(data.data.isAdmin);
				localStorage.setItem('token', data.data.token);
				localStorage.setItem('userId', data.data.userId);
				localStorage.setItem('isAdmin', String(data.data.isAdmin));
				localStorage.setItem('refreshToken', data.data.refreshToken);
				setIsFormSubmitted(true);
				const params = new URLSearchParams(window.location.search);
				const redirectURL = params.get('redirect');

				if (redirectURL) {
					navigate(redirectURL);
				}

				const isProfileComplete = await checkProfileCompleteness();
				console.log('isProfileComplete', isProfileComplete);
				if (!isProfileComplete) {
					navigate('/update-profile');
				} else {
					navigate('/events');
					//console.log('token is: ', localStorage.getItem('token'));
					
				}
			},
			onError: (error) => {
				console.error('Error logging in:', error);
			},
		});
	};

	return (
		<FormContainer>
			{isLoading ? (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CircularProgress />
				</div>
			) : (
				<>
					<SnackbarComponent
						open={passwordResetSnackbarOpen}
						handleClose={() => setPasswordResetSnackbarOpen(false)}
						message='!تمت إعادة تعيين كلمة المرور بنجاح'
						autoHideDuration={5000}
					/>
					<SnackbarComponent
						open={signUpSnackbarOpen}
						handleClose={() => setSignUpSnackbarOpen(false)}
						message='.تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول'
						autoHideDuration={5000}
					/>
					<Typography
						variant='h2'
						align='center'
						gutterBottom
						className={signUp}
					>
						تسجيل الدخول
						<span className={bar}></span>
					</Typography>
					<Typography variant='h6' align='center' gutterBottom>
						<span className={subTitle}>ليس لديك حساب؟</span>
						<span className={textButton} onClick={() => navigate('/signup')}>
							التسجيل
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
											label='اسم المستخدم'
											required
											{...field}
											error={Boolean(errors.username)}
											helperText={errors.username ? 'اسم المستخدم مطلوب' : ''}
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
											label='كلمة المرور'
											required
											{...field}
											error={Boolean(errors.password)}
											helperText={errors.password ? 'كلمة المرور مطلوبة' : ''}
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
									تسجيل الدخول
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
									هل نسيت كلمة المرور؟
								</Typography>
							</Grid>
						</Grid>
					</form>
				</>
			)}
		</FormContainer>
	);
};

export default LoginForm;
