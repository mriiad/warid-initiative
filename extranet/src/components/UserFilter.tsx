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
					width: { xs: '100%', sm: '400px' },
					borderRadius: '20px 0 0 20px',
					boxShadow: '0 20px 60px rgba(255, 48, 103, 0.3)',
				},
			}}
		>
			<Box
				sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
			>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						mb: 3,
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
						Filter Users
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

				<Box sx={{ flex: 1, overflow: 'auto' }}>
					<form onSubmit={handleApply} className={form}>
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
										label={field[0].toUpperCase() + field.slice(1)}
										name={field}
										value={filters[field]}
										onChange={handleChange}
										fullWidth
										className={formField}
									/>
								</Grid>
							))}
							<Grid item xs={12}>
								<Typography gutterBottom>
									Age: {filters.age[0]} - {filters.age[1]}
								</Typography>
								<Slider
									value={filters.age}
									onChange={handleSliderChange}
									valueLabelDisplay='auto'
									min={18}
									max={65}
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									control={
										<Checkbox
											checked={filters.availableForDonation}
											onChange={handleCheckboxChange}
											name='availableForDonation'
										/>
									}
									label='Available for Donation'
									className={formField}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									select
									label='Gender'
									name='gender'
									value={filters.gender}
									onChange={handleChange}
									fullWidth
									className={formField}
								>
									<MenuItem value='male'>Male</MenuItem>
									<MenuItem value='female'>Female</MenuItem>
								</TextField>
							</Grid>
							<Grid item xs={12}>
								<TextField
									select
									label='Blood Group'
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
										/>
									}
									label='Is Admin'
									className={formField}
								/>
							</Grid>

							<Grid item xs={12} sx={{ mt: 2 }}>
								<Grid container spacing={2}>
									<Grid item xs={6}>
										<Button
											type='button'
											onClick={handleReset}
											variant='outlined'
											color='secondary'
											className={button}
											fullWidth
										>
											Reset
										</Button>
									</Grid>
									<Grid item xs={6}>
										<Button
											type='submit'
											variant='contained'
											color='primary'
											className={button}
											fullWidth
										>
											Apply Filters
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
