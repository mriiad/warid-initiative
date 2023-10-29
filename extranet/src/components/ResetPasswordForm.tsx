import { Button, Grid, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

type FormData = {
	password: string;
	confirmPassword: string;
};

const useResetPasswordFormStyles = makeStyles({
	errorText: {
		textAlign: 'center',
		color: '#d32f2f',
		marginBottom: '16px',
	},
	forgotPasswordText: {
		'&.MuiGrid-root': {
			textAlign: 'center',
			marginTop: '20px',
		},
	},
});

const ResetPasswordForm = () => {
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
	const { bar, button, signUp, form } = authStyles();
	const { textButton } = mainStyles();
	const { errorText, forgotPasswordText } = useResetPasswordFormStyles();

	const validatePasswordsMatch = (value: string) => {
		return value === getValues('password') || 'Passwords do not match';
	};

	const onSubmit = async (formData: FormData) => {
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
			navigate('/login', { state: { passwordReset: true } });
		} catch (error) {
			console.error('Error resetting password:', error);
		}
	};

	useEffect(() => {
		axios
			.get(`http://localhost:3000/api/auth/check-reset-token/${resetToken}`)
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

	if (!isTokenChecked) {
		return (
			<FormContainer>
				<Typography variant='h6' align='center'>
					Checking token validity...
				</Typography>
			</FormContainer>
		);
	}

	if (!isTokenValid) {
		return (
			<FormContainer>
				<Typography variant='h6' className={errorText}>
					This password reset link is invalid or has expired.
				</Typography>
				<Grid container justifyContent='center'>
					<Grid item className={forgotPasswordText}>
						<Typography
							variant='body2'
							className={textButton}
							onClick={() => navigate('/request-reset-password')}
						>
							Reset again?
						</Typography>
					</Grid>
				</Grid>
			</FormContainer>
		);
	}

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Reset Password
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
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
									required
									error={Boolean(errors.password)}
									helperText={errors.password?.message}
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
								validate: validatePasswordsMatch,
							}}
							render={({ field }) => (
								<TextField
									fullWidth
									type='password'
									label='Confirm New Password'
									required
									error={Boolean(errors.confirmPassword)}
									helperText={errors.confirmPassword?.message}
									{...field}
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
							Reset Password
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default ResetPasswordForm;
