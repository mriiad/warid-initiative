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
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiErrorResponse } from '../data/ApiErrorResponse';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import {
	donate,
	fetchDonation,
	fetchEventByReference,
	fetchEvents,
} from '../utils/queries';
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
	const location = useLocation();
	const params = useParams();
	const queryParams = new URLSearchParams(location.search);
	const eventReference = queryParams.get('eventRef');
	const eventDateFromURL = queryParams.get('eventDate');

	const {
		handleSubmit,
		formState: { errors },
		control,
		setValue,
		setError,
		watch,
	} = useForm();

	const {
		data: donation,
		error,
		isLoading,
		isError,
	} = useQuery('donation', fetchDonation, {
		enabled: !!token,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		retry: 5,
	});

	const { data: events } = useQuery('events', fetchEvents, {
		enabled: !!token,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		retry: 3,
	});

	const { data: eventData } = useQuery(
		['event', eventReference],
		() => fetchEventByReference(eventReference),
		{
			enabled: !!eventReference,
			refetchOnWindowFocus: false,
			refetchOnMount: true,
		}
	);

	const [showSnackbar, setShowSnackbar] = useState(false);
	const [reviewSnackbarOpen, setReviewSnackbarOpen] = useState(false);
	const [isBloodGroupEditable, setIsBloodGroupEditable] = useState(true);
	const [isDateDisabled, setIsDateDisabled] = useState(false);
	const donationType = watch('donationType');

	const defaultDonationDate = useMemo(() => {
		if (isLoading) return '';
		if (error || !donation || !token) return '';
		return donation.reelDonationDate
			? formatDate(donation.reelDonationDate)
			: formatDate(donation.donationDate);
	}, [donation, error, isLoading, token]);

	useEffect(() => {
		if (eventReference && eventData && eventData.event) {
			// This is a non-generic event with reference
			const eventDate = eventDateFromURL || formatDate(eventData.event.date);
			setValue('eventId', eventData.event._id);
			setValue('donationDate', eventDate);
			setIsDateDisabled(true);
		} else if (eventReference && events) {
			// This is a generic event with reference
			const genericEvent = events.find(
				(e) => e.isGeneric && e.reference === eventReference
			);
			if (genericEvent) {
				setValue('eventId', genericEvent._id);
				setValue('donationDate', formatDate(new Date()));
			}
		} else {
			// Regular donation - no event reference
			setValue('donationDate', formatDate(new Date()));
		}
	}, [eventReference, eventData, events, setValue, eventDateFromURL]);

	useEffect(() => {
		if (donation) {
			setValue('bloodGroup', donation.bloodGroup);
			setIsBloodGroupEditable(!donation.bloodGroup);
		}

		if (defaultDonationDate && !eventReference) {
			setShowSnackbar(true);
		}
	}, [defaultDonationDate, donation, setValue, eventReference]);

	useEffect(() => {
		if (token) {
			const storedFormData = sessionStorage.getItem('pendingDonationFormData');
			if (storedFormData) {
				const formData = JSON.parse(storedFormData);
				if (defaultDonationDate && !eventReference) {
					formData['donationDate'] = defaultDonationDate;
				}
				Object.keys(formData).forEach((key) => {
					setValue(key, formData[key]);
				});
				sessionStorage.removeItem('pendingDonationFormData');
				setReviewSnackbarOpen(true);
			}
		}
	}, [token, setValue, defaultDonationDate, eventReference]);

	const donateMutation = useMutation(donate);

	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSuccessResponse, setIsSuccessAnimationVisible] =
		useState<boolean>(false);
	const [isErrorResponse, setIsErrorAnimationVisible] =
		useState<boolean>(false);

	const onSubmit = (formData: any) => {
		if (!token) {
			sessionStorage.setItem(
				'pendingDonationFormData',
				JSON.stringify(formData)
			);

			// For login redirect, maintain the same URL structure
			const redirectUrl = eventReference
				? `/donate?eventRef=${eventReference}${
						eventDateFromURL ? `&eventDate=${eventDateFromURL}` : ''
				  }`
				: '/donate';

			navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
			return;
		}

		// If no event ID is set but we have an event reference, find the matching event
		if (!formData.eventId && eventReference && events) {
			const event = events.find((e) => e.reference === eventReference);
			if (event) {
				formData.eventId = event._id;
			}
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
				تبرع
				<span className={bar}></span>
			</Typography>
			<Typography variant='h6' align='center' gutterBottom>
				<span className={subTitle}>
					كن أنت
					<section className={wrapper}>
						<div className={`${topBottom} ${top}`}>!البطل</div>
						<div className={`${topBottom} ${bottom}`} aria-hidden='true'>
							!البطل
						</div>
					</section>
				</span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={clsx(form, separator)}>
				<Grid container spacing={2}>
					{isFormSubmitted ? (
						<ResponseAnimation
							responseMessage='Donation request registred successfully!'
							actionMessage='Our team will contact you soon to provide more details.'
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
											<FormControl
												fullWidth
												error={Boolean(errors.bloodGroup)}
												disabled={!isBloodGroupEditable}
											>
												<InputLabel>فصيلة الدم</InputLabel>
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
													{errors.bloodGroup ? 'فصيلة الدم مطلوبة' : ''}
												</FormHelperText>
											</FormControl>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Controller
										name='donationDate'
										control={control}
										defaultValue=''
										rules={{
											required: 'تاريخ التبرع مطلوب',
										}}
										render={({ field }) => (
											<TextField
												{...field}
												label='تاريخ التبرع'
												error={Boolean(errors.donationDate)}
												helperText={
													errors.donationDate ? 'تاريخ التبرع مطلوب' : ''
												}
												type='date'
												fullWidth
												InputLabelProps={{
													shrink: true,
												}}
												disabled={isDateDisabled}
											/>
										)}
									/>
								</Grid>
								<Grid item xs={12}>
									<Controller
										name='donationType'
										control={control}
										defaultValue=''
										rules={{
											required: 'نوع التبرع مطلوب',
										}}
										render={({ field }) => (
											<FormControl
												fullWidth
												error={Boolean(errors.donationType)}
											>
												<InputLabel>نوع التبرع</InputLabel>
												<Select {...field}>
													<MenuItem value=''>
														<em>لا شيء</em>
													</MenuItem>
													<MenuItem value='Blood'>الدم</MenuItem>
													<MenuItem value='Plates'>الصفائح</MenuItem>
												</Select>
												<FormHelperText>
													{errors.donationType ? 'نوع التبرع مطلوب' : ''}
												</FormHelperText>
											</FormControl>
										)}
									/>
								</Grid>

								{eventReference === null && (
									<Grid item xs={12}>
										<Controller
											name='eventId'
											control={control}
											defaultValue=''
											render={({ field }) => (
												<FormControl fullWidth error={Boolean(errors.eventId)}>
													<InputLabel>الحدث</InputLabel>
													<Select {...field}>
														<MenuItem value=''>
															<em>None</em>
														</MenuItem>
														{events &&
															events.map((event) => (
																<MenuItem key={event._id} value={event._id}>
																	{event.title} ({formatDate(event.date)})
																</MenuItem>
															))}
													</Select>
													<FormHelperText>
														{errors.eventId ? 'الحدث مطلوب' : ''}
													</FormHelperText>
												</FormControl>
											)}
										/>
									</Grid>
								)}
							</Grid>
							<Button
								type='submit'
								className={button}
								style={{ marginTop: '20px' }}
							>
								تسجيل التبرع
							</Button>
						</>
					)}
				</Grid>
			</form>

			<SnackbarComponent
				open={showSnackbar}
				handleClose={() => setShowSnackbar(false)}
				message={`آخر تبرع كان بتاريخ ${defaultDonationDate}`}
			/>
			<SnackbarComponent
				open={reviewSnackbarOpen}
				handleClose={() => setReviewSnackbarOpen(false)}
				message='تم استعادة بيانات التبرع السابقة. يرجى مراجعتها قبل الإرسال.'
			/>
		</FormContainer>
	);
};

export default DonationComponent;
