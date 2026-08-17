import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import MapIcon from '@mui/icons-material/Map';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import { Button, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Event } from '@/types';
import { authRedesignStyles } from '../../styles/authRedesign';
import { statCardColors } from '../../styles/dashboardRedesign';
import { eventDetailRedesignStyles } from '../../styles/eventDetailRedesign';
import { ParticipantStats } from '../../hooks';
import EventOverviewCard from '../shared/EventOverviewCard';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import SaveQrModal from './SaveQrModal';

interface AdminEventDetailViewProps {
	event: Event;
	participantStats?: ParticipantStats;
	onDelete: () => void;
}

const AdminEventDetailView = ({ event, participantStats, onDelete }: AdminEventDetailViewProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [showQrModal, setShowQrModal] = useState(false);
	const { primaryButton } = authRedesignStyles();
	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		content,
		hero,
		heroIcon,
		heroActions,
		heroEditButton,
		heroDeleteButton,
		heroTitle,
		heroSubtitle,
		sectionTitle,
		locationCard,
		locationIcon,
		locationName,
		mapLinkButton,
		statRow,
		statRowIcon,
		statRowLabel,
		statRowValue,
		qrCard,
	} = eventDetailRedesignStyles();

	const heroDate = new Date(event.date).toLocaleDateString(undefined, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	const statRows = [
		{
			key: 'allDonaters',
			label: t('events.detail.allDonaters'),
			value: participantStats?.allDonaters ?? 0,
			icon: PeopleIcon,
			colors: statCardColors.users,
		},
		...(participantStats && !participantStats.isGeneric
			? [
					{
						key: 'realDonaters',
						label: t('events.detail.realDonaters'),
						value: participantStats.realDonaters ?? 0,
						icon: AccessTimeIcon,
						colors: statCardColors.donations,
					},
					{
						key: 'registeredParticipants',
						label: t('events.detail.registeredParticipants'),
						value: participantStats.registeredParticipants ?? 0,
						icon: EventIcon,
						colors: statCardColors.users,
					},
				]
			: []),
	];

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate('/events')}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{event.title}</Typography>
				<IconButton aria-label={t('events.list.searchPlaceholder')}>
					<SearchIcon />
				</IconButton>
			</div>

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<EventIcon />
					</div>
					<div className={heroActions}>
						<IconButton
							className={heroEditButton}
							aria-label={t('common.edit')}
							onClick={() => navigate(`/events/update/${event.reference}`)}
						>
							<EditIcon />
						</IconButton>
						<IconButton
							className={heroDeleteButton}
							aria-label={t('events.card.delete')}
							onClick={onDelete}
						>
							<DeleteIcon />
						</IconButton>
					</div>
					<Typography className={heroTitle}>{event.title}</Typography>
					<Typography className={heroSubtitle}>{heroDate}</Typography>
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

				{participantStats && (
					<>
						<Typography className={sectionTitle}>
							{t('events.detail.participantDetailsTitle')}
						</Typography>
						{statRows.map((row) => {
							const Icon = row.icon;
							return (
								<div className={statRow} key={row.key}>
									<div
										className={statRowIcon}
										style={{ backgroundColor: row.colors.bg, color: row.colors.fg }}
									>
										<Icon fontSize='small' />
									</div>
									<Typography className={statRowLabel}>{row.label}</Typography>
									<div className={statRowValue}>{row.value}</div>
								</div>
							);
						})}
					</>
				)}

				{event.qrCode && (
					<div className={qrCard}>
						<Button className={primaryButton} onClick={() => setShowQrModal(true)}>
							{t('events.detail.getQrCode')}
						</Button>
					</div>
				)}
			</div>

			<RedesignBottomNav />

			{event.qrCode && (
				<SaveQrModal
					open={showQrModal}
					qrCodeDataUrl={event.qrCode}
					downloadName={`warid-event-${event.reference}-qr.png`}
					onClose={() => setShowQrModal(false)}
				/>
			)}
		</div>
	);
};

export default AdminEventDetailView;
