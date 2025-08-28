import { Close } from '@mui/icons-material';
import {
	Box,
	Button,
	Checkbox,
	Drawer,
	FormControlLabel,
	Grid,
	IconButton,
	MenuItem,
	Slider,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BLOOD_GROUP_OPTIONS } from '../data/constants';
import colors from '../styles/colors';
import { authStyles } from '../styles/mainStyles';

const defaultFilters = {
	username: '',
	firstname: '',
	lastname: '',
	email: '',
	phoneNumber: '',
	gender: '',
	bloodGroup: '',
	age: [18, 65],
	availableForDonation: false,
	isAdmin: false,
};

const UserFilter = ({ open, onClose, onApply }) => {
	const { formField, bar, button, form } = authStyles();
	const { t } = useTranslation();
	const [filters, setFilters] = useState(defaultFilters);

	const handleChange = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	};

	const handleSliderChange = (_, newValue) => {
		setFilters({ ...filters, age: newValue });
	};

	const handleCheckboxChange = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.checked });
	};

	const handleApply = (e) => {
		e.preventDefault();
		onApply(filters);
		setTimeout(() => {
			onClose();
		}, 100);
	};

	const handleReset = () => {
		setFilters(defaultFilters);
		onApply({});
		onClose();
	};

	return (
		<Drawer
			anchor='right'
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: { xs: '100%', sm: '450px', md: '480px' },
					maxWidth: { xs: '100vw', sm: '90vw', md: '480px' },
					borderRadius: '20px 0 0 20px',
					boxShadow: '0 20px 60px rgba(255, 48, 103, 0.3)',
					overflow: 'hidden',
				},
			}}
		>
			<Box
				sx={{
					p: { xs: 2, sm: 3 },
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					boxSizing: 'border-box',
				}}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						mb: { xs: 2, sm: 3 },
						flexShrink: 0,
					}}
				>
					<Typography
						variant='h2'
						className={formField}
						sx={{
							fontSize: '1.5rem',
							fontWeight: 'bold',
							color: colors.purple,
						}}
					>
						{t('common.filterUsers')}
						<span className={bar}></span>
					</Typography>
					<IconButton
						onClick={onClose}
						sx={{
							color: colors.rose,
							'&:hover': {
								backgroundColor: colors.rose + '20',
							},
						}}
					>
						<Close />
					</IconButton>
				</Box>

				<Box
					sx={{
						flex: 1,
						overflow: 'auto',
						minHeight: 0,
						'&::-webkit-scrollbar': {
							width: '6px',
						},
						'&::-webkit-scrollbar-track': {
							backgroundColor: 'transparent',
						},
						'&::-webkit-scrollbar-thumb': {
							backgroundColor: colors.rose + '40',
							borderRadius: '3px',
							'&:hover': {
								backgroundColor: colors.rose + '60',
							},
						},
					}}
				>
					<form onSubmit={handleApply} className={form}>
						<Grid container spacing={{ xs: 1, sm: 2 }}>
							<Grid item xs={12}>
								<TextField
									label={t('common.username')}
									name='username'
									value={filters.username}
									onChange={handleChange}
									fullWidth
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label={t('common.firstName')}
									name='firstname'
									value={filters.firstname}
									onChange={handleChange}
									fullWidth
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label={t('common.lastName')}
									name='lastname'
									value={filters.lastname}
									onChange={handleChange}
									fullWidth
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label={t('common.email')}
									name='email'
									value={filters.email}
									onChange={handleChange}
									fullWidth
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									label={t('common.phone')}
									name='phoneNumber'
									value={filters.phoneNumber}
									onChange={handleChange}
									fullWidth
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography
									gutterBottom
									sx={{
										fontSize: { xs: '0.9rem', sm: '1rem' },
										fontWeight: 500,
										color: colors.purple,
										mb: 2,
									}}
								>
									{t('common.age')}: {filters.age[0]} - {filters.age[1]}
								</Typography>
								<Slider
									value={filters.age}
									onChange={handleSliderChange}
									valueLabelDisplay='auto'
									min={18}
									max={65}
									className={formField}
									sx={{
										color: colors.rose,
										'& .MuiSlider-thumb': {
											backgroundColor: colors.rose,
										},
										'& .MuiSlider-track': {
											backgroundColor: colors.rose,
										},
										'& .MuiSlider-rail': {
											backgroundColor: colors.rose + '40',
										},
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									control={
										<Checkbox
											checked={filters.availableForDonation}
											onChange={handleCheckboxChange}
											name='availableForDonation'
											sx={{
												color: colors.rose,
												'&.Mui-checked': {
													color: colors.rose,
												},
											}}
										/>
									}
									label={t('common.availableForDonation')}
									className={formField}
									sx={{
										alignItems: 'flex-start',
										mt: 1,
										'& .MuiFormControlLabel-label': {
											fontSize: { xs: '0.9rem', sm: '1rem' },
											lineHeight: 1.4,
											marginTop: '2px',
										},
									}}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									select
									label={t('common.gender')}
									name='gender'
									value={filters.gender}
									onChange={handleChange}
									fullWidth
									className={formField}
								>
									<MenuItem value='male'>{t('common.male')}</MenuItem>
									<MenuItem value='female'>{t('common.female')}</MenuItem>
								</TextField>
							</Grid>
							<Grid item xs={12}>
								<TextField
									select
									label={t('common.bloodGroup')}
									name='bloodGroup'
									value={filters.bloodGroup}
									onChange={handleChange}
									fullWidth
									className={formField}
								>
									{BLOOD_GROUP_OPTIONS.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									control={
										<Checkbox
											checked={filters.isAdmin}
											onChange={handleCheckboxChange}
											name='isAdmin'
											sx={{
												color: colors.rose,
												'&.Mui-checked': {
													color: colors.rose,
												},
											}}
										/>
									}
									label={t('common.isAdmin')}
									className={formField}
									sx={{
										alignItems: 'flex-start',
										mt: 1,
										'& .MuiFormControlLabel-label': {
											fontSize: { xs: '0.9rem', sm: '1rem' },
											lineHeight: 1.4,
											marginTop: '2px',
										},
									}}
								/>
							</Grid>

							<Grid item xs={12} sx={{ mt: { xs: 1, sm: 2 }, mb: 1 }}>
								<Grid container spacing={{ xs: 1, sm: 2 }}>
									<Grid item xs={6}>
										<Button
											type='button'
											onClick={handleReset}
											variant='outlined'
											color='secondary'
											className={button}
											fullWidth
											sx={{
												fontSize: { xs: '0.875rem', sm: '1rem' },
												padding: { xs: '8px 16px', sm: '12px 24px' },
											}}
										>
											{t('common.reset')}
										</Button>
									</Grid>
									<Grid item xs={6}>
										<Button
											type='submit'
											variant='contained'
											color='primary'
											className={button}
											fullWidth
											sx={{
												fontSize: { xs: '0.875rem', sm: '1rem' },
												padding: { xs: '8px 16px', sm: '12px 24px' },
											}}
										>
											{t('common.applyFilters')}
										</Button>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</form>
				</Box>
			</Box>
		</Drawer>
	);
};

export default UserFilter;
