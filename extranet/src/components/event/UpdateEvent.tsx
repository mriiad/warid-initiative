import {
	Button,
	Checkbox,
	FormControlLabel,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useEvent } from '../../hooks';
import { eventsService } from '../../services';
import { authStyles, mainStyles } from '../../styles/mainStyles';
import FormContainer from '../shared/FormContainer';
import ResponseAnimation from '../shared/ResponseAnimation';
import SnackbarComponent from '../shared/SnackbarComponent';

interface IFormInput {
	title: string;
	subtitle: string;
	location: string;
	date: string;
	mapLink: string;
	description: string;
	image: FileList;
	isGeneric: boolean;
}

const useStyles = makeStyles({
	formWrapper: {
		marginBottom: '88px',
	},
	fileInput: {
		marginTop: '20px',
	},
});

const UpdateEvent: React.FC = () => {
	const { t } = useTranslation();
	const { bar, button, form } = authStyles();
	const { subTitle } = mainStyles();
	const { formWrapper, fileInput } = useStyles();
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();
	const { token } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<IFormInput>({
		defaultValues: {
			isGeneric: false,
		},
	});

	const [image, setImage] = useState<File | null>(null);
	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState<boolean>(false);
	const [isErrorResponse, setIsErrorResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [message, setMessage] = useState<string | null>(null);

	const { data: eventData, isLoading, isError } = useEvent(reference || '');
	const event = eventData?.data || eventData;

	useEffect(() => {
		if (event) {
			let formattedDate = '';
			if (event.date) {
				try {
					const dateObj = new Date(event.date);
					if (!isNaN(dateObj.getTime())) {
						formattedDate = dateObj.toISOString().split('T')[0];
					} else {
						formattedDate = new Date().toISOString().split('T')[0];
					}
				} catch (error) {
					console.warn('Invalid date format:', event.date);
					formattedDate = new Date().toISOString().split('T')[0];
				}
			} else {
				formattedDate = new Date().toISOString().split('T')[0];
			}

			reset({
				title: event.title || '',
				subtitle: event.subtitle || '',
				location: event.location || '',
				date: formattedDate,
				mapLink: event.mapLink || '',
				description: event.description || '',
				isGeneric: event.isGeneric || false,
			});
		}
	}, [event, reset]);

	useEffect(() => {
		if (isError) {
			setMessage(t('events.loadingEventDetails') + ' - Error');
		}
	}, [isError]);

	const onSubmit = async (data: IFormInput) => {
		try {
			const formData = new FormData();
			formData.append('title', data.title);
			formData.append('subtitle', data.subtitle ?? '');
			formData.append('location', data.location);
			formData.append('date', data.date);
			formData.append('mapLink', data.mapLink ?? '');
			formData.append('description', data.description);
			formData.append('isGeneric', data.isGeneric.toString());
			if (image) {
				formData.append('image', image);
			}

			const response = await eventsService.update(reference || '', {
				title: data.title,
				subtitle: data.subtitle || '',
				location: data.location,
				date: data.date,
				mapLink: data.mapLink || '',
				description: data.description,
				isGeneric: data.isGeneric,
				image: image || undefined,
			});

			if (response.status === 200) {
				setIsFormSubmitted(true);
				setIsSuccessResponse(true);
				setMessage(t('events.eventUpdatedSuccess'));
				setTimeout(() => {
					navigate('/events');
				}, 2000);
			} else {
				throw new Error('Error updating event');
			}
		} catch (error: any) {
			setIsFormSubmitted(true);
			setIsSuccessResponse(false);
			setIsErrorResponse(true);
			setErrorMessage(
				error.data?.errorMessage || error.message || 'Error updating the event'
			);
			if (error.response?.data?.errorKeys) {
				error.response.data.errorKeys.forEach((key: string) => {
					// Handle field-specific errors if needed
					console.error(`Validation error for ${key}`);
				});
			}
		}
	};

	const handleCreateAnotherEvent = () => {
		setIsFormSubmitted(false);
		if (isSuccessResponse) reset();
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setImage(e.target.files[0]);
		}
	};

	if (isLoading) {
		return (
			<FormContainer className={formWrapper}>
				<Typography>Loading event data...</Typography>
			</FormContainer>
		);
	}

	if (!eventData) {
		return (
			<FormContainer className={formWrapper}>
				<Typography>Event not found</Typography>
			</FormContainer>
		);
	}

	if (isFormSubmitted) {
		return (
			<FormContainer className={formWrapper}>
				<ResponseAnimation
					responseMessage={t('events.eventUpdatedSuccess')}
					actionMessage={t('events.redirectingToEvents')}
					isSuccess={isSuccessResponse}
					isError={!isSuccessResponse && isErrorResponse}
					errorMessage={errorMessage}
				/>
			</FormContainer>
		);
	}

	return (
		<>
			<FormContainer className={formWrapper}>
				<Typography variant='h4' align='center' className={subTitle}>
					{t('events.updateEvent')}
					<span className={bar}></span>
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)} className={form}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Controller
								name='title'
								control={control}
								rules={{ required: t('events.titleRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.title')}
										error={Boolean(errors.title)}
										helperText={errors.title?.message}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='subtitle'
								control={control}
								render={({ field }) => (
									<TextField {...field} label={t('events.subtitle')} />
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='location'
								control={control}
								rules={{ required: t('events.locationRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.location')}
										error={Boolean(errors.location)}
										helperText={errors.location?.message}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='date'
								control={control}
								rules={{ required: t('events.dateRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.date')}
										type='date'
										InputLabelProps={{ shrink: true }}
										disabled={true}
										helperText={t('events.dateCannotBeChanged')}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='mapLink'
								control={control}
								render={({ field }) => (
									<TextField {...field} label={t('events.mapLink')} />
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='description'
								control={control}
								rules={{ required: t('events.descriptionRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.description')}
										multiline
										rows={4}
										error={Boolean(errors.description)}
										helperText={errors.description?.message}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='isGeneric'
								control={control}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Checkbox
												checked={field.value}
												onChange={field.onChange}
											/>
										}
										label={t('events.generalEvent')}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<label htmlFor='upload-file'>
								<input
									type='file'
									id='upload-file'
									onChange={handleImageChange}
									style={{ display: 'none' }}
									accept='image/*'
								/>
								<Button component='span' variant='contained'>
									{t('events.chooseNewImage')}
								</Button>
							</label>
							{image ? (
								<span>
									{t('events.selectedFile')}: {image.name}
								</span>
							) : (
								<span>{t('events.noNewFileSelected')}</span>
							)}
						</Grid>

						<Grid item xs={12}>
							<Button type='submit' className={button}>
								{t('events.updateEvent')}
							</Button>
						</Grid>
					</Grid>
				</form>
			</FormContainer>

			{message && (
				<SnackbarComponent
					open={!!message}
					message={message}
					handleClose={() => setMessage(null)}
				/>
			)}
		</>
	);
};

export default UpdateEvent;
