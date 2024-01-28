import {
	Button,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ProfileFormData } from '../data/ProfileFormData';
import { authStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const useStyles = makeStyles({
	align: {
		marginTop: '-20px',
	},
});

const UserProfileForm = () => {
	const navigate = useNavigate();
	const { formField, button, signUp, form, bar } = authStyles();
	const { align } = useStyles();

	const {
		handleSubmit,
		formState: { errors },
		control,
	} = useForm<ProfileFormData>();

	const updateProfile = async (data: ProfileFormData) => {
		try {
			await axios.put('/api/user/update', data);
			navigate('/events');
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

	const onSubmit = (formData: ProfileFormData) => {
		updateProfile(formData);
	};

	return (
		<FormContainer className={align}>
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
					<Grid item xs={12}>
						<Controller
							name='bloodGroup'
							control={control}
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
