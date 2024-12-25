import { Button, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { SignupFormData } from '../data/authData';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';
import { useTranslation } from 'react-i18next';

const SignupForm = () => {
	const { t }: { t: (key: string) => string } = useTranslation();
	const { formField, bar, button, signUp, form } = authStyles();
	const { subTitle, textButton } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<SignupFormData>();

	const navigate = useNavigate();

	const signUpMutation = useMutation((data: SignupFormData) => {
		return axios.put('http://localhost:3000/api/auth/signup', data);
	});

	const [, setIsFormSubmitted] = useState<boolean>(false);
	const onSubmit = (formData: SignupFormData) => {
		signUpMutation.mutate(formData, {
		  onSuccess: () => {
			console.log('Form submitted successfully!');
			setIsFormSubmitted(true);
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
		return emailRegex.test(value) || t('signup.InvalidEmail') ;
	};

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>	
			    {t('signup.SignUp')}
				<span className={bar}></span>
			</Typography>
			<Typography variant='h6' align='center' gutterBottom>
				<span className={subTitle}>
				    {t('signup.HaveAccount')}
				</span>
				<span className={textButton} onClick={() => navigate('/login')}>
				    {t('signup.Login')}  
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
									label={t('signup.CIN')}
									required
									{...field}
									error={Boolean(errors.username)}
									helperText={errors.username ? t('signup.CINRequired') : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='email'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label={t('signup.Email')}
									required
									{...field}
									error={Boolean(errors.email)}
									helperText={errors.email?.message || ''}
								/>
							)}
							rules={{
								required: t('signup.EmailRequired'),
								validate: validateEmail,
							}}
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
									required
									label= {t('signup.Password')}
									{...field}
									error={Boolean(errors.password)}
									helperText={errors.password ? t('signup.PasswordRequired') : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='phoneNumber'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label= {t('signup.Tel')}
									type='tel'
									required
									{...field}
									error={Boolean(errors.username)}
									helperText={errors.username ? 'اسم المستخدم مطلوب' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
						    {t('signup.Submit')}
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default SignupForm;
