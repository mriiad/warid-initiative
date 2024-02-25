import { useNavigate } from 'react-router-dom';
import ActionButton from './shared/ActionButton';

export default function AdminComponent() {
	const navigate = useNavigate();

	return (
		<div>
		<ActionButton
			title='إضافة حدث'
			onClick={() => navigate('/events/create')}
		/>
       
		<ActionButton
			title='لائحة المستخدمين'
			onClick={() => navigate('/users?page=1')}
		/>
		</div>
	);
}
