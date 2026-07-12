import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ActionButton from './shared/ActionButton';

export default function AdminComponent() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div>
		<ActionButton
			title={t('admin.addEvent')}
			onClick={() => navigate('/events/create')}
		/>

		<ActionButton
			title={t('admin.usersList')}
			onClick={() => navigate('/users?page=1')}
		/>
		<ActionButton
			title={t('admin.emergenciesList')}
			onClick={() => navigate('/emergencies?page=1')}
		/>
		</div>
	);
}
