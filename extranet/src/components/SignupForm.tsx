import {
	Checkbox,
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
import { SignupFormData } from '@/types';
import { useAuth } from '../hooks';
import { authRedesignStyles } from '../styles/authRedesign';
import AuthHeader from './shared/AuthHeader';
import GoogleButton from './shared/GoogleButton';
import PasswordField from './shared/PasswordField';
import PhoneNumberField from './shared/PhoneNumberField';
import SnackbarComponent from './shared/SnackbarComponent';

const SignupForm = () => {
	const { t } = useTranslation();
	const {
		screen,
		card,
		input,
		primaryButton,
		divider,
		subtitleLink,
		link,
	} = authRedesignStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<SignupFormData>();

	const navigate = useNavigate();

	const { signup } = useAuth();
	const [googleSnackbarOpen, setGoogleSnackbarOpen] = useState(false);

	const onSubmit = ({ privacyConsent: _privacyConsent, ...formData }: SignupFormData) => {
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

	const validatePhoneNumber = (value: string) => {
		return /^\+[1-9]\d{6,14}$/.test(value) || t('auth.signup.phoneInvalid');
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
					message={t('auth.signup.googleNotAvailable')}
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
						<Controller
							name='phoneNumber'
							control={control}
							rules={{
								required: t('auth.signup.phoneRequired'),
								validate: validatePhoneNumber,
							}}
							render={({ field: { ref: _ref, ...field } }) => (
								<PhoneNumberField
									label={t('auth.signup.phone')}
									{...field}
									error={Boolean(errors.phoneNumber)}
									helperText={errors.phoneNumber?.message || ''}
								/>
							)}
						/>
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
						<Controller
							name='privacyConsent'
							control={control}
							defaultValue={false}
							rules={{ required: t('auth.signup.privacyConsentRequired') }}
							render={({ field: { value, onChange, ...field } }) => (
								<FormControl error={Boolean(errors.privacyConsent)}>
									<FormControlLabel
										control={
											<Checkbox
												{...field}
												checked={value}
												onChange={(e) => onChange(e.target.checked)}
											/>
										}
										label={
											<span>
												{t('auth.signup.privacyConsentPrefix')}
												{/* stopPropagation -- FormControlLabel wraps the whole
													label in a native <label>, which activates the
													checkbox on any click inside it, including this
													link; without this, opening the PDF would also
													toggle/uncheck the box. */}
												<a
													href='/files/Warid_Policies.pdf'
													target='_blank'
													rel='noopener noreferrer'
													className={link}
													onClick={(e) => e.stopPropagation()}
												>
													{t('landing.privacyPolicy')}
												</a>
											</span>
										}
									/>
									{errors.privacyConsent && (
										<FormHelperText>{errors.privacyConsent.message}</FormHelperText>
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
