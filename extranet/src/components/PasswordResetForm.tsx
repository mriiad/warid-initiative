import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { authRedesignStyles } from '../styles/authRedesign';

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

	const onSubmit = (formData) => {
		authService
			.requestPasswordReset(formData)
			.then((response) => {
				console.log('Reset password request sent successfully!');
				navigate('/login', {
					state: {
						resetMessage: 'Please check your email for a password reset link.',
					},
				});
			})
			.catch((error) => {
				console.error('Error requesting password reset:', error);
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
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.passwordReset.email')}
									required
									{...field}
									error={Boolean(errors.email)}
									helperText={errors.email ? t('auth.passwordReset.emailRequired') : ''}
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
