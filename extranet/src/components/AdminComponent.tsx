import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ActionButton from './shared/ActionButton';

export default function AdminComponent() {
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<div>
			<ActionButton
				title={t('admin.createEvent')}
				onClick={() => navigate('/events/create')}
			/>

			<ActionButton
				title={t('admin.manageUsers')}
				onClick={() => navigate('/users?page=1')}
			/>
			<ActionButton
				title={t('admin.manageEmergencies')}
				onClick={() => navigate('/emergencies?page=1')}
			/>
		</div>
	);
}
