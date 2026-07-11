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

	useEffect(() => {
		if (eventData) {
			const event = eventData.data.event;
			reset({
				title: event.title,
				subtitle: event.subtitle || '',
				location: event.location,
				date: new Date(event.date).toISOString().split('T')[0],
				mapLink: event.mapLink || '',
				description: event.description || '',
				isGeneric: event.isGeneric || false,
			});
		}
	}, [eventData, reset]);

	useEffect(() => {
		if (isError) {
			setMessage(t('events.form.loadError'));
		}
	}, [isError, t]);

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

			const response = await fetch(
				`http://localhost:3000/api/event/${reference}`,
				{
					method: 'PUT',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			if (response.ok) {
				setIsFormSubmitted(true);
				setIsSuccessResponse(true);
				setMessage(t('events.form.updateSuccess'));
				setTimeout(() => {
					navigate('/events');
				}, 2000);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.errorMessage || t('events.form.updateError'));
			}
		} catch (error: any) {
			setIsFormSubmitted(true);
			setIsSuccessResponse(false);
			setIsErrorResponse(true);
			setErrorMessage(
				error.data?.errorMessage ||
					error.message ||
					t('events.form.updateError')
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
				<Typography>{t('events.form.loadingEvent')}</Typography>
			</FormContainer>
		);
	}

	if (!eventData) {
		return (
			<FormContainer className={formWrapper}>
				<Typography>{t('events.form.eventNotFound')}</Typography>
			</FormContainer>
		);
	}

	if (isFormSubmitted) {
		return (
			<FormContainer className={formWrapper}>
				<ResponseAnimation
					responseMessage={t('events.form.updateSuccess')}
					actionMessage={t('events.form.redirectingToEvents')}
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
					{t('events.form.updateTitle')}
					<span className={bar}></span>
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)} className={form}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Controller
								name='title'
								control={control}
								rules={{ required: t('events.form.titleRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.form.titleLabel')}
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
									<TextField {...field} label={t('events.form.subtitleLabel')} />
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='location'
								control={control}
								rules={{ required: t('events.form.locationRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.form.locationLabel')}
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
								rules={{ required: t('events.form.dateRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.form.dateLabel')}
										type='date'
										InputLabelProps={{ shrink: true }}
										disabled={true}
										helperText={t('events.form.dateLocked')}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='mapLink'
								control={control}
								render={({ field }) => (
									<TextField {...field} label={t('events.form.mapLinkLabel')} />
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='description'
								control={control}
								rules={{ required: t('events.form.descriptionRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										label={t('events.form.descriptionLabel')}
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
										label={t('events.form.isSpecific')}
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
									{t('events.form.changePhoto')}
								</Button>
							</label>
							{image ? (
								<span>
									{t('events.form.photoSelected')} {image.name}
								</span>
							) : (
								<span>{t('events.form.keepCurrentPhoto')}</span>
							)}
						</Grid>

						<Grid item xs={12}>
							<Button type='submit' className={button}>
								{t('events.form.updateButton')}
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
