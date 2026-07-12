import { Button, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authStyles } from '../styles/mainStyles';
import API_CONFIG, { buildApiUrl } from '../utils/apiConfig';
import FormContainer from './shared/FormContainer';

const PasswordResetForm = () => {
	const { t } = useTranslation();
	const { bar, button, signUp, form } = authStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm();

	const navigate = useNavigate();

	const onSubmit = (formData) => {
		axios
			.post(buildApiUrl(API_CONFIG.endpoints.auth.requestReset), formData)
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
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				{t('auth.passwordReset.title')}
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='email'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label={t('auth.passwordReset.email')}
									required
									{...field}
									error={Boolean(errors.email)}
									helperText={
										errors.email ? t('auth.passwordReset.emailRequired') : ''
									}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button
							type='submit'
							color='primary'
							className={button}
							style={{ color: 'white' }}
						>
							{t('auth.passwordReset.submit')}
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default PasswordResetForm;
