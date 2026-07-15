import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCanDonate, useEvent } from '../hooks';
import { eventDetailRedesignStyles } from '../styles/eventDetailRedesign';
import { flowRedesignStyles } from '../styles/flowRedesign';
import { formatDate } from '../utils/utils';

const CanDonate: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();

	const { topBar, topBarDivider, topBarTitle } = eventDetailRedesignStyles();
	const { flowCenter, flowIconCircle, flowTitle, flowButton } = flowRedesignStyles();

	const { data: canDonate, isLoading: isLoadingCanDonate } = useCanDonate();
	const { data: event } = useEvent(reference || '');

	const handleConfirmClick = () => {
		if (canDonate) {
			if (event?.data && !event.data.isGeneric) {
				navigate(`/donate?eventRef=${reference}&eventDate=${formatDate(event.data.date)}`);
			} else {
				navigate(`/donate?eventRef=${reference}`);
			}
		} else {
			navigate(`/events/${reference}/confirmation`);
		}
	};

	const statusConfig = isLoadingCanDonate
		? null
		: canDonate === null
		? {
				icon: HelpOutlineIcon,
				bg: '#F1EFF4',
				fg: '#8A8690',
				message: t('canDonate.unableToDetermine'),
		  }
		: canDonate
		? {
				icon: CheckCircleIcon,
				bg: '#DCEFC9',
				fg: '#5C8A2B',
				message: t('canDonate.canDonate'),
		  }
		: {
				icon: HighlightOffIcon,
				bg: '#FBE4EA',
				fg: '#C56D86',
				message: t('canDonate.cannotDonate'),
		  };

	return (
		<div>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('donation.title')}</Typography>
				<div style={{ width: '30px' }} />
			</div>

			<div className={flowCenter}>
				{isLoadingCanDonate || !statusConfig ? (
					<CircularProgress />
				) : (
					<>
						<div
							className={flowIconCircle}
							style={{ backgroundColor: statusConfig.bg, color: statusConfig.fg }}
						>
							<statusConfig.icon fontSize='large' />
						</div>
						<Typography className={flowTitle}>{statusConfig.message}</Typography>
						<Button type='button' fullWidth className={flowButton} onClick={handleConfirmClick}>
							{t('canDonate.confirm')}
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default CanDonate;
