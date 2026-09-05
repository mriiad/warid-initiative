import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Button } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ProfileFormData } from '@/types';
import { BLOOD_GROUP_OPTIONS, BloodGroup } from '../data/constants';
import { useCompleteMyProfile, useUserProfile } from '../hooks';
import { authRedesignStyles } from '../styles/authRedesign';
import { cities, formatDate } from '../utils/utils';
import AuthHeader from './shared/AuthHeader';
import RedesignBottomNav from './shared/RedesignBottomNav';
import SnackbarComponent from './shared/SnackbarComponent';
import Ltr from './shared/Ltr';

const fieldTranslationKeys: { [K in keyof ProfileFormData]: string } = {
	firstname: 'auth.completeProfile.firstName',
	lastname: 'auth.completeProfile.lastName',
	birthdate: 'auth.completeProfile.birthdate',
	bloodGroup: 'auth.completeProfile.bloodGroup',
	city: 'auth.completeProfile.city',
};

const UserProfileForm = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { screen, card, input, primaryButton } = authRedesignStyles();
	const [showSnackbar, setShowSnackbar] = useState(false);
	const [incompleteFieldsMessage, setIncompleteFieldsMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const completeProfile = useCompleteMyProfile();

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
		// t is stable across renders (react-i18next only changes its identity
		// on a language switch), and re-running this on a language change is
		// exactly right: it regenerates the missing-fields message in the new
		// language.
	}, [userProfile, setValue, t]);

	const onSubmit = (formData: ProfileFormData) => {
		setErrorMessage(null);
		completeProfile.mutate(formData, {
			onSuccess: () => {
				navigate('/events');
			},
			onError: () => setErrorMessage(t('auth.completeProfile.updateError')),
		});
	};

	return (
		<div className={screen}>
			<AuthHeader
				title={t('auth.completeProfile.title')}
				backLabel={t('common.back')}
			/>
			<div className={card}>
				{/* noValidate: three of the fields below pass `required`, which
				    sets the native HTML attribute -- without this the browser's
				    own constraint check blocked the submit event before
				    react-hook-form ever ran, so pressing the button did nothing
				    visible and none of the translated messages defined here were
				    ever reached. Matches LoginForm/SignupForm. See issue #414. */}
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<Controller
							name='firstname'
							control={control}
							rules={{ required: t('auth.completeProfile.firstNameRequired') }}
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.completeProfile.firstName')}
									required
									{...field}
									error={Boolean(errors.firstname)}
									helperText={errors.firstname?.message || ''}
								/>
							)}
						/>
						<Controller
							name='lastname'
							control={control}
							rules={{ required: t('auth.completeProfile.lastNameRequired') }}
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.completeProfile.lastName')}
									required
									{...field}
									error={Boolean(errors.lastname)}
									helperText={errors.lastname?.message || ''}
								/>
							)}
						/>
						<Controller
							name='birthdate'
							control={control}
							rules={{ required: t('auth.completeProfile.birthdateRequired') }}
							render={({ field }) => (
								<TextField
									fullWidth
									className={input}
									label={t('auth.completeProfile.birthdate')}
									type='date'
									required
									InputLabelProps={{ shrink: true }}
									{...field}
									error={Boolean(errors.birthdate)}
									helperText={errors.birthdate?.message || ''}
								/>
							)}
						/>
						<Controller
							name='bloodGroup'
							control={control}
							render={({ field }) => (
								<FormControl fullWidth className={input} error={Boolean(errors.bloodGroup)}>
									<InputLabel>{t('auth.completeProfile.bloodGroup')}</InputLabel>
									<Select {...field} label={t('auth.completeProfile.bloodGroup')}>
										<MenuItem value=''>
											<em>{t('common.none')}</em>
										</MenuItem>
										{BLOOD_GROUP_OPTIONS.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												<Ltr>{option.label}</Ltr>
											</MenuItem>
										))}
									</Select>
									<FormHelperText>{errors.bloodGroup?.message}</FormHelperText>
								</FormControl>
							)}
						/>
						<Controller
							name='city'
							control={control}
							defaultValue=''
							rules={{ required: t('auth.completeProfile.cityRequired') }}
							render={({ field }) => (
								<FormControl fullWidth className={input} error={Boolean(errors.city)}>
									<InputLabel>{t('auth.completeProfile.city')}</InputLabel>
									<Select {...field} label={t('auth.completeProfile.city')}>
										<MenuItem value=''>
											<em>{t('common.none')}</em>
										</MenuItem>
										{cities.map((city) => (
											<MenuItem key={city} value={city}>
												{city}
											</MenuItem>
										))}
									</Select>
									<FormHelperText>{errors.city?.message}</FormHelperText>
								</FormControl>
							)}
						/>
						<Button
							type='submit'
							fullWidth
							className={primaryButton}
							disabled={completeProfile.isPending}
						>
							{t('auth.completeProfile.submit')}
						</Button>
					</div>
				</form>
			</div>

			<RedesignBottomNav />

			<SnackbarComponent
				open={showSnackbar}
				message={incompleteFieldsMessage}
				handleClose={() => setShowSnackbar(false)}
				autoHideDuration={5000}
			/>
			<SnackbarComponent
				open={Boolean(errorMessage)}
				message={errorMessage || ''}
				handleClose={() => setErrorMessage(null)}
				autoHideDuration={6000}
			/>
		</div>
	);
};

export default UserProfileForm;
