import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Button, IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services';
import { authRedesignStyles } from '../styles/authRedesign';
import PasswordField from './shared/PasswordField';

type FormData = {
	password: string;
	confirmPassword: string;
};

const ResetPasswordForm = () => {
	const { t } = useTranslation();
	const { resetToken } = useParams();
	const navigate = useNavigate();
	const [isTokenValid, setIsTokenValid] = useState(true);
	// a state to track if the resetToken has been checked, this prevents the initial render of the component
	// in case the isTokenValid is false after checking its validity
	// so this avoids rendering the reset form for 1 second before displaying the invalidity message
	const [isTokenChecked, setIsTokenChecked] = useState(false);
	const {
		handleSubmit,
		control,
		getValues,
		setError,
		formState: { errors },
	} = useForm<FormData>();
	const { screen, header, backButton, title, subtitle, headerIcon, card, input, primaryButton, subtitleLink } =
		authRedesignStyles();

	const validatePasswordsMatch = (value: string) => {
		return value === getValues('password') || t('auth.resetPassword.passwordsMismatch');
	};

	const onSubmit = async (formData: FormData) => {
		if (formData.password !== formData.confirmPassword) {
			setError('confirmPassword', {
				type: 'manual',
				message: t('auth.resetPassword.passwordsMismatch'),
			});
			return;
		}

		try {
			await authService.resetPassword(resetToken ?? '', {
				password: formData.password,
			});
			navigate('/login', { state: { passwordReset: true } });
		} catch (error) {
			console.error('Error resetting password:', error);
		}
	};

	useEffect(() => {
		authService
			.checkResetToken(resetToken ?? '')
			.then((response) => {
				setIsTokenValid(true);
				console.log(response.data.message);
			})
			.catch((error) => {
				setIsTokenValid(false);
				console.error('Token is invalid or has expired:', error);
			})
			.finally(() => {
				setIsTokenChecked(true);
			});
	}, [resetToken]);

	const headerBlock = (
		<div className={header}>
			<IconButton
				className={backButton}
				aria-label={t('auth.resetPassword.back')}
				onClick={() => navigate(-1)}
			>
				<ArrowBackIcon />
			</IconButton>
			<div className={headerIcon}>
				<LockOutlinedIcon />
			</div>
			<Typography variant='h1' className={title}>
				{t('auth.resetPassword.title')}
			</Typography>
		</div>
	);

	if (!isTokenChecked) {
		return (
			<div className={screen}>
				{headerBlock}
				<div className={card}>
					<Typography variant='h6' align='center'>
						{t('auth.resetPassword.checking')}
					</Typography>
				</div>
			</div>
		);
	}

	if (!isTokenValid) {
		return (
			<div className={screen}>
				{headerBlock}
				<div className={card} style={{ alignItems: 'center', textAlign: 'center' }}>
					<Typography variant='h6' color='error'>
						{t('auth.resetPassword.invalidToken')}
					</Typography>
					<button
						type='button'
						className={subtitleLink}
						onClick={() => navigate('/request-reset-password')}
						style={{ marginTop: '8px' }}
					>
						{t('auth.resetPassword.resetAgain')}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={screen}>
			<div className={header}>
				<IconButton
					className={backButton}
					aria-label={t('auth.resetPassword.back')}
					onClick={() => navigate(-1)}
				>
					<ArrowBackIcon />
				</IconButton>
				<div className={headerIcon}>
					<LockOutlinedIcon />
				</div>
				<Typography variant='h1' className={title}>
					{t('auth.resetPassword.title')}
				</Typography>
				<Typography variant='body2' className={subtitle}>
					{t('auth.resetPassword.subtitle')}
				</Typography>
			</div>
			<div className={card}>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<Controller
							name='password'
							control={control}
							rules={{ required: t('auth.resetPassword.newPasswordRequired') }}
							render={({ field }) => (
								<PasswordField
									fullWidth
									className={input}
									required
									label={t('auth.resetPassword.newPassword')}
									showLabel={t('auth.login.showPassword')}
									hideLabel={t('auth.login.hidePassword')}
									{...field}
									error={Boolean(errors.password)}
									helperText={errors.password?.message}
								/>
							)}
						/>
						<Controller
							name='confirmPassword'
							control={control}
							rules={{
								required: t('auth.resetPassword.confirmPasswordRequired'),
								validate: validatePasswordsMatch,
							}}
							render={({ field }) => (
								<PasswordField
									fullWidth
									className={input}
									required
									label={t('auth.resetPassword.confirmPassword')}
									showLabel={t('auth.login.showPassword')}
									hideLabel={t('auth.login.hidePassword')}
									{...field}
									error={Boolean(errors.confirmPassword)}
									helperText={errors.confirmPassword?.message}
								/>
							)}
						/>
						<Button type='submit' fullWidth className={primaryButton}>
							{t('auth.resetPassword.submit')}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ResetPasswordForm;
