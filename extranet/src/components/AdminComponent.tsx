import { useNavigate } from 'react-router-dom';
import ActionButton from './shared/ActionButton';

export default function AdminComponent() {
	const navigate = useNavigate();

	return (
		<div>
		<ActionButton
			title='Add Event'
			onClick={() => navigate('/events/create')}
		/>
       
		<ActionButton
			title='Display users'
			onClick={() => navigate('/users?page=1')}
		/>
		</div>
	);
}
