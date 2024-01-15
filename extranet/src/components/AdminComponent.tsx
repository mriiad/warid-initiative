import { useNavigate } from 'react-router-dom';
import ActionButton from './shared/ActionButton';

export default function AdminComponent() {
	const navigate = useNavigate();

	return (
		<ActionButton
			title='Add Event'
			onClick={() => navigate('/events/create')}
		/>
	);
}
