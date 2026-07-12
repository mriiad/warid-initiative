import {
	FormControl,
	FormControlLabel,
	FormHelperText,
	Radio,
	RadioGroup,
	TextField,
	Button,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../data/authData';
import { useAuth } from '../hooks';
import { authRedesignStyles } from '../styles/authRedesign';
import AuthHeader from './shared/AuthHeader';
import GoogleButton from './shared/GoogleButton';
import PasswordField from './shared/PasswordField';
import SnackbarComponent from './shared/SnackbarComponent';

const SignupForm = () => {
	const { t } = useTranslation();
	const {
		screen,
		card,
		input,
		primaryButton,
		divider,
		phoneRow,
		countryChip,
		subtitleLink,
	} = authRedesignStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<SignupFormData>();

	const navigate = useNavigate();

	const { signup } = useAuth();
	const [googleSnackbarOpen, setGoogleSnackbarOpen] = useState(false);

	const onSubmit = (formData: SignupFormData) => {
		signup.mutate(formData as any, {
			onSuccess: () => {
				navigate('/login?new-user');
			},
			onError: (error) => {
				console.error('Error submitting form:', error);
			},
		});
	};

	const validateEmail = (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) || t('auth.signup.invalidEmail');
	};

	const validatePhoneDigits = (value: string) => {
		return /^[0-9]+$/.test(value) || t('auth.signup.phoneRequired');
	};

	return (
		<div className={screen}>
			<AuthHeader
				title={t('auth.signup.title')}
				backLabel={t('auth.signup.back')}
				subtitle={
					<>
						{t('auth.signup.haveAccount')}
						<button
							type='button'
							className={subtitleLink}
							onClick={() => navigate('/login')}
						>
							{t('auth.signup.login')}
						</button>
					</>
				}
			/>
			<div className={card}>
				<SnackbarComponent
					open={googleSnackbarOpen}
					handleClose={() => setGoogleSnackbarOpen(false)}
					message={t('auth.signup.signupWithGoogle')}
					autoHideDuration={3000}
				/>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<Controller
							name='username'
							control={control}
							rules={{ required: t('auth.signup.cinRequired') }}
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.signup.cin')}
									required
									{...field}
									error={Boolean(errors.username)}
									helperText={errors.username?.message || ''}
								/>
							)}
						/>
						<Controller
							name='email'
							control={control}
							rules={{
								required: t('auth.signup.emailRequired'),
								validate: validateEmail,
							}}
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.signup.email')}
									required
									{...field}
									error={Boolean(errors.email)}
									helperText={errors.email?.message || ''}
								/>
							)}
						/>
						<Controller
							name='password'
							control={control}
							rules={{
								required: t('auth.signup.passwordRequired'),
								minLength: {
									value: 6,
									message: t('auth.signup.passwordMinLength'),
								},
							}}
							render={({ field }) => (
								<PasswordField
									fullWidth
									className={input}
									required
									label={t('auth.signup.password')}
									showLabel={t('auth.signup.showPassword')}
									hideLabel={t('auth.signup.hidePassword')}
									{...field}
									error={Boolean(errors.password)}
									helperText={errors.password?.message || ''}
								/>
							)}
						/>
						<div className={phoneRow}>
							<div className={countryChip} aria-hidden='true'>
								🇲🇦
							</div>
							<Controller
								name='phoneNumber'
								control={control}
								rules={{
									required: t('auth.signup.phoneRequired'),
									validate: validatePhoneDigits,
								}}
								render={({ field }) => (
									<TextField
										fullWidth
										className={input}
										label={t('auth.signup.phone')}
										type='tel'
										required
										{...field}
										error={Boolean(errors.phoneNumber)}
										helperText={errors.phoneNumber?.message || ''}
									/>
								)}
							/>
						</div>
						<Controller
							name='gender'
							control={control}
							defaultValue=''
							rules={{ required: t('auth.signup.genderRequired') }}
							render={({ field }) => (
								<FormControl
									component='fieldset'
									fullWidth
									error={Boolean(errors.gender)}
								>
									<RadioGroup row {...field}>
										<FormControlLabel
											value='male'
											control={<Radio />}
											label={t('auth.signup.male')}
										/>
										<FormControlLabel
											value='female'
											control={<Radio />}
											label={t('auth.signup.female')}
										/>
									</RadioGroup>
									{errors.gender && (
										<FormHelperText>{errors.gender.message}</FormHelperText>
									)}
								</FormControl>
							)}
						/>
						<Button type='submit' fullWidth className={primaryButton}>
							{t('auth.signup.submit')}
						</Button>
						<div className={divider}>{t('auth.signup.orSignupWith')}</div>
						<GoogleButton onClick={() => setGoogleSnackbarOpen(true)}>
							{t('auth.signup.signupWithGoogle')}
						</GoogleButton>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SignupForm;
