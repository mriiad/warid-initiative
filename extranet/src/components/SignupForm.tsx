import {
	Button,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../data/authData';
import { useAuth } from '../hooks';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const SignupForm = () => {
	const { t } = useTranslation();
	const { formField, bar, button, signUp, form } = authStyles();
	const { subTitle, textButton } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<SignupFormData>();

	const navigate = useNavigate();

	const { signup } = useAuth();

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

	const [, setPhoneNumber] = useState('');
	const onChange = (e) => {
		const re = /^[0-9\b]+$/;
		if (e.target.value === '' || re.test(e.target.value)) {
			setPhoneNumber(e.target.value);
		}
	};

	const validateEmail = (value) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(value) || t('auth.signup.invalidEmail');
	};

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				{t('auth.signup.title')}
				<span className={bar}></span>
			</Typography>
			<Typography variant='h6' align='center' gutterBottom>
				<span className={subTitle}>{t('auth.signup.haveAccount')} </span>
				<button
					type='button'
					className={textButton}
					onClick={() => navigate('/login')}
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
					{t('auth.signup.login')}
				</button>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='username'
							control={control}
							rules={{ required: t('auth.signup.cinRequired') }}
							render={({ field }) => (
								<TextField
									fullWidth
									label={t('auth.signup.cin')}
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
							name='email'
							control={control}
							rules={{
								required: t('auth.signup.emailRequired'),
								validate: validateEmail,
							}}
							render={({ field }) => (
								<TextField
									fullWidth
									label={t('auth.signup.email')}
									required
									{...field}
									error={Boolean(errors.email)}
									helperText={errors.email?.message || ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
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
								<TextField
									fullWidth
									type='password'
									required
									label={t('auth.signup.password')}
									{...field}
									error={Boolean(errors.password)}
									helperText={errors.password?.message || ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='phoneNumber'
							control={control}
							rules={{ required: t('auth.signup.phoneRequired') }}
							render={({ field }) => (
								<TextField
									fullWidth
									label={t('auth.signup.phone')}
									type='tel'
									required
									{...field}
									error={Boolean(errors.phoneNumber)}
									helperText={errors.phoneNumber?.message || ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12} className={formField}>
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
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							{t('auth.signup.submit')}
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default SignupForm;
