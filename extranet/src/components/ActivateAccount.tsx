import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services';
import { authRedesignStyles } from '../styles/authRedesign';

// The activation email's link (see signup in src/controllers/auth.js) points
// here rather than straight at the backend API route -- clicking it used to
// land on a raw JSON response with no UI and no way back to login. See
// issue #357.
const ActivateAccount = () => {
	const { t } = useTranslation();
	const { token } = useParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

	const { screen, header, title, headerIcon, card, primaryButton } = authRedesignStyles();

	useEffect(() => {
		authService
			.activateAccount(token ?? '')
			.then(() => setStatus('success'))
			.catch((error) => {
				console.error('Account activation failed:', error);
				setStatus('error');
			});
	}, [token]);

	const icon =
		status === 'checking' ? (
			<MarkEmailReadIcon />
		) : status === 'success' ? (
			<CheckCircleIcon />
		) : (
			<ErrorOutlineIcon />
		);

	const message =
		status === 'checking'
			? t('auth.activate.checking')
			: status === 'success'
				? t('auth.activate.success')
				: t('auth.activate.invalidToken');

	return (
		<div className={screen}>
			<div className={header}>
				<div className={headerIcon}>{icon}</div>
				<Typography variant='h1' className={title}>
					{t('auth.activate.title')}
				</Typography>
			</div>
			<div className={card} style={{ alignItems: 'center', textAlign: 'center' }}>
				<Typography variant='h6' color={status === 'error' ? 'error' : undefined}>
					{message}
				</Typography>
				{status !== 'checking' && (
					<Button
						type='button'
						fullWidth
						className={primaryButton}
						onClick={() => navigate('/login')}
						style={{ marginTop: '16px' }}
					>
						{t('auth.activate.goToLogin')}
					</Button>
				)}
			</div>
		</div>
	);
};

export default ActivateAccount;
