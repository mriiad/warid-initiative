import {
	Button,
	Checkbox,
	Drawer,
	FormControlLabel,
	Grid,
	MenuItem,
	Slider,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import colors from '../styles/colors';
import { authStyles } from '../styles/mainStyles';

const defaultFilters = {
	username: '',
	firstname: '',
	lastname: '',
	email: '',
	phoneNumber: '',
	gender: '',
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
		onClose();
	};

	const handleReset = () => {
		setFilters(defaultFilters);
		onApply({});
		onClose();
	};

	return (
		<Drawer
			anchor='bottom'
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					backgroundColor: colors.formWhite,
					borderRadius: '30px 30px 0 0',
					border: '1px solid white',
					boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
					maxHeight: '80vh',
				},
			}}
		>
			<div
				style={{
					padding: '20px',
					backgroundColor: colors.formWhite,
					borderRadius: '30px',
					border: '1px solid white',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Typography
						variant='h2'
						align='center'
						gutterBottom
						className={formField}
					>
						Filter Users
						<span className={bar}></span>
					</Typography>
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
							<Grid item xs={6}>
								<Button
									onClick={handleReset}
									variant='outlined'
									color='secondary'
									className={button}
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
								>
									Apply
								</Button>
							</Grid>
						</Grid>
					</form>
				</div>
			</div>
		</Drawer>
	);
};

export default UserFilter;
