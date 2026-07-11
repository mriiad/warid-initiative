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
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiErrorResponse } from '../data/ApiErrorResponse';
import { BLOOD_GROUP_OPTIONS } from '../data/constants';
import {
	useDonate,
	useDonationHistory,
	useEvent,
	useEvents,
	useUserProfile,
} from '../hooks';
import colors from '../styles/colors';
import { authStyles, mainStyles } from '../styles/mainStyles';
import { formatDate, formatDateForDisplay } from '../utils/utils';
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
	
	const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const eventReference = queryParams.get('eventRef');
	const eventDateFromURL = queryParams.get('eventDate') || queryParams.get('event-Date');

	const {
		handleSubmit,
		formState: { errors },
		control,
		setValue,
		setError,
		watch,
	} = useForm();

	const { data: donation, error, isLoading, isError } = useDonationHistory();

	const { data: profileData } = useUserProfile();

	const { data: events } = useEvents();

	const { data: eventData } = useEvent(eventReference || '');

	const [showSnackbar, setShowSnackbar] = useState(false);
	const [reviewSnackbarOpen, setReviewSnackbarOpen] = useState(false);
	const [isBloodGroupEditable, setIsBloodGroupEditable] = useState(true);
	// Whenever the form was opened via an event's QR code (eventReference
	// present), the date is derived from that event and must never be
	// user-editable -- including in the brief window before the event
	// details finish loading.
	const [isDateDisabled, setIsDateDisabled] = useState<boolean>(() =>
		Boolean(eventReference)
	);
	const donationType = watch('donationType');

	const defaultDonationDate = useMemo(() => {
		if (isLoading) return '';
		if (error || !donation?.data || !token) return '';
		return donation.data.reelDonationDate
			? formatDate(donation.data.reelDonationDate)
			: formatDate(donation.data.donationDate);
	}, [donation, error, isLoading, token]);

	const defaultDonationDateDisplay = useMemo(() => {
		if (isLoading) return '';
		if (error || !donation?.data || !token) return '';
		return donation.data.reelDonationDate
			? formatDateForDisplay(donation.data.reelDonationDate)
			: formatDateForDisplay(donation.data.donationDate);
	}, [donation, error, isLoading, token]);

	useEffect(() => {
		// GET /api/events/:reference responds with `{ message, event }`, so the
		// actual event fields live at `eventData.data.event`, not
		// `eventData.data` directly.
		if (eventReference && eventData?.data?.event) {
			const event = eventData.data.event;
			// General (generic) events can happen any day, so the donation date
			// is always today, greyed out. Specific events use the fixed date
			// encoded in the QR link (falling back to the event's own date).
			const eventDate = event.isGeneric
				? formatDate(new Date())
				: eventDateFromURL || formatDate(event.date);
			setValue('eventId', event._id);
			setValue('donationDate', eventDate);
			setIsDateDisabled(true);
		} else if (eventReference && events?.data?.events) {
			const genericEvent = events.data.events.find(
				(e: any) => e.isGeneric && e.reference === eventReference
			);
			if (genericEvent) {
				setValue('eventId', genericEvent._id);
				setValue('donationDate', formatDate(new Date()));
				setIsDateDisabled(true);
			}
		} else if (!eventReference) {
			// Regular donation - no event reference
			setValue('donationDate', formatDate(new Date()));
		}
	}, [eventReference, eventData, events, setValue, eventDateFromURL]);

	useEffect(() => {
		if (donation?.data) {
			setValue('bloodGroup', donation.data.bloodGroup);
			setIsBloodGroupEditable(!donation.data.bloodGroup);
		} else if (profileData?.data && profileData.data.bloodGroup) {
			setValue('bloodGroup', profileData.data.bloodGroup);
			setIsBloodGroupEditable(!profileData.data.bloodGroup);
		}

		if (defaultDonationDate && !eventReference) {
			setShowSnackbar(true);
		}
	}, [defaultDonationDate, donation, setValue, eventReference, profileData]);

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

	const donateMutation = useDonate();

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

		if (!formData.eventId && eventReference && events?.data?.events) {
			const event = events.data.events.find(
				(e: any) => e.reference === eventReference
			);
			if (event) {
				formData.eventId = event._id;
			}
		}

		donateMutation.mutate(formData, {
			onSuccess: () => {
				setIsFormSubmitted(true);
				setIsSuccessAnimationVisible(true);
				setIsErrorAnimationVisible(false);
			},
			onError: (error: any) => {
				setIsSuccessAnimationVisible(false);
				const errorResponseData: ApiErrorResponse = error.response?.data;
				if (errorResponseData?.errorKeys) {
					errorResponseData.errorKeys.forEach((errorKey) => {
						setError(errorKey, {
							message: `${errorKey} is invalid`,
						});
					});
				}
				if (error.response?.data) {
					const errorResponseData: ApiErrorResponse = error.response.data;
					if (error.response.status !== 404 && error.response.status !== 400) {
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
													{BLOOD_GROUP_OPTIONS.map((option) => (
														<MenuItem key={option.value} value={option.value}>
															{option.label}
														</MenuItem>
													))}
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

								{!eventReference && (
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
														{events?.data?.events &&
															events.data.events.map((event: any) => (
																<MenuItem key={event._id} value={event._id}>
																	{event.title} (
																	{formatDateForDisplay(event.date)})
																	{event.isGeneric && ' - حدث عام'}
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
				message={`آخر تبرع كان بتاريخ ${defaultDonationDateDisplay}`}
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
