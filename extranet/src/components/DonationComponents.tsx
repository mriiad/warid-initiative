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
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiErrorResponse } from '../data/ApiErrorResponse';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import { donate, fetchDonation } from '../utils/queries';
import { formatDate } from '../utils/utils';
import FormContainer from './shared/FormContainer';
import ResponseAnimation from './shared/ResponseAnimation';
import SnackbarComponent from './shared/SnackbarComponent';

const useStyles = makeStyles({
	wrapper: {
		display: 'grid',
		placeContent: 'center',
		backgroundColor: 'var(--background-color)',
		fontFamily: '"Oswald", sans-serif',
		fontSize: '24px',
		fontWeight: 700,
		textTransform: 'uppercase',
		color: colors.rose,
	},
	topBottom: {
		gridArea: '1/1/-1/-1',
	},
	top: {
		clipPath: 'polygon(0% 0%, 100% 0%, 100% 48%, 0% 58%)',
	},
	bottom: {
		clipPath: 'polygon(0% 60%, 100% 50%, 100% 100%, 0% 100%)',
		color: colors.purple,
		background: 'linear-gradient(177deg, black 53%, colors.rose 65%)',
		backgroundClip: 'text',
		WebkitBackgroundClip: 'text',
		transform: 'translateX(-0.02em)',
	},
	alert: {
		backgroundColor: 'rgba(255, 255, 255, 0.35)',
	},
	separator: {
		marginTop: '20px',
	},
});

