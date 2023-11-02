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
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const DonationComponent = () => {
	const { bar, button, signUp, form } = authStyles();
	const { subTitle } = mainStyles();
	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm();

	const donateMutation = useMutation((data) => {
		return axios.put('http://localhost:3000/api/donation', data);
	});

	const [, setIsFormSubmitted] = useState<boolean>(false);
	const onSubmit = (formData) => {
		donateMutation.mutate(formData, {
			onSuccess: () => {
				console.log('Form submitted successfully!');
				setIsFormSubmitted(true);
			},
			onError: (error) => {
				console.error('Error submitting form:', error);
			},
		});
	};

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Donate
				<span className={bar}></span>
			</Typography>
			<Typography variant='h6' align='center' gutterBottom>
				<span className={subTitle}>
					Make a donation and make a difference.{' '}
				</span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='bloodGroup'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.bloodGroup)}>
									<InputLabel>Blood Group</InputLabel>
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
										{errors.bloodGroup ? 'Blood Group is required' : ''}
									</FormHelperText>
								</FormControl>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name='lastDonationDate'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label='Last Donation Date'
									type='date'
									InputLabelProps={{
										shrink: true,
									}}
									{...field}
									error={Boolean(errors.lastDonationDate)}
									helperText={errors.lastDonationDate ? 'Invalid Date' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='donationType'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.donationType)}>
									<InputLabel>Donation Type</InputLabel>
									<Select {...field}>
										<MenuItem value=''>
											<em>None</em>
										</MenuItem>
										<MenuItem value='Blood'>Blood</MenuItem>
										<MenuItem value='Plates'>Plates</MenuItem>
									</Select>
									<FormHelperText>
										{errors.donationType ? 'Donation Type is required' : ''}
									</FormHelperText>
								</FormControl>
							)}
						/>
					</Grid>

					<Grid item xs={12}>
						<Controller
							name='disease'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label='Disease'
									{...field}
									error={Boolean(errors.disease)}
									helperText={errors.disease ? 'Disease is required' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							Donate
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default DonationComponent;
