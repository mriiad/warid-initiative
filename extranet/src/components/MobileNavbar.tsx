import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const MobileNavbar = () => {
	const { token, isAdmin } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [value, setValue] = React.useState(location.pathname);

	const handleChange = (event, newValue) => {
		setValue(newValue);
		navigate(newValue);
	};

	return (
		<BottomNavigation value={value} onChange={handleChange} showLabels>
			<BottomNavigationAction label='Home' value='/' icon={<HomeIcon />} />
			<BottomNavigationAction
				label='About'
				value='/about'
				icon={<InfoIcon />}
			/>
			<BottomNavigationAction
				label='Events'
				value='/events?page=1'
				icon={<EventIcon />}
			/>
			{token && isAdmin && (
				<BottomNavigationAction
					label='Admin'
					value='/admin'
					icon={<AdminPanelSettingsIcon />}
				/>
			)}
		</BottomNavigation>
	);
};

export default MobileNavbar;