const DonationComponent = () => {
	const { token } = useAuth();
	const { wrapper, topBottom, top, bottom, separator } = useStyles();
	const { bar, button, signUp, form } = authStyles();
	const { subTitle } = mainStyles();

	const navigate = useNavigate();

	const {
		handleSubmit,
		formState: { errors },
		control,
		setValue,
		setError,
	} = useForm();

	const {
		data: donation,
		error,
		isLoading,
		isError,
	} = useQuery('donation', fetchDonation, {
		enabled: !!token,
	});

	const [showSnackbar, setShowSnackbar] = useState(false);
	const [reviewSnackbarOpen, setReviewSnackbarOpen] = useState(false);

	const defaultLastDonationDate = useMemo(() => {
		if (isLoading) return '';
		if (error || !donation || !token) return '';
		return donation.reelDonationDate
			? formatDate(donation.reelDonationDate)
			: formatDate(donation.lastDonationDate);
	}, [donation, error, isLoading, token]);

	useEffect(() => {
		if (defaultLastDonationDate) {
			setShowSnackbar(true);
		}
	}, [defaultLastDonationDate]);

	useEffect(() => {
		// If the user is logged in and there is pending form data, load it
		if (token) {
			const storedFormData = sessionStorage.getItem('pendingDonationFormData');
			if (storedFormData) {
				const formData = JSON.parse(storedFormData);
				// Overwrite the `lastDonationDate` by the initially fetched value
				if (defaultLastDonationDate) {
					formData['lastDonationDate'] = defaultLastDonationDate;
				}
				// Use form methods to set the data
				Object.keys(formData).forEach((key) => {
					setValue(key, formData[key]);
				});
				// Clear the stored data since it's now being used
				sessionStorage.removeItem('pendingDonationFormData');
				setReviewSnackbarOpen(true);
			}
		}
	}, [token, setValue, defaultLastDonationDate]);

	const donateMutation = useMutation(donate);

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccessResponse, setIsSuccessAnimationVisible] =
		useState<boolean>(false);
	const [isErrorResponse, setIsErrorAnimationVisible] =
		useState<boolean>(false);

	const onSubmit = (formData: any) => {
		if (!token) {
			// Store formData in localStorage or sessionStorage
			sessionStorage.setItem(
				'pendingDonationFormData',
				JSON.stringify(formData)
			);
			// Redirect user to /login with a redirect parameter
			navigate('/login?redirect=/donate');
			return; // Prevent further execution of onSubmit
		}
		donateMutation.mutate(formData, {
			onSuccess: () => {
				console.log('Form submitted successfully!');
				setIsFormSubmitted(true);
				setIsSuccessAnimationVisible(true);
				setIsErrorAnimationVisible(false);
			},
			onError: (error: any) => {
				console.error('Error submitting form:', error);
				setIsSuccessAnimationVisible(false);
				const errorResponseData: ApiErrorResponse = error.data;
				if (errorResponseData.errorKeys) {
					errorResponseData.errorKeys.forEach((errorKey) => {
						// Set error on each field based on the server response
						setError(errorKey, {
							message: `${errorKey} is invalid`,
						});
					});
				}
				if (error.data) {
					const errorResponseData: ApiErrorResponse = error.data;
					if (error.status !== 404 && error.status !== 400) {
						setErrorMessage(
							errorResponseData.errorMessage || 'An error occurred.'
						);
						setIsFormSubmitted(true);
						setIsErrorAnimationVisible(true);
					}
				}
			},
		});
	};

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Donate
				<span className={bar}></span>
			</Typography>
			<Typography variant='h6' align='center' gutterBottom>
				<span className={subTitle}>
					Be the
					<section className={wrapper}>
						<div className={`${topBottom} ${top}`}>H E E E E R O !</div>
						<div className={`${topBottom} ${bottom}`} aria-hidden='true'>
							H E E E E R O !
						</div>
					</section>
				</span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={clsx(form, separator)}>
				<Grid container spacing={2}>
					{isFormSubmitted ? (
						<ResponseAnimation
							isSuccess={isSuccessResponse}
							isError={isErrorResponse}
							errorMessage={errorMessage}
						/>
					) : (
						<>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<Controller
										name='bloodGroup'
										control={control}
										defaultValue=''
										render={({ field }) => (
											<FormControl fullWidth error={Boolean(errors.bloodGroup)}>
												<InputLabel>Blood Group</InputLabel>
												<Select {...field}>
													<MenuItem value=''>
														<em>None</em>
													</MenuItem>
													<MenuItem value='A+'>A+</MenuItem>
													<MenuItem value='A-'>A-</MenuItem>
													<MenuItem value='B+'>B+</MenuItem>
													<MenuItem value='B-'>B-</MenuItem>
													<MenuItem value='AB+'>AB+</MenuItem>
													<MenuItem value='AB-'>AB-</MenuItem>
													<MenuItem value='O+'>O+</MenuItem>
													<MenuItem value='O-'>O-</MenuItem>
												</Select>
												<FormHelperText>
													{errors.bloodGroup ? 'Blood Group is required' : ''}
												</FormHelperText>
											</FormControl>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Controller
										name='lastDonationDate'
										control={control}
										defaultValue={defaultLastDonationDate}
										render={({ field }) => (
											<TextField
												fullWidth
												label='Last Donation Date'
												type='date'
												InputLabelProps={{
													shrink: true,
												}}
												{...field}
												error={Boolean(errors.lastDonationDate)}
												helperText={
													errors.lastDonationDate ? 'Invalid Date' : ''
												}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Controller
										name='donationType'
										control={control}
										defaultValue=''
										render={({ field }) => (
											<FormControl
												fullWidth
												error={Boolean(errors.donationType)}
											>
												<InputLabel>Donation Type</InputLabel>
												<Select {...field}>
													<MenuItem value=''>
														<em>None</em>
													</MenuItem>
													<MenuItem value='Blood'>Blood</MenuItem>
													<MenuItem value='Plates'>Plates</MenuItem>
												</Select>
												<FormHelperText>
													{errors.donationType
														? 'Donation Type is required'
														: ''}
												</FormHelperText>
											</FormControl>
										)}
									/>
								</Grid>

								<Grid item xs={12}>
									<Controller
										name='disease'
										control={control}
										defaultValue=''
										render={({ field }) => (
											<TextField
												fullWidth
												label='Disease'
												{...field}
												error={Boolean(errors.disease)}
												helperText={errors.disease ? 'Disease is required' : ''}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Button type='submit' className={button}>
										Donate
									</Button>
								</Grid>
							</Grid>
						</>
					)}
				</Grid>
			</form>
			<SnackbarComponent
				open={reviewSnackbarOpen}
				message='Please review your form data before submitting.'
				handleClose={() => setReviewSnackbarOpen(false)}
				offsetTop={0}
			/>
			<SnackbarComponent
				open={showSnackbar}
				message={`Based on your history, your last donation date is: ${defaultLastDonationDate}`}
				handleClose={() => setShowSnackbar(false)}
				autoHideDuration={5000}
				offsetTop={reviewSnackbarOpen ? 100 : 0}
			/>
		</FormContainer>
	);
};

export default DonationComponent;
