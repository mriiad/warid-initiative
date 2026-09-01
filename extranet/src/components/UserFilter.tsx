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
import { authRedesignStyles } from '../styles/authRedesign';
import { userFilterRedesignStyles } from '../styles/userFilterRedesign';
import Ltr from './shared/Ltr';

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

const filterFieldLabelKeys: Record<string, string> = {
	username: 'users.filter.username',
	firstname: 'users.filter.firstName',
	lastname: 'users.filter.lastName',
	email: 'users.filter.email',
	phoneNumber: 'users.filter.phoneNumber',
};

const UserFilter = ({ open, onClose, onApply }) => {
	const { t } = useTranslation();
	const { input } = authRedesignStyles();
	const {
		paper,
		container,
		headerRow,
		title,
		closeButton,
		body,
		sectionLabel,
		checkboxLabel,
		slider,
		actionsRow,
		resetButton,
		applyButton,
	} = userFilterRedesignStyles();
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
		<Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ className: paper }}>
			<Box className={container}>
				<Box className={headerRow}>
					<Typography className={title}>{t('users.filter.title')}</Typography>
					<IconButton className={closeButton} onClick={onClose} aria-label={t('common.close')}>
						<Close fontSize='small' />
					</IconButton>
				</Box>

				<Box className={body}>
					<form onSubmit={handleApply} id='user-filter-form'>
						<Grid container spacing={2}>
							{[
								'username',
								'firstname',
								'lastname',
								'email',
								'phoneNumber',
							].map((field) => (
								<Grid item xs={12} key={field}>
									<TextField
										label={t(filterFieldLabelKeys[field])}
										name={field}
										value={filters[field]}
										onChange={handleChange}
										fullWidth
										className={input}
									/>
								</Grid>
							))}
							<Grid item xs={12}>
								<Typography className={sectionLabel}>
									{t('users.filter.age')}: {filters.age[0]} - {filters.age[1]}
								</Typography>
								<Slider
									value={filters.age}
									onChange={handleSliderChange}
									valueLabelDisplay='auto'
									min={18}
									max={65}
									className={slider}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									className={checkboxLabel}
									control={
										<Checkbox
											checked={filters.availableForDonation}
											onChange={handleCheckboxChange}
											name='availableForDonation'
										/>
									}
									label={t('users.filter.availableForDonation')}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									select
									label={t('users.filter.gender')}
									name='gender'
									value={filters.gender}
									onChange={handleChange}
									fullWidth
									className={input}
								>
									<MenuItem value='male'>{t('users.filter.male')}</MenuItem>
									<MenuItem value='female'>{t('users.filter.female')}</MenuItem>
								</TextField>
							</Grid>
							<Grid item xs={12}>
								<TextField
									select
									label={t('users.filter.bloodGroup')}
									name='bloodGroup'
									value={filters.bloodGroup}
									onChange={handleChange}
									fullWidth
									className={input}
								>
									{BLOOD_GROUP_OPTIONS.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											<Ltr>{option.label}</Ltr>
										</MenuItem>
									))}
								</TextField>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									className={checkboxLabel}
									control={
										<Checkbox
											checked={filters.isAdmin}
											onChange={handleCheckboxChange}
											name='isAdmin'
										/>
									}
									label={t('users.filter.isAdmin')}
								/>
							</Grid>
						</Grid>
					</form>
				</Box>

				<Box className={actionsRow}>
					<Button
						type='button'
						onClick={handleReset}
						variant='outlined'
						className={resetButton}
					>
						{t('users.filter.reset')}
					</Button>
					<Button type='submit' form='user-filter-form' variant='contained' className={applyButton}>
						{t('users.filter.apply')}
					</Button>
				</Box>
			</Box>
		</Drawer>
	);
};

export default UserFilter;
