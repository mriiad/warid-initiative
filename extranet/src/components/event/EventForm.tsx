import {
	Button,
	Checkbox,
	FormControlLabel,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useCreateEvent } from '../../hooks';
import { authStyles, mainStyles } from '../../styles/mainStyles';
import FormContainer from '../shared/FormContainer';
import NotFoundPage from '../NotFoundPage';
import ResponseAnimation from '../shared/ResponseAnimation';

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

const EventForm: React.FC = () => {
	const { t } = useTranslation();
	const { isAdmin } = useAuth();
	const { bar, button, form } = authStyles();
	const { subTitle } = mainStyles();
	const { formWrapper, fileInput } = useStyles();
	const navigate = useNavigate();

	const {
		control,
		handleSubmit,
		formState: { errors },
		setError,
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

	const createEventMutation = useCreateEvent();

	if (!isAdmin) {
		return <NotFoundPage />;
	}

	const onSubmit = async (data: IFormInput) => {
		try {
			const eventData = {
				title: data.title,
				subtitle: data.subtitle,
				location: data.location,
				date: data.date,
				mapLink: data.mapLink,
				description: data.description,
				isGeneric: data.isGeneric,
				image: image,
			};

			await createEventMutation.mutateAsync(eventData);
			setIsFormSubmitted(true);
			setIsSuccessResponse(true);
		} catch (error) {
			setIsFormSubmitted(true);
			setIsSuccessResponse(false);
			setIsErrorResponse(true);
			setErrorMessage(
				error.data?.errorMessage || t('events.form.createError')
			);
			if (error.response?.data?.errorKeys) {
				error.response.data.errorKeys.forEach((key: string) => {
					setError(key as keyof IFormInput, {
						message: t('events.form.invalidInput'),
					});
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

	if (isFormSubmitted) {
		return (
			<FormContainer className={formWrapper}>
				<ResponseAnimation
					responseMessage={t('events.form.createSuccess')}
					actionMessage={t('events.form.createAnotherPrompt')}
					isSuccess={isSuccessResponse}
					isError={!isSuccessResponse && isErrorResponse}
					errorMessage={errorMessage}
				/>
				<Button
					onClick={handleCreateAnotherEvent}
					className={button}
					style={{ marginTop: '20px' }}
				>
					{isSuccessResponse
						? t('events.form.createAnother')
						: t('events.form.backToCreate')}
				</Button>
			</FormContainer>
		);
	}

	return (
		<FormContainer className={formWrapper}>
			<Typography variant='h4' align='center' className={subTitle}>
				{t('events.form.createTitle')}
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
									inputProps={{
										min: new Date().toISOString().split('T')[0],
									}}
									error={Boolean(errors.date)}
									helperText={errors.date?.message}
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
										<Checkbox checked={field.value} onChange={field.onChange} />
									}
									label={t('events.form.isGeneric')}
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
							/>
							<Button component='span' variant='contained'>
								{t('events.form.selectPhoto')}
							</Button>
						</label>
						{image ? (
							<span>
								{t('events.form.photoSelected')} {image.name}
							</span>
						) : (
							<span>{t('events.form.noPhotoSelected')}</span>
						)}
					</Grid>

					<Grid item xs={12}>
						<Button type='submit' className={button}>
							{t('events.form.createButton')}
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default EventForm;
