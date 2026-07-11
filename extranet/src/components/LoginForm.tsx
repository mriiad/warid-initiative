import {
	Button,
	CircularProgress,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../auth/AuthContext';
import { LoginFormData } from '../data/authData';
import { useAuth, useCheckProfileCompleteness } from '../hooks';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';
import SnackbarComponent from './shared/SnackbarComponent';

const LoginForm = () => {
	const { t } = useTranslation();
	const { setToken, setUserId, setIsAdmin } = useAuthContext();

	const { bar, button, signUp, form } = authStyles();
	const { textButton, subTitle } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<LoginFormData>({
		defaultValues: {
			username: '',
			password: '',
		},
	});

	const navigate = useNavigate();
	const location = useLocation();
	const passwordReset = location.state?.passwordReset;
	const [passwordResetSnackbarOpen, setPasswordResetSnackbarOpen] =
		useState(passwordReset);
	const [signUpSnackbarOpen, setSignUpSnackbarOpen] = useState(false);

	const { login } = useAuth();
	const { updateAuthState } = useAuthContext();
	const profileCompleteness = useCheckProfileCompleteness();

	useEffect(() => {
		if (new URLSearchParams(location.search).has('new-user')) {
			setSignUpSnackbarOpen(true);
		}
	}, [location]);

	useEffect(() => {
		if (login.isSuccess && login.data) {
			// Update AuthContext state immediately
			const { token, userId, isAdmin } = login.data.data;
			updateAuthState(token, userId, isAdmin);

			const params = new URLSearchParams(window.location.search);
			const redirectURL = params.get('redirect');

			if (redirectURL) {
				navigate(redirectURL);
				return;
			}

			// Check profile completeness and navigate accordingly
			if (
				profileCompleteness.data?.data &&
				!profileCompleteness.data.data.isProfileComplete
			) {
				navigate('/update-profile');
			} else {
				navigate('/dashboard');
			}
		}
	}, [
		login.isSuccess,
		login.data,
		profileCompleteness.data,
		navigate,
		updateAuthState,
	]);

	const onSubmit = (formData: LoginFormData) => {
		login.mutate(formData);
	};

	return (
		<FormContainer>
			{login.isPending ? (
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
						message={t('auth.login.passwordResetSuccess')}
						autoHideDuration={5000}
					/>
					<SnackbarComponent
						open={signUpSnackbarOpen}
						handleClose={() => setSignUpSnackbarOpen(false)}
						message={t('auth.login.signupSuccess')}
						autoHideDuration={5000}
					/>
					<Typography
						variant='h2'
						align='center'
						gutterBottom
						className={signUp}
					>
						{t('auth.login.title')}
						<span className={bar}></span>
					</Typography>
					<Typography variant='h6' align='center' gutterBottom>
						<span className={subTitle}>{t('auth.login.noAccount')}</span>
						<button
							type='button'
							className={textButton}
							onClick={() => navigate('/signup')}
							style={{
								background: 'none',
								border: 'none',
								padding: '8px 12px',
								font: 'inherit',
								cursor: 'pointer',
								textDecoration: 'underline',
								color: colors.rose,
								fontSize: 'inherit',
								lineHeight: 'inherit',
								display: 'inline-block',
								position: 'relative',
								zIndex: 10,
							}}
						>
							{t('auth.login.signup')}
						</button>
					</Typography>
					<form onSubmit={handleSubmit(onSubmit)} className={form}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<Controller
									name='username'
									control={control}
									rules={{ required: t('auth.login.usernameRequired') }}
									render={({ field }) => (
										<TextField
											fullWidth
											label={t('auth.login.username')}
											required
											{...field}
											error={Boolean(errors.username)}
											helperText={errors.username?.message || ''}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={12}>
								<Controller
									name='password'
									control={control}
									rules={{ required: t('auth.login.passwordRequired') }}
									render={({ field }) => (
										<TextField
											fullWidth
											type='password'
											label={t('auth.login.password')}
											required
											{...field}
											error={Boolean(errors.password)}
											helperText={errors.password?.message || ''}
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
									{t('auth.login.title')}
								</Button>
							</Grid>
							<Grid item xs={12}>
								<Typography variant='body2' align='center' gutterBottom>
									<button
										type='button'
										className={textButton}
										onClick={() => navigate('/request-reset-password')}
										style={{
											background: 'none',
											border: 'none',
											padding: '8px 12px',
											font: 'inherit',
											cursor: 'pointer',
											textDecoration: 'underline',
											color: colors.rose,
											fontSize: 'inherit',
											lineHeight: 'inherit',
											display: 'inline-block',
											position: 'relative',
											zIndex: 10,
										}}
									>
										{t('auth.login.forgotPassword')}
									</button>
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
