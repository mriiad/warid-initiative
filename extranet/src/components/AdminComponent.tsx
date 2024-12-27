import { useNavigate } from 'react-router-dom';
import ActionButton from './shared/ActionButton';
import { useTranslation } from 'react-i18next';

export default function AdminComponent() {
	const { t }: { t: (key: string) => string } = useTranslation();
	const navigate = useNavigate();

	return (
		<div>
		<ActionButton
			title={t('Admin.events')}
			onClick={() => navigate('/events/create')}
		/>
       
		<ActionButton
			title={t('Admin.users')}
			onClick={() => navigate('/users?page=1')}
		/>
		</div>
	);
}
