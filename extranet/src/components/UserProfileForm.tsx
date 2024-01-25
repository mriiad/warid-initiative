import {
	Button,
	FormControl,
	FormControlLabel,
	Grid,
	Radio,
	RadioGroup,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ProfileFormData } from '../data/ProfileFormData';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const UserProfileForm = () => {
	const navigate = useNavigate();
	const { formField, button, signUp, form, bar } = authStyles();
	const { subTitle, textButton } = mainStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<ProfileFormData>();

	const updateProfile = async (data: ProfileFormData) => {
		try {
			await axios.put('/api/user/update', data);
			navigate('/home');
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

	const onSubmit = (formData: ProfileFormData) => {
		updateProfile(formData);
	};

	return (
		<FormContainer>
			<Typography variant='h2' align='center' gutterBottom className={signUp}>
				Complete Your Profile
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Controller
							name='firstname'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label='First Name'
									required
									{...field}
									error={Boolean(errors.firstname)}
									helperText={errors.firstname ? 'First name is required' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='lastname'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label='Last Name'
									required
									{...field}
									error={Boolean(errors.lastname)}
									helperText={errors.lastname ? 'Last name is required' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='birthdate'
							control={control}
							defaultValue=''
							render={({ field }) => (
								<TextField
									fullWidth
									label='Birthdate'
									type='date'
									InputLabelProps={{ shrink: true }}
									required
									{...field}
									error={Boolean(errors.birthdate)}
									helperText={errors.birthdate ? 'Birthdate is required' : ''}
								/>
							)}
						/>
					</Grid>
					<Grid item xs={12} className={formField}>
						<Controller
							name='gender'
							control={control}
							defaultValue='male'
							rules={{ required: 'Gender is required' }}
							render={({ field }) => (
								<FormControl component='fieldset' fullWidth>
									<RadioGroup
										row
										{...field}
										style={{
											backgroundColor: 'white',
											borderRadius: '20px',
											padding: '10px',
										}}
									>
										<FormControlLabel
											value='male'
											control={<Radio />}
											label='Male'
											style={{ margin: '0 10px' }}
										/>
										<FormControlLabel
											value='female'
											control={<Radio />}
											label='Female'
											style={{ margin: '0 10px' }}
										/>
									</RadioGroup>
									{errors.gender && (
										<Typography color='error' variant='caption'>
											{errors.gender.message}
										</Typography>
									)}
								</FormControl>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							Update
						</Button>
					</Grid>
				</Grid>
			</form>
		</FormContainer>
	);
};

export default UserProfileForm;
