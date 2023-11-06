import {
	Button,
	FormControl,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Slide,
	Snackbar,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { ApiErrorResponse } from '../data/ApiErrorResponse';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import { donate, fetchDonation } from '../utils/queries';
import { formatDate } from '../utils/utils';
import CardComponent from './shared/CardComponent';
import FormContainer from './shared/FormContainer';
import ResponseAnimation from './shared/ResponseAnimation';

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
	const { wrapper, topBottom, top, bottom, alert, separator } = useStyles();
	const { bar, button, signUp, form } = authStyles();
	const { subTitle } = mainStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
		reset,
	} = useForm();

	const {
		data: donation,
		error,
		isLoading,
		isError,
	} = useQuery('donation', fetchDonation);

	const [showSnackbar, setShowSnackbar] = useState(false);

	const defaultLastDonationDate = useMemo(() => {
		if (isLoading) return '';
		if (error || !donation) return '';
		return donation.reelDonationDate
			? formatDate(donation.reelDonationDate)
			: formatDate(donation.lastDonationDate);
	}, [donation, error, isLoading]);

	useEffect(() => {
		reset({ lastDonationDate: defaultLastDonationDate });
	}, [defaultLastDonationDate, reset]);

	useEffect(() => {
		if (defaultLastDonationDate) {
			setShowSnackbar(true);
			const timer = setTimeout(() => {
				setShowSnackbar(false);
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [defaultLastDonationDate]);

	const donateMutation = useMutation(donate);

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccessResponse, setIsSuccessAnimationVisible] =
		useState<boolean>(false);
	const [isErrorResponse, setIsErrorAnimationVisible] =
		useState<boolean>(false);

	const onSubmit = (formData: any) => {
		donateMutation.mutate(formData, {
			onSuccess: () => {
				console.log('Form submitted successfully!');
				setIsFormSubmitted(true);
				setIsSuccessAnimationVisible(true);
				setIsErrorAnimationVisible(false);
			},
			onError: (error: any) => {
				console.error('Error submitting form:', error);
				setIsFormSubmitted(true);
				setIsSuccessAnimationVisible(false);
				console.log('######### error', error);
				if (error.data) {
					const errorResponseData: ApiErrorResponse = error.data;
					if (error.status !== 404) {
						setErrorMessage(
							errorResponseData.errorMessage || 'An error occurred.'
						);
						setIsErrorAnimationVisible(true);
					}
				}
			},
		});
	};

	console.log('isErrorAnimationVisible', isErrorResponse);

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
			<Snackbar
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				open={showSnackbar}
				autoHideDuration={5000}
			>
				<Slide direction='up' in={showSnackbar} mountOnEnter unmountOnExit>
					<CardComponent className={alert}>
						{`Based on your history, your last donation date is: ${defaultLastDonationDate}`}
					</CardComponent>
				</Slide>
			</Snackbar>
		</FormContainer>
	);
};

export default DonationComponent;
