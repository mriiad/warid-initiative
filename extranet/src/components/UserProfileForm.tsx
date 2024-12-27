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
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
	BloodGroup,
	Gender,
	ProfileFormData,
	fieldDisplayNames,
} from '../data/ProfileFormData';
import { authStyles } from '../styles/mainStyles';
import { fetchUserProfile } from '../utils/queries';
import { formatDate } from '../utils/utils';
import FormContainer from './shared/FormContainer';
import SnackbarComponent from './shared/SnackbarComponent';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
	align: {
		marginTop: '-20px',
	},
	radioGroup: {
		backgroundColor: 'white',
		borderRadius: '20px',
		padding: '10px',
	},
	radioMargin: {
		margin: '0 10px',
	},
});

const UserProfileForm = () => {
	const { t }: { t: (key: string) => string } = useTranslation();
	const navigate = useNavigate();
	const { align, radioGroup, radioMargin } = useStyles();
	const { formField, button, signUp, form, bar } = authStyles();
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [incompleteFieldsMessage, setIncompleteFieldsMessage] = useState('');

	const { data: userProfile } = useQuery<ProfileFormData>(
		'userProfile',
		fetchUserProfile,
		{
			refetchOnWindowFocus: false,
			refetchOnMount: true,
			retry: 5,
		}
	);

	const defaultProfileValues = useMemo(
		() => ({
			firstname: '',
			lastname: '',
			birthdate: '',
			gender: Gender.Male,
			bloodGroup: BloodGroup.None,
		}),
		[]
	);

	const {
		handleSubmit,
		formState: { errors },
		control,
		setValue,
	} = useForm<ProfileFormData>({
		defaultValues: defaultProfileValues,
	});

	useEffect(() => {
		if (userProfile) {
			const missingFields: string[] = [];
			const fields: (keyof ProfileFormData)[] = [
				'firstname',
				'lastname',
				'birthdate',
				'gender',
				'bloodGroup',
			];

			fields.forEach((field) => {
				let value = userProfile[field] || '';
				if (field === 'birthdate' && userProfile.birthdate) {
					value = formatDate(userProfile.birthdate);
				}
				setValue(field, value);
				if (!userProfile[field]) missingFields.push(fieldDisplayNames[field]);
			});

			if (missingFields.length > 0) {
				const formattedMessage = `Could you please provide the following details? ${missingFields.join(
					', '
				)}.`;
				setIncompleteFieldsMessage(formattedMessage);
				setShowSnackbar(true);
			}
		}
	}, [userProfile, setValue]);

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
			    {t('UserProfil.Title')}
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<FormControlField
							name='firstname'
							label={t('UserProfil.FirstName')}
							control={control}
							error={errors.firstname}
							helperText={errors.firstname ? t('UserProfil.FirstNameRequired') : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<FormControlField
							name='lastname'
							label={t('UserProfil.LastName')}
							control={control}
							error={errors.lastname}
							helperText={errors.lastname ? t('UserProfil.LastNameRequired') : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<FormControlField
							name='birthdate'
							label={t('UserProfil.Birthdate')}
							control={control}
							type='date'
							error={errors.birthdate}
							helperText={errors.birthdate ? t('UserProfil.BirthdateRequired') : ''}
						/>
					</Grid>
					<Grid item xs={12} className={formField}>
						<Controller
							name='gender'
							control={control}
							defaultValue={Gender.Male}
							rules={{ required: t('UserProfil.GenderRequired') }}
							render={({ field }) => (
								<FormControl component='fieldset' fullWidth>
									<RadioGroup row {...field} className={radioGroup}>
										<FormControlLabel
											value='male'
											control={<Radio />}
											label={t('UserProfil.Male')}
											className={radioMargin}
										/>
										<FormControlLabel
											value='female'
											control={<Radio />}
											label={t('UserProfil.Female')}
											className={radioMargin}
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
							name='bloodGroup'
							control={control}
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.bloodGroup)}>
									<InputLabel>{t('UserProfil.BloodGroup')}</InputLabel>
									<Select {...field}>
										<MenuItem value=''>
											<em>{t('UserProfil.None')}</em>
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
										{errors.bloodGroup ? t('UserProfil.BloodGrpRequired') : ''}
									</FormHelperText>
								</FormControl>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
						{t('UserProfil.Button')}
						</Button>
					</Grid>
				</Grid>
			</form>
			<SnackbarComponent
				open={showSnackbar}
				message={incompleteFieldsMessage}
				handleClose={() => setShowSnackbar(false)}
				autoHideDuration={5000}
			/>
		</FormContainer>
	);
};

const FormControlField = ({
	name,
	label,
	control,
	error,
	helperText,
	type = 'text',
}) => (
	<Controller
		name={name}
		control={control}
		defaultValue=''
		render={({ field }) => (
			<TextField
				fullWidth
				label={label}
				required
				type={type}
				InputLabelProps={type === 'date' ? { shrink: true } : undefined}
				{...field}
				error={Boolean(error)}
				helperText={helperText}
			/>
		)}
	/>
);

export default UserProfileForm;
