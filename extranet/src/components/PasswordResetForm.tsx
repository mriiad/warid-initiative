import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { authRedesignStyles } from '../styles/authRedesign';
import { useErrorToast } from './shared/ErrorToastProvider';

const PasswordResetForm = () => {
	const { t } = useTranslation();
	const { screen, header, backButton, title, subtitle, headerIcon, card, input, primaryButton } =
		authRedesignStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm();

	const navigate = useNavigate();
	const { showError } = useErrorToast();

	// Same shape as SignupForm's check, so a typo caught at signup is caught
	// here too rather than burning one of the few mailLimiter attempts on an
	// address that could never receive anything.
	const validateEmail = (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) || t('auth.passwordReset.invalidEmail');
	};

	const onSubmit = (formData) => {
		authService
			.requestPasswordReset(formData)
			.then(() => {
				// `resetLinkSent`, not the old `resetMessage`: LoginForm reads
				// `state.passwordReset` (set by ResetPasswordForm, meaning "your
				// password was changed") and now `state.resetLinkSent`. Nothing
				// ever read `resetMessage`, so asking for a reset link used to
				// land the user on /login with no confirmation at all -- and the
				// string itself was hardcoded English. See issue #412.
				navigate('/login', { state: { resetLinkSent: true } });
			})
			.catch((error) => {
				console.error('Error requesting password reset:', error);
				showError(error);
			});
	};

	return (
		<div className={screen}>
			<div className={header}>
				<IconButton
					className={backButton}
					aria-label={t('auth.passwordReset.back')}
					onClick={() => navigate(-1)}
				>
					<ArrowBackIcon />
				</IconButton>
				<div className={headerIcon}>
					<LockOutlinedIcon />
				</div>
				<Typography variant='h1' className={title}>
					{t('auth.passwordReset.title')}
				</Typography>
				<Typography variant='body2' className={subtitle}>
					{t('auth.passwordReset.subtitle')}
				</Typography>
			</div>
			<div className={card}>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<Controller
							name='email'
							control={control}
							defaultValue=''
							rules={{
								required: t('auth.passwordReset.emailRequired'),
								validate: validateEmail,
							}}
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.passwordReset.email')}
									required
									{...field}
									error={Boolean(errors.email)}
									helperText={(errors.email?.message as string) || ''}
								/>
							)}
						/>
						<Button type='submit' fullWidth className={primaryButton}>
							{t('auth.passwordReset.submit')}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default PasswordResetForm;
