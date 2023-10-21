import { Button, Grid, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { authStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const validatePasswordsMatch = (getValues) => (value) =>
	value === getValues('password') || 'Passwords do not match';

const ResetPasswordForm = () => {
	const { resetToken } = useParams();
	const navigate = useNavigate();
	const {
		handleSubmit,
		formState: { errors },
		control,
		getValues,
		setError,
	} = useForm();
	const { button } = authStyles();

	const onSubmit = async (formData) => {
		if (formData.password !== formData.confirmPassword) {
			setError('confirmPassword', {
				type: 'manual',
				message: 'Passwords do not match',
			});
			return;
		}

		try {
			await axios.post(
				`http://localhost:3000/api/auth/reset-password/${resetToken}`,
				{
					password: formData.password,
				}
			);
			navigate('/login', {
				state: {
					message:
						'Password reset successful! Please login with your new password.',
				},
			});
		} catch (error) {
			console.error('Error resetting password:', error);
		}
	};

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={button}>
				Reset Password
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='password'
							control={control}
							rules={{ required: 'Password is required' }}
							render={({ field }) => (
								<TextField
									fullWidth
									type='password'
									label='New Password'
									error={Boolean(errors.password)}
									helperText={errors.password ? errors.password.message : ''}
									{...field}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='confirmPassword'
							control={control}
							rules={{
								required: 'Please confirm your password',
								validate: validatePasswordsMatch(getValues),
							}}
							render={({ field }) => (
								<TextField
									fullWidth
									type='password'
									label='Confirm New Password'
									error={Boolean(errors.confirmPassword)}
									helperText={
										errors.confirmPassword ? errors.confirmPassword.message : ''
									}
									{...field}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							Reset Password
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default ResetPasswordForm;
