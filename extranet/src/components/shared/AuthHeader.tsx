import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authRedesignStyles } from '../../styles/authRedesign';
import LanguageSwitcher from './LanguageSwitcher';

interface AuthHeaderProps {
	title: string;
	subtitle?: ReactNode;
	backLabel: string;
}

const AuthHeader = ({ title, subtitle, backLabel }: AuthHeaderProps) => {
	const navigate = useNavigate();
	const { header, backButton, title: titleClass, subtitle: subtitleClass } =
		authRedesignStyles();
	const { t } = useTranslation();

	return (
		<div className={header}>
			{/* The language control lives here as well as on /profile: the
				language a first-time visitor reads is settled before they have
				an account to open a profile screen with. See issue #421. */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<IconButton
					className={backButton}
					aria-label={backLabel || t('auth.login.back')}
					onClick={() => navigate(-1)}
				>
					<ArrowBackIcon />
				</IconButton>
				<LanguageSwitcher className={backButton} />
			</div>
			<Typography variant='h1' className={titleClass}>
				{title}
			</Typography>
			{subtitle && (
				<Typography variant='body2' className={subtitleClass}>
					{subtitle}
				</Typography>
			)}
		</div>
	);
};

export default AuthHeader;
