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
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import { authStyles, mainStyles } from '../../styles/mainStyles';
import { fetchEventByReference } from '../../utils/queries';
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

	const [event, setEvent] = useState<Event | null>(null);
	const [image, setImage] = useState<File | null>(null);
	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState<boolean>(false);
	const [isErrorResponse, setIsErrorResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const loadEvent = async () => {
			if (!reference) return;

			try {
				setIsLoading(true);
				const eventData = await fetchEventByReference(reference);
				setEvent(eventData);
				reset({
					title: eventData.title,
					subtitle: eventData.subtitle || '',
					location: eventData.location,
					date: new Date(eventData.date).toISOString().split('T')[0],
					mapLink: eventData.mapLink || '',
					description: eventData.description || '',
					isGeneric: eventData.isGeneric || false,
				});
			} catch (error) {
				console.error('Error loading event:', error);
				setMessage('Error loading event data');
			} finally {
				setIsLoading(false);
			}
		};

		loadEvent();
	}, [reference, reset]);

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
				setMessage('Event updated successfully!');
				setTimeout(() => {
					navigate('/events');
				}, 2000);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.errorMessage || 'Error updating event');
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

	if (!event) {
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
					responseMessage={'تم تحديث الفعالية بنجاح!'}
					actionMessage={'سيتم توجيهك إلى صفحة الفعاليات...'}
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
					تحديث الفعالية
					<span className={bar}></span>
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)} className={form}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Controller
								name='title'
								control={control}
								rules={{ required: 'العنوان مطلوب' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='العنوان'
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
									<TextField {...field} label='العنوان الفرعي' />
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='location'
								control={control}
								rules={{ required: 'الموقع مطلوب' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='موقع الفعالية'
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
								rules={{ required: 'التاريخ مطلوب' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='التاريخ'
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
									<TextField {...field} label='رابط الخريطة' />
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Controller
								name='description'
								control={control}
								rules={{ required: 'الوصف مطلوب' }}
								render={({ field }) => (
									<TextField
										{...field}
										label='الوصف'
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
										label='فعالية خاصة'
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
									اختر ملف صورة جديد (اختياري)
								</Button>
							</label>
							{image ? (
								<span>الملف المحدد: {image.name}</span>
							) : (
								<span>
									لم يتم اختيار ملف جديد - سيتم الاحتفاظ بالصورة الحالية
								</span>
							)}
						</Grid>

						<Grid item xs={12}>
							<Button type='submit' className={button}>
								تحديث الفعالية
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
