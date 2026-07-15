import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import {
	Checkbox,
	CircularProgress,
	FormControlLabel,
	IconButton,
	TextField,
	Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useEvent } from '../../hooks';
import { authRedesignStyles } from '../../styles/authRedesign';
import { eventsListRedesignStyles } from '../../styles/eventsListRedesign';
import API_CONFIG, { buildApiUrl } from '../../utils/apiConfig';
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

const UpdateEvent: React.FC = () => {
	const { t } = useTranslation();
	const { input, primaryButton } = authRedesignStyles();
	const { screen, topBar, topBarDivider, topBarTitle, content, hero, heroIcon, heroTitle } =
		eventsListRedesignStyles();
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();

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

	if (!isAdmin) {
		return <NotFoundPage />;
	}

	const onSubmit = async (data: IFormInput) => {
		try {
			const formData = new FormData();
			formData.append('title', data.title);
			formData.append('subtitle', data.subtitle ?? '');
			formData.append('location', data.location);
			formData.append('mapLink', data.mapLink ?? '');
			formData.append('description', data.description);
			formData.append('isGeneric', data.isGeneric.toString());
			if (image) {
				formData.append('image', image);
			}

			const response = await fetch(buildApiUrl(API_CONFIG.endpoints.events.update(reference)), {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (response.ok) {
				setIsFormSubmitted(true);
				setIsSuccessResponse(true);
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
			setErrorMessage(error.data?.errorMessage || error.message || t('events.form.updateError'));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setImage(e.target.files[0]);
		}
	};

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('events.form.updateTitle')}</Typography>
				<IconButton aria-label={t('admin.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<EventIcon />
					</div>
					<Typography className={heroTitle}>{t('events.form.updateTitle')}</Typography>
				</div>

				{isLoading ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
						<CircularProgress />
					</div>
				) : !eventData || isError ? (
					<Typography>{t('events.form.eventNotFound')}</Typography>
				) : isFormSubmitted ? (
					<ResponseAnimation
						responseMessage={t('events.form.updateSuccess')}
						actionMessage={t('events.form.redirectingToEvents')}
						isSuccess={isSuccessResponse}
						isError={!isSuccessResponse && isErrorResponse}
						errorMessage={errorMessage}
					/>
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
								render={({ field }) => (
									<TextField
										{...field}
										fullWidth
										className={input}
										label={t('events.form.dateLabel')}
										type='date'
										disabled
										InputLabelProps={{ shrink: true }}
										helperText={t('events.form.dateLocked')}
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
										control={<Checkbox checked={field.value} onChange={field.onChange} />}
										label={t('events.form.isSpecific')}
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
										accept='image/*'
									/>
									<Button component='span' className={primaryButton}>
										{t('events.form.changePhoto')}
									</Button>
								</label>
								<div style={{ marginTop: '8px', fontSize: '13px' }}>
									{image ? (
										<span>
											{t('events.form.photoSelected')} {image.name}
										</span>
									) : (
										<span>{t('events.form.keepCurrentPhoto')}</span>
									)}
								</div>
							</div>

							<Button type='submit' fullWidth className={primaryButton}>
								{t('events.form.updateButton')}
							</Button>
						</div>
					</form>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default UpdateEvent;
