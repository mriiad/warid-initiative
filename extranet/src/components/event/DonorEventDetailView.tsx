import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types';
import { eventDetailRedesignStyles } from '../../styles/eventDetailRedesign';
import EventOverviewCard from '../shared/EventOverviewCard';
import RedesignBottomNav from '../shared/RedesignBottomNav';

interface DonorEventDetailViewProps {
	event: Event;
	hasParticipated?: boolean;
	isParticipating: boolean;
	onParticipate: () => void;
}

const DonorEventDetailView = ({
	event,
	hasParticipated,
	isParticipating,
	onParticipate,
}: DonorEventDetailViewProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		content,
		hero,
		heroTopRow,
		heroIcon,
		heroDayBadge,
		heroTitle,
		heroSubtitle,
		sectionTitle,
		locationCard,
		locationIcon,
		locationName,
		mapLinkButton,
		descriptionCard,
		descriptionText,
		qrCard,
		qrImage,
		participateButton,
		participatedBanner,
	} = eventDetailRedesignStyles();

	const startDate = event.createdAt ? new Date(event.createdAt) : new Date(event.date);
	const endDate = new Date(event.date);
	const endDateLabel = endDate.toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{event.title}</Typography>
				<IconButton aria-label={t('admin.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroTopRow}>
						<div className={heroIcon} style={{ marginBottom: 0 }}>
							<LocationOnIcon fontSize='small' />
						</div>
						<div className={heroDayBadge}>{startDate.getDate()}</div>
					</div>
					<Typography className={heroTitle}>{event.title}</Typography>
					<Typography className={heroSubtitle}>{endDateLabel}</Typography>
				</div>

				<Typography className={sectionTitle}>{t('events.detail.eventDateHeading')}</Typography>
				<EventOverviewCard
					title={t('events.detail.eventDateHeading')}
					date={event.date}
					createdAt={event.createdAt}
				/>

				<div className={locationCard}>
					<div className={locationIcon}>
						<MapIcon fontSize='small' />
					</div>
					<Typography className={locationName}>{event.location}</Typography>
					{event.mapLink && (
						<IconButton
							className={mapLinkButton}
							aria-label={t('events.detail.openMap')}
							component='a'
							href={event.mapLink}
							target='_blank'
							rel='noopener noreferrer'
						>
							<MapIcon />
						</IconButton>
					)}
				</div>

				{event.description && (
					<div className={descriptionCard}>
						<Typography className={descriptionText}>{event.description}</Typography>
					</div>
				)}

				{event.qrCode && (
					<div className={qrCard}>
						<Typography className={sectionTitle}>{t('events.detail.qrScanTitle')}</Typography>
						<img src={event.qrCode} alt='QR Code' className={qrImage} />
					</div>
				)}

				{hasParticipated ? (
					<Typography className={participatedBanner}>
						{t('events.detail.participationConfirmed')}
					</Typography>
				) : (
					<Button
						type='button'
						fullWidth
						className={participateButton}
						onClick={onParticipate}
						disabled={isParticipating}
					>
						{t('events.detail.participate')}
					</Button>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default DonorEventDetailView;
