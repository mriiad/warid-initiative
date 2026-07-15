import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpacityIcon from '@mui/icons-material/Opacity';
import SearchIcon from '@mui/icons-material/Search';
import {
	FormControl,
	FormHelperText,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { authRedesignStyles } from '../styles/authRedesign';
import { eventsListRedesignStyles } from '../styles/eventsListRedesign';
import { formatDate, formatDateForDisplay } from '../utils/utils';
import RedesignBottomNav from './shared/RedesignBottomNav';
import ResponseAnimation from './shared/ResponseAnimation';
import SnackbarComponent from './shared/SnackbarComponent';

const DonationComponent = () => {
	const { t } = useTranslation();
	const { token } = useAuth();
	const { input, primaryButton } = authRedesignStyles();
	const { screen, topBar, topBarDivider, topBarTitle, content, hero, heroIcon, heroTitle } =
		eventsListRedesignStyles();

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
	const [isDateDisabled, setIsDateDisabled] = useState<boolean>(() => Boolean(eventReference));
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
	const [isSuccessResponse, setIsSuccessAnimationVisible] = useState<boolean>(false);
	const [isErrorResponse, setIsErrorAnimationVisible] = useState<boolean>(false);

	const onSubmit = (formData: any) => {
		if (!token) {
			sessionStorage.setItem('pendingDonationFormData', JSON.stringify(formData));

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
			const event = events.data.events.find((e: any) => e.reference === eventReference);
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
							message: t('donation.fieldInvalid', { field: errorKey }),
						});
					});
				}
				if (error.response?.data) {
					const errorResponseData: ApiErrorResponse = error.response.data;
					if (error.response.status !== 404 && error.response.status !== 400) {
						setErrorMessage(errorResponseData.errorMessage || t('donation.genericError'));
						setIsFormSubmitted(true);
						setIsErrorAnimationVisible(true);
					}
				}
			},
		});
	};

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('donation.title')}</Typography>
				<IconButton aria-label={t('admin.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<OpacityIcon />
					</div>
					<Typography className={heroTitle}>{t('donation.beTheHero')}</Typography>
				</div>

				<form onSubmit={handleSubmit(onSubmit)}>
					{isFormSubmitted ? (
						<ResponseAnimation
							responseMessage={t('donation.successTitle')}
							actionMessage={t('donation.successBody')}
							isSuccess={isSuccessResponse}
							isError={isErrorResponse}
							errorMessage={errorMessage}
						/>
					) : (
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
							<Controller
								name='bloodGroup'
								control={control}
								defaultValue=''
								render={({ field }) => (
									<FormControl
										fullWidth
										className={input}
										error={Boolean(errors.bloodGroup)}
										disabled={!isBloodGroupEditable}
									>
										<InputLabel>{t('donation.bloodGroup')}</InputLabel>
										<Select {...field} label={t('donation.bloodGroup')}>
											<MenuItem value=''>
												<em>{t('common.none')}</em>
											</MenuItem>
											{BLOOD_GROUP_OPTIONS.map((option) => (
												<MenuItem key={option.value} value={option.value}>
													{option.label}
												</MenuItem>
											))}
										</Select>
										<FormHelperText>
											{errors.bloodGroup ? t('donation.bloodGroupRequired') : ''}
										</FormHelperText>
									</FormControl>
								)}
							/>

							<Controller
								name='donationDate'
								control={control}
								defaultValue=''
								rules={{ required: t('donation.donationDateRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('donation.donationDate')}
										error={Boolean(errors.donationDate)}
										helperText={errors.donationDate ? t('donation.donationDateRequired') : ''}
										type='date'
										InputLabelProps={{ shrink: true }}
										disabled={isDateDisabled}
									/>
								)}
							/>

							<Controller
								name='donationType'
								control={control}
								defaultValue=''
								rules={{ required: t('donation.donationTypeRequired') }}
								render={({ field }) => (
									<FormControl fullWidth className={input} error={Boolean(errors.donationType)}>
										<InputLabel>{t('donation.donationType')}</InputLabel>
										<Select {...field} label={t('donation.donationType')}>
											<MenuItem value=''>
												<em>{t('donation.donationTypeNone')}</em>
											</MenuItem>
											<MenuItem value='Blood'>{t('donation.blood')}</MenuItem>
											<MenuItem value='Plates'>{t('donation.plates')}</MenuItem>
										</Select>
										<FormHelperText>
											{errors.donationType ? t('donation.donationTypeRequired') : ''}
										</FormHelperText>
									</FormControl>
								)}
							/>

							{!eventReference && (
								<Controller
									name='eventId'
									control={control}
									defaultValue=''
									render={({ field }) => (
										<FormControl fullWidth className={input} error={Boolean(errors.eventId)}>
											<InputLabel>{t('donation.event')}</InputLabel>
											<Select {...field} label={t('donation.event')}>
												<MenuItem value=''>
													<em>{t('donation.eventNone')}</em>
												</MenuItem>
												{events?.data?.events &&
													events.data.events.map((event: any) => (
														<MenuItem key={event._id} value={event._id}>
															{event.title} ({formatDateForDisplay(event.date)})
															{event.isGeneric && t('donation.genericEventSuffix')}
														</MenuItem>
													))}
											</Select>
											<FormHelperText>
												{errors.eventId ? t('donation.eventRequired') : ''}
											</FormHelperText>
										</FormControl>
									)}
								/>
							)}

							<Button type='submit' fullWidth className={primaryButton}>
								{t('donation.submit')}
							</Button>
						</div>
					)}
				</form>
			</div>

			<RedesignBottomNav />

			<SnackbarComponent
				open={showSnackbar}
				handleClose={() => setShowSnackbar(false)}
				message={t('donation.lastDonationMessage', { date: defaultDonationDateDisplay })}
			/>
			<SnackbarComponent
				open={reviewSnackbarOpen}
				handleClose={() => setReviewSnackbarOpen(false)}
				message={t('donation.restoredMessage')}
			/>
		</div>
	);
};

export default DonationComponent;
