import {
	Button,
	Checkbox,
	Drawer,
	FormControlLabel,
	Grid,
	Slider,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import { authStyles, mainStyles } from '../styles/mainStyles';
import FormContainer from './shared/FormContainer';

const UserFilter = ({ open, onClose, onApply }) => {
	const { formField, bar, button, form } = authStyles();
	const { subTitle, textButton } = mainStyles();
	const [filters, setFilters] = useState({
		username: '',
		firstname: '',
		lastname: '',
		age: [18, 65],
		availableForDonation: false,
	});

	const handleChange = (e) => {
		setFilters({
			...filters,
			[e.target.name]: e.target.value,
		});
	};

	const handleSliderChange = (e, newValue) => {
		setFilters({
			...filters,
			age: newValue,
		});
	};

	const handleCheckboxChange = (e) => {
		setFilters({
			...filters,
			availableForDonation: e.target.checked,
		});
	};

	const handleApply = (e) => {
		e.preventDefault();
		onApply(filters);
		onClose();
	};

	const handleReset = () => {
		setFilters({
			username: '',
			firstname: '',
			lastname: '',
			age: [18, 65],
			availableForDonation: false,
		});
		onApply({});
		onClose();
	};

	return (
		<Drawer anchor='bottom' open={open} onClose={onClose}>
			<FormContainer>
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
						<Grid item xs={12}>
							<TextField
								label='Username'
								name='username'
								value={filters.username}
								onChange={handleChange}
								fullWidth
								className={formField}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label='First Name'
								name='firstname'
								value={filters.firstname}
								onChange={handleChange}
								fullWidth
								className={formField}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								label='Last Name'
								name='lastname'
								value={filters.lastname}
								onChange={handleChange}
								fullWidth
								className={formField}
							/>
						</Grid>
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
			</FormContainer>
		</Drawer>
	);
};

export default UserFilter;
