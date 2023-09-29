import { Button } from '@mui/material';
import { mainStyles } from '../styles/mainStyles';

export default function AdminComponent() {
	const { mainButton } = mainStyles();
	return (
		<div className={mainButton}>
			<Button variant='contained'>Add Event</Button>
		</div>
	);
}
