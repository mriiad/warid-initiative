import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authRedesignStyles } from '../../styles/authRedesign';

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
			<IconButton
				className={backButton}
				aria-label={backLabel || t('auth.login.back')}
				onClick={() => navigate(-1)}
			>
				<ArrowBackIcon />
			</IconButton>
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
