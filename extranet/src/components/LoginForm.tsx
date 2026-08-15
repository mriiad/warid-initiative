import { Button, Checkbox, CircularProgress, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../auth/AuthContext';
import { LoginFormData } from '../data/authData';
import { useAuth, useCheckProfileCompleteness } from '../hooks';
import { authRedesignStyles } from '../styles/authRedesign';
import AuthHeader from './shared/AuthHeader';
import GoogleButton from './shared/GoogleButton';
import PasswordField from './shared/PasswordField';
import SnackbarComponent from './shared/SnackbarComponent';

const LoginForm = () => {
	const { t } = useTranslation();

	const {
		screen,
		card,
		input,
		primaryButton,
		divider,
		inlineRow,
		rememberMe,
		link,
		footerText,
		subtitleLink,
	} = authRedesignStyles();
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
	const [googleSnackbarOpen, setGoogleSnackbarOpen] = useState(false);
	const [rememberMeChecked, setRememberMeChecked] = useState(false);
	const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);

	const { login } = useAuth();
	const { updateAuthState } = useAuthContext();
	const profileCompleteness = useCheckProfileCompleteness();

	useEffect(() => {
		if (new URLSearchParams(location.search).has('new-user')) {
			setSignUpSnackbarOpen(true);
		}
	}, [location]);

	useEffect(() => {
		if (login.isSuccess && login.data && profileCompleteness.data) {
			// Update AuthContext state immediately
			const { token, userId, isAdmin } = login.data.data;
			updateAuthState(token, userId, isAdmin);

			const params = new URLSearchParams(window.location.search);
			const redirectURL = params.get('redirect');

			if (redirectURL) {
				navigate(redirectURL);
				return;
			}

			// Navigate based on profile completeness
			const isProfileComplete = profileCompleteness.data.data.isProfileComplete;
			if (!isProfileComplete) {
				navigate('/update-profile');
			} else if (isAdmin) {
				// '/dashboard' unconditionally renders the donor Dashboard --
				// an admin landing there sees "you haven't donated yet, join
				// our community of heroes" instead of their actual overview
				// (stats, unconfirmed emergencies, next event). '/home'
				// already resolves to AdminDashboard for an admin (see
				// App.tsx), so send them there instead.
				navigate('/home');
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

	useEffect(() => {
		// A wrong password or unknown username both come back as a plain 401
		// with a specific message (see auth.js); nothing here ever read it, so
		// a rejected login just left the form sitting there with the spinner
		// gone and no explanation.
		if (login.isError) {
			const backendMessage = (
				login.error as { response?: { data?: { message?: string } } }
			)?.response?.data?.message;
			setLoginErrorMessage(backendMessage || t('auth.login.invalidCredentials'));
		}
	}, [login.isError, login.error, t]);

	const onSubmit = (formData: LoginFormData) => {
		// Clear any previous failure so a retry doesn't sit next to a stale
		// error, and so the snackbar re-opens even if the message is identical.
		setLoginErrorMessage(null);
		login.mutate(formData);
	};

	return (
		<div className={screen}>
			<AuthHeader
				title={t('auth.login.title')}
				backLabel={t('auth.login.back')}
				subtitle={
					<>
						{t('auth.login.noAccount')}
						<button
							type='button'
							className={subtitleLink}
							onClick={() => navigate('/signup')}
						>
							{t('auth.login.signup')}
						</button>
					</>
				}
			/>
			<div className={card}>
				{login.isPending ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							padding: '32px 0',
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
						<SnackbarComponent
							open={googleSnackbarOpen}
							handleClose={() => setGoogleSnackbarOpen(false)}
							message={t('auth.login.continueWithGoogle')}
							autoHideDuration={3000}
						/>
						<SnackbarComponent
							open={Boolean(loginErrorMessage)}
							handleClose={() => setLoginErrorMessage(null)}
							message={loginErrorMessage || ''}
							autoHideDuration={6000}
						/>
						<GoogleButton onClick={() => setGoogleSnackbarOpen(true)}>
							{t('auth.login.continueWithGoogle')}
						</GoogleButton>
						<div className={divider}>{t('auth.login.orLoginWith')}</div>
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
								<Controller
									name='username'
									control={control}
									rules={{ required: t('auth.login.usernameRequired') }}
									render={({ field }) => (
										<TextField
											fullWidth
											className={input}
											label={t('auth.login.username')}
											required
											{...field}
											error={Boolean(errors.username)}
											helperText={errors.username?.message || ''}
										/>
									)}
								/>
								<Controller
									name='password'
									control={control}
									rules={{ required: t('auth.login.passwordRequired') }}
									render={({ field }) => (
										<PasswordField
											fullWidth
											className={input}
											label={t('auth.login.password')}
											required
											showLabel={t('auth.login.showPassword')}
											hideLabel={t('auth.login.hidePassword')}
											{...field}
											error={Boolean(errors.password)}
											helperText={errors.password?.message || ''}
										/>
									)}
								/>
								<div className={inlineRow}>
									<label className={rememberMe}>
										<Checkbox
											checked={rememberMeChecked}
											onChange={(e) => setRememberMeChecked(e.target.checked)}
										/>
										{t('auth.login.rememberMe')}
									</label>
									<button
										type='button'
										className={link}
										onClick={() => navigate('/request-reset-password')}
									>
										{t('auth.login.forgotPassword')}
									</button>
								</div>
								<Button type='submit' fullWidth className={primaryButton}>
									{t('auth.login.title')}
								</Button>
							</div>
						</form>
						<div className={footerText}>
							{t('auth.login.noAccount')}{' '}
							<button
								type='button'
								className={link}
								onClick={() => navigate('/signup')}
							>
								{t('auth.login.signup')}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default LoginForm;
