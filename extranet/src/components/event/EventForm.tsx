import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import {
	Button,
	Checkbox,
	FormControlLabel,
	IconButton,
	TextField,
	Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { hasAdminRole } from '../../auth/adminAccess';
import { useAuth } from '../../auth/AuthContext';
import { AdminRole } from '../../data/constants';
import { useCreateEvent } from '../../hooks';
import { authRedesignStyles } from '../../styles/authRedesign';
import { eventsListRedesignStyles } from '../../styles/eventsListRedesign';
import NotFoundPage from '../NotFoundPage';
import RedesignBottomNav from '../shared/RedesignBottomNav';
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

const EventForm: React.FC = () => {
	const { t } = useTranslation();
	const { isAdmin, adminRole } = useAuth();
	// Event Admin or Principal Admin (issue #183).
	const isEventAdmin = hasAdminRole(isAdmin, adminRole, [AdminRole.Event]);
	const navigate = useNavigate();
	const { input, primaryButton } = authRedesignStyles();
	const { screen, topBar, topBarDivider, topBarTitle, content, hero, heroIcon, heroTitle } =
		eventsListRedesignStyles();

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

	if (!isEventAdmin) {
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
				error.response?.data?.message || t('events.form.createError')
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

	const todayLabel = new Date().toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('events.form.createTitle')}</Typography>
				<div style={{ width: '40px' }} />
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<EventIcon />
					</div>
					<Typography className={heroTitle}>{t('events.form.createTitle')}</Typography>
					<Typography style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginTop: '4px' }}>
						{todayLabel}
					</Typography>
				</div>

				{isFormSubmitted ? (
					<>
						<ResponseAnimation
							responseMessage={t('events.form.createSuccess')}
							actionMessage={t('events.form.createAnotherPrompt')}
							isSuccess={isSuccessResponse}
							isError={!isSuccessResponse && isErrorResponse}
							errorMessage={errorMessage}
						/>
						<Button
							type='button'
							fullWidth
							className={primaryButton}
							onClick={handleCreateAnotherEvent}
							style={{ marginTop: '16px' }}
						>
							{isSuccessResponse
								? t('events.form.createAnother')
								: t('events.form.backToCreate')}
						</Button>
					</>
				) : (
					<form onSubmit={handleSubmit(onSubmit)}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
							<Controller
								name='title'
								control={control}
								rules={{ required: t('events.form.titleRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('events.form.titleLabel')}
										error={Boolean(errors.title)}
										helperText={errors.title?.message}
									/>
								)}
							/>

							<Controller
								name='subtitle'
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('events.form.subtitleLabel')}
									/>
								)}
							/>

							<Controller
								name='location'
								control={control}
								rules={{ required: t('events.form.locationRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('events.form.locationLabel')}
										error={Boolean(errors.location)}
										helperText={errors.location?.message}
									/>
								)}
							/>

							<Controller
								name='date'
								control={control}
								rules={{ required: t('events.form.dateRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
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

							<Controller
								name='mapLink'
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('events.form.mapLinkLabel')}
									/>
								)}
							/>

							<Controller
								name='description'
								control={control}
								rules={{ required: t('events.form.descriptionRequired') }}
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('events.form.descriptionLabel')}
										multiline
										rows={4}
										error={Boolean(errors.description)}
										helperText={errors.description?.message}
									/>
								)}
							/>

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

							<div>
								<label htmlFor='upload-file'>
									<input
										type='file'
										id='upload-file'
										onChange={handleImageChange}
										style={{ display: 'none' }}
									/>
									<Button component='span' className={primaryButton}>
										{t('events.form.selectPhoto')}
									</Button>
								</label>
								<div style={{ marginTop: '8px', fontSize: '13px' }}>
									{image ? (
										<span>
											{t('events.form.photoSelected')} {image.name}
										</span>
									) : (
										<span>{t('events.form.noPhotoSelected')}</span>
									)}
								</div>
							</div>

							<Button type='submit' fullWidth className={primaryButton}>
								{t('events.form.createButton')}
							</Button>
						</div>
					</form>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default EventForm;
