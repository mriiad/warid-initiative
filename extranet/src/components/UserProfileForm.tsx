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
import { makeStyles } from '@mui/styles';

import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfileFormData } from '../data/ProfileFormData';
import { BLOOD_GROUP_OPTIONS, BloodGroup } from '../data/constants';
import { useUserProfile } from '../hooks';
import { authStyles } from '../styles/mainStyles';
import { cities, formatDate } from '../utils/utils';
import FormContainer from './shared/FormContainer';
import SnackbarComponent from './shared/SnackbarComponent';
import { useQueryClient } from '@tanstack/react-query';


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

const fieldTranslationKeys: { [K in keyof ProfileFormData]: string } = {
	firstname: 'auth.completeProfile.firstName',
	lastname: 'auth.completeProfile.lastName',
	birthdate: 'auth.completeProfile.birthdate',
	bloodGroup: 'auth.completeProfile.bloodGroup',
	city: 'auth.completeProfile.city',
};

const UserProfileForm = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { align, radioGroup, radioMargin } = useStyles();
	const { formField, button, signUp, form, bar } = authStyles();
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [incompleteFieldsMessage, setIncompleteFieldsMessage] = useState('');
	const queryClient = useQueryClient();


	const { data: userProfile } = useUserProfile();

	const defaultProfileValues = useMemo(
		() => ({
			firstname: '',
			lastname: '',
			birthdate: '',
			bloodGroup: BloodGroup.None,
			city: '',
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
				'bloodGroup',
				'city',
			];

			fields.forEach((field) => {
				let value = userProfile.data[field] || '';
				if (field === 'birthdate' && userProfile.data.birthdate) {
					value = formatDate(userProfile.data.birthdate);
				}
				setValue(field, value);
				if (!userProfile.data[field])
					missingFields.push(t(fieldTranslationKeys[field]));
			});

			if (missingFields.length > 0) {
				const formattedMessage = `${t(
					'auth.completeProfile.missingFields'
				)} ${missingFields.join(', ')}`;
				setIncompleteFieldsMessage(formattedMessage);
				setShowSnackbar(true);
			}
		}
	}, [userProfile, setValue]);

	const updateProfile = async (data: ProfileFormData) => {
		try {
			await axios.put('/api/user/update', data);
			// Refetch user data after profile update to ensure components get the latest values
			queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
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
				{t('auth.completeProfile.title')}
				<span className={bar}></span>
			</Typography>
			<form onSubmit={handleSubmit(onSubmit)} className={form}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<FormControlField
							name='firstname'
							label={t('auth.completeProfile.firstName')}
							control={control}
							error={errors.firstname}
							helperText={
								errors.firstname ? t('auth.completeProfile.firstNameRequired') : ''
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<FormControlField
							name='lastname'
							label={t('auth.completeProfile.lastName')}
							control={control}
							error={errors.lastname}
							helperText={
								errors.lastname ? t('auth.completeProfile.lastNameRequired') : ''
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<FormControlField
							name='birthdate'
							label={t('auth.completeProfile.birthdate')}
							control={control}
							type='date'
							error={errors.birthdate}
							helperText={
								errors.birthdate ? t('auth.completeProfile.birthdateRequired') : ''
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='bloodGroup'
							control={control}
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.bloodGroup)}>
									<InputLabel>{t('auth.completeProfile.bloodGroup')}</InputLabel>
									<Select {...field}>
										<MenuItem value=''>
											<em>{t('common.none')}</em>
										</MenuItem>
										{BLOOD_GROUP_OPTIONS.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>
										{errors.bloodGroup
											? t('auth.completeProfile.bloodGroupRequired')
											: ''}
									</FormHelperText>
								</FormControl>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Controller
							name='city'
							rules={{ required: t('auth.completeProfile.cityRequired') }}
							defaultValue=''
							control={control}
							render={({ field }) => (
								<FormControl fullWidth error={Boolean(errors.city)}>
									<InputLabel>{t('auth.completeProfile.city')}</InputLabel>
									<Select {...field}>
										<MenuItem value=''>
											<em>{t('common.none')}</em>
										</MenuItem>
										{cities &&
											cities.map((city) => (
												<MenuItem key={city} value={city}>
													{city}
												</MenuItem>
											))}
									</Select>
									<FormHelperText>{errors.city?.message}</FormHelperText>
								</FormControl>
							)}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button type='submit' className={button}>
							{t('auth.completeProfile.submit')}
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
