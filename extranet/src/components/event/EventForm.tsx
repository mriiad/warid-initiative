import { Button, Grid, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { authStyles, mainStyles } from '../../styles/mainStyles';
import { createEvent } from '../../utils/queries';
import FormContainer from '../shared/FormContainer';
import ResponseAnimation from '../shared/ResponseAnimation';

interface IFormInput {
	title: string;
	subtitle: string;
	location: string;
	date: string;
	mapLink: string;
	description: string;
	image: FileList;
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
	const { bar, button, form } = authStyles();
	const { subTitle } = mainStyles();
	const { formWrapper, fileInput } = useStyles();

	const {
		control,
		handleSubmit,
		formState: { errors },
		setError,
		reset,
	} = useForm<IFormInput>();

	const [image, setImage] = useState<File | null>(null);
	const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
	const [isSuccessResponse, setIsSuccessResponse] = useState<boolean>(false);
	const [isErrorResponse, setIsErrorResponse] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');

	const onSubmit = async (data: IFormInput) => {
		try {
			const formData = new FormData();
			formData.append('title', data.title);
			formData.append('subtitle', data.subtitle ?? '');
			formData.append('location', data.location);
			formData.append('date', data.date);
			formData.append('mapLink', data.mapLink ?? '');
			formData.append('description', data.description);
			if (image) {
				formData.append('image', image);
			}

			const response = await createEvent(formData);
			setIsFormSubmitted(true);
			setIsSuccessResponse(true);
		} catch (error) {
			setIsFormSubmitted(true);
			setIsSuccessResponse(false);
			setIsErrorResponse(true);
			setErrorMessage(
				error.data?.errorMessage || 'Error while creating the event'
			);
			if (error.response?.data?.errorKeys) {
				error.response.data.errorKeys.forEach((key: string) => {
					setError(key as keyof IFormInput, { message: 'Invalid input' });
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
					responseMessage={'Event created successfully!'}
					actionMessage={'Want to create more ? click belows'}
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
						? 'Create Another Event'
						: 'Back To Event Creation'}
				</Button>
			</FormContainer>
		);
	}

	return (
		<FormContainer className={formWrapper}>
			<Typography variant='h4' align='center' className={subTitle}>
				Create Event
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='title'
							control={control}
							rules={{ required: 'Title is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									label='Title'
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
							render={({ field }) => <TextField {...field} label='Subtitle' />}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name='location'
							control={control}
							rules={{ required: 'Location is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									label='Location'
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
							rules={{ required: 'Date is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									label='Date'
									type='date'
									InputLabelProps={{ shrink: true }}
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
							render={({ field }) => <TextField {...field} label='Map Link' />}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name='description'
							control={control}
							rules={{ required: 'Description is required' }}
							render={({ field }) => (
								<TextField
									{...field}
									label='Description'
									multiline
									rows={4}
									error={Boolean(errors.description)}
									helperText={errors.description?.message}
								/>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<input type='file' onChange={handleImageChange} />
					</Grid>

					<Grid item xs={12}>
						<Button type='submit' className={button}>
							Create Event
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default EventForm;