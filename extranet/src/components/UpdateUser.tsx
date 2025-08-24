import {
	Button,
	FormControl,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { BLOOD_GROUP_OPTIONS } from '../data/constants';
import { authStyles } from '../styles/mainStyles';
import { cities } from '../utils/utils';
import FormContainer from './shared/FormContainer';
import SnackbarComponent from './shared/SnackbarComponent';

const useStyles = makeStyles({
	align: {
		marginTop: '-20px',
	},
});

interface UpdateUserFormData {
	firstname: string;
	lastname: string;
	birthdate: string;
	bloodGroup: string;
	city: string;
	phoneNumber: string;
	email: string;
}

const UpdateUser = () => {
	const navigate = useNavigate();
	const { userId } = useParams<{ userId: string }>();
	const { align } = useStyles();
	const { formField, button, signUp, form, bar } = authStyles();
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [message, setMessage] = useState('');

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<UpdateUserFormData>({
		defaultValues: {
			firstname: '',
			lastname: '',
			birthdate: '',
			bloodGroup: '',
			city: '',
			phoneNumber: '',
			email: '',
		},
	});

	// Fetch user data
	const { data: userData, isLoading } = useQuery({
		queryKey: ['user', userId],
		queryFn: async () => {
			const token = localStorage.getItem('token');
			const response = await axios.get(
				`http://localhost:3000/api/users/profile/${userId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			return response.data;
		},
		enabled: !!userId,
	});

	// Reset form when userData is loaded
	useEffect(() => {
		if (userData) {
			reset({
				firstname: userData.firstname || '',
				lastname: userData.lastname || '',
				birthdate: userData.birthdate
					? new Date(userData.birthdate).toISOString().split('T')[0]
					: '',
				bloodGroup: userData.bloodGroup || '',
				city: userData.city || '',
				phoneNumber: userData.phoneNumber || '',
				email: userData.email || '',
			});
		}
	}, [userData, reset]);

	const onSubmit = async (data: UpdateUserFormData) => {
		try {
			const token = localStorage.getItem('token');
			await axios.put(`http://localhost:3000/api/users/${userId}`, data, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setMessage('User updated successfully!');
			setShowSnackbar(true);

			setTimeout(() => {
				navigate('/users');
			}, 2000);
		} catch (error) {
			console.error('Error updating user:', error);
			setMessage('Error updating user. Please try again.');
			setShowSnackbar(true);
		}
	};

	if (isLoading) {
		return (
			<FormContainer>
				<Typography>Loading user data...</Typography>
			</FormContainer>
		);
	}

	return (
		<>
			<FormContainer className={align} style={{ marginBottom: '120px' }}>
				<Typography variant='h2' align='center' gutterBottom className={signUp}>
					<b>Update User Information</b>
					<span className={bar}></span>
				</Typography>

				<form onSubmit={handleSubmit(onSubmit)} className={form}>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Controller
								name='firstname'
								control={control}
								rules={{ required: 'First name is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='First Name'
										fullWidth
										error={Boolean(errors.firstname)}
										helperText={errors.firstname?.message}
										className={formField}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name='lastname'
								control={control}
								rules={{ required: 'Last name is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='Last Name'
										fullWidth
										error={Boolean(errors.lastname)}
										helperText={errors.lastname?.message}
										className={formField}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name='email'
								control={control}
								rules={{
									required: 'Email is required',
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: 'Invalid email address',
									},
								}}
								render={({ field }) => (
									<TextField
										{...field}
										label='Email'
										type='email'
										fullWidth
										error={Boolean(errors.email)}
										helperText={errors.email?.message}
										className={formField}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name='phoneNumber'
								control={control}
								rules={{ required: 'Phone number is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='Phone Number'
										fullWidth
										error={Boolean(errors.phoneNumber)}
										helperText={errors.phoneNumber?.message}
										className={formField}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name='birthdate'
								control={control}
								rules={{ required: 'Birthdate is required' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='Birthdate'
										type='date'
										fullWidth
										error={Boolean(errors.birthdate)}
										helperText={errors.birthdate?.message}
										className={formField}
										InputLabelProps={{ shrink: true }}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12} sm={6}>
							<Controller
								name='city'
								control={control}
								rules={{ required: 'City is required' }}
								render={({ field }) => (
									<FormControl fullWidth error={Boolean(errors.city)}>
										<InputLabel>City</InputLabel>
										<Select {...field} label='City'>
											{cities.map((city) => (
												<MenuItem key={city} value={city}>
													{city}
												</MenuItem>
											))}
										</Select>
										{errors.city && (
											<FormHelperText>{errors.city.message}</FormHelperText>
										)}
									</FormControl>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='bloodGroup'
								control={control}
								rules={{ required: 'Blood group is required' }}
								render={({ field }) => (
									<FormControl fullWidth error={Boolean(errors.bloodGroup)}>
										<InputLabel>Blood Group</InputLabel>
										<Select {...field} label='Blood Group'>
											{BLOOD_GROUP_OPTIONS.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
										</Select>
										{errors.bloodGroup && (
											<FormHelperText>
												{errors.bloodGroup.message}
											</FormHelperText>
										)}
									</FormControl>
								)}
							/>
						</Grid>

						<Grid item xs={12} className={align}>
							<Button
								type='submit'
								variant='contained'
								color='primary'
								className={button}
								fullWidth
							>
								Update User Information
							</Button>
						</Grid>
					</Grid>
				</form>
			</FormContainer>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					marginTop: '30px',
					marginBottom: '30px',
				}}
			></div>

			<SnackbarComponent
				open={showSnackbar}
				message={message}
				handleClose={() => setShowSnackbar(false)}
			/>
		</>
	);
};

export default UpdateUser;
