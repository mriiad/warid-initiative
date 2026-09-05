import { Button, Checkbox, CircularProgress, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../auth/AuthContext';
import { LoginFormData } from '@/types';
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
	// Distinct from `passwordReset` above, which means "your password was
	// changed" (set by ResetPasswordForm). This one means "we've emailed you a
	// link", set by PasswordResetForm -- which used to pass an unread
	// `resetMessage` key instead, so the request silently confirmed nothing.
	// See issue #412.
	const resetLinkSent = location.state?.resetLinkSent;
	const [resetLinkSnackbarOpen, setResetLinkSnackbarOpen] =
		useState(resetLinkSent);
	const [signUpSnackbarOpen, setSignUpSnackbarOpen] = useState(false);
	const [googleSnackbarOpen, setGoogleSnackbarOpen] = useState(false);
	const [rememberMeChecked, setRememberMeChecked] = useState(false);
	const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
	const [resendEmail, setResendEmail] = useState('');
	const [resendSnackbarOpen, setResendSnackbarOpen] = useState(false);

	const { login, resendActivation } = useAuth();
	const { updateAuthState } = useAuthContext();
	// Gated on login.isSuccess: this hits an isAuth-gated backend route, so
	// firing it before then (i.e. on every /login page load, unauthenticated)
	// was a guaranteed 401. That request wasn't wasted so much as dangerous --
	// see the note on the redirect effect below (issue #195).
	const profileCompleteness = useCheckProfileCompleteness(login.isSuccess);

	useEffect(() => {
		if (new URLSearchParams(location.search).has('new-user')) {
			setSignUpSnackbarOpen(true);
		}
	}, [location]);

	useEffect(() => {
		if (login.isSuccess && login.data && profileCompleteness.data) {
			// Update AuthContext state immediately
			const { token, userId, isAdmin, role } = login.data.data;
			updateAuthState(token, userId, isAdmin, role ?? null);

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

	// Login refuses an unconfirmed account with 403 (see issue #357) -- it's
	// the only case login ever returns 403 for, so the status code alone is
	// enough to know this is that case, without matching on message text.
	const isUnconfirmedAccount =
		(login.error as { response?: { status?: number } } | null)?.response
			?.status === 403;

	const onSubmit = (formData: LoginFormData) => {
		// Clear any previous failure so a retry doesn't sit next to a stale
		// error, and so the snackbar re-opens even if the message is identical.
		setLoginErrorMessage(null);
		login.mutate(formData);
	};

	const handleResendActivation = () => {
		resendActivation.mutate(
			{ email: resendEmail },
			{ onSuccess: () => setResendSnackbarOpen(true) }
		);
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
							open={resetLinkSnackbarOpen}
							handleClose={() => setResetLinkSnackbarOpen(false)}
							message={t('auth.login.resetLinkSent')}
							autoHideDuration={8000}
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
							message={t('auth.login.googleNotAvailable')}
							autoHideDuration={3000}
						/>
						<SnackbarComponent
							open={Boolean(loginErrorMessage)}
							handleClose={() => setLoginErrorMessage(null)}
							message={loginErrorMessage || ''}
							autoHideDuration={6000}
						/>
						<SnackbarComponent
							open={resendSnackbarOpen}
							handleClose={() => setResendSnackbarOpen(false)}
							message={t('auth.login.resendActivationSuccess')}
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
						{isUnconfirmedAccount && (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: '8px',
									marginTop: '16px',
								}}
							>
								<TextField
									fullWidth
									className={input}
									label={t('auth.login.resendActivationEmail')}
									type='email'
									value={resendEmail}
									onChange={(e) => setResendEmail(e.target.value)}
								/>
								<Button
									type='button'
									fullWidth
									className={primaryButton}
									onClick={handleResendActivation}
									disabled={resendActivation.isPending || !resendEmail}
								>
									{t('auth.login.resendActivationSubmit')}
								</Button>
							</div>
						)}
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
