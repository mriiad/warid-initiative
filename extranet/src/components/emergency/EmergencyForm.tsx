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

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { BLOOD_GROUP_OPTIONS } from '../../data/constants';
import { useCreateEmergency } from '../../hooks';
import { authStyles } from '../../styles/mainStyles';
import { cities } from '../../utils/utils';
import FormContainer from '../shared/FormContainer';
import ResponseAnimation from '../shared/ResponseAnimation';

// Form data interface for the form (with string phoneNumber for validation)
interface EmergencyFormData {
	bloodGroup: string;
	city: string;
	phoneNumber: string;
	details: string;
}

const EmergencyForm = () => {
	const { bar, button, signUp, form } = authStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
		setError,
		reset,
	} = useForm<EmergencyFormData>();

	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState(false);
	const [isErrorResponse, setIsErrorResponse] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const mutation = useCreateEmergency();

	const handleFormSubmit = (formData: EmergencyFormData) => {
		const payload = {
			bloodGroup: formData.bloodGroup as any,
			city: formData.city,
			phoneNumber: formData.phoneNumber,
			details: formData.details,
		};

		mutation.mutate(payload, {
			onSuccess: () => {
				setIsFormSubmitted(true);
				setIsSuccessResponse(true);
				setIsErrorResponse(false);
				reset();
			},
			onError: (error: any) => {
				if (error?.response?.data?.errorKeys) {
					error.response.data.errorKeys.forEach(
						(errorKey: keyof EmergencyFormData) => {
							setError(errorKey, {
								message: `${errorKey} is invalid`,
							});
						}
					);
				}

				setErrorMessage(
					error?.data?.message || 'An unexpected error occurred.'
				);
				setIsFormSubmitted(true);
				setIsErrorResponse(true);
				setIsSuccessResponse(false);
			},
			onSettled: () => {
				setLoading(false);
				setTimeout(() => {
					setIsFormSubmitted(false);
				}, 8000);
			},
		});
	};

	const onSubmit = (formData: EmergencyFormData) => {
		setLoading(true);
		setIsFormSubmitted(false);
		setErrorMessage(null);
		handleFormSubmit(formData);
	};

	return (
		<FormContainer>
			<Typography variant='h4' align='center' gutterBottom className={signUp}>
				Create Emergency
				<span className={bar} style={{ width: '150px', height: '5px' }}></span>
			</Typography>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className={form}
				style={{ marginTop: '20px' }}
			>
				<Grid container spacing={2} justifyContent='center' alignItems='center'>
					{isFormSubmitted ? (
						<ResponseAnimation
							responseMessage='Emergency created successfully!'
							actionMessage='Our team will do their best to find donors.'
							isSuccess={isSuccessResponse}
							isError={isErrorResponse}
							errorMessage={errorMessage}
						/>
					) : (
						<>
							<Grid item xs={12}>
								<Controller
									name='bloodGroup'
									control={control}
									defaultValue=''
									rules={{ required: 'Blood group is required' }}
									render={({ field }) => (
										<FormControl fullWidth error={Boolean(errors.bloodGroup)}>
											<InputLabel>Blood Group</InputLabel>
											<Select {...field} label='Blood Group'>
												<MenuItem value=''>
													<em>None</em>
												</MenuItem>
												{BLOOD_GROUP_OPTIONS.map((option) => (
													<MenuItem key={option.value} value={option.value}>
														{option.label}
													</MenuItem>
												))}
											</Select>
											<FormHelperText>
												{errors.bloodGroup?.message}
											</FormHelperText>
										</FormControl>
									)}
								/>
							</Grid>

							<Grid item xs={12}>
								<Controller
									name='city'
									rules={{ required: 'City is required' }}
									control={control}
									defaultValue=''
									render={({ field }) => (
										<FormControl fullWidth error={Boolean(errors.city)}>
											<InputLabel>City</InputLabel>
											<Select {...field}>
												<MenuItem value=''>
													<em>None</em>
												</MenuItem>
												{cities.map((city) => (
													<MenuItem key={city} value={city}>
														{city}
													</MenuItem>
												))}
											</Select>
											<FormHelperText>{errors.city?.message}</FormHelperText>
										</FormControl>
									)}
								/>
							</Grid>

							<Grid item xs={12}>
								<Controller
									name='phoneNumber'
									control={control}
									defaultValue=''
									rules={{
										required: 'Phone number is required',
										pattern: {
											value: /^[0-9]+$/,
											message: 'Phone number must contain only numbers',
										},
										validate: (value) =>
											value.length === 10 ||
											'Phone number must be exactly 10 numbers',
									}}
									render={({ field }) => (
										<TextField
											{...field}
											label='Phone Number'
											fullWidth
											error={Boolean(errors.phoneNumber)}
											helperText={errors.phoneNumber?.message}
										/>
									)}
								/>
							</Grid>

							<Grid item xs={12}>
								<Controller
									name='details'
									control={control}
									defaultValue=''
									rules={{ required: 'The details is required' }}
									render={({ field }) => (
										<TextField
											{...field}
											label='Details'
											multiline
											rows={4}
											fullWidth
											error={Boolean(errors.details)}
											helperText={errors.details?.message}
										/>
									)}
								/>
							</Grid>

							<Grid item xs={12}>
								<Button
									type='submit'
									variant='contained'
									className={button}
									disabled={loading}
									style={{ color: 'white' }}
								>
									{loading ? 'Creating...' : 'Create Emergency'}
								</Button>
							</Grid>
						</>
					)}
				</Grid>
			</form>
		</FormContainer>
	);
};

export default EmergencyForm;
