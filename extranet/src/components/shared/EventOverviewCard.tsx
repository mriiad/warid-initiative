import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { IconButton, Typography } from '@mui/material';
import clsx from 'clsx';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { eventOverviewCardStyles } from '../../styles/eventOverviewCard';

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface EventOverviewCardProps {
	title: string;
	date: string;
	createdAt?: string;
	mapLink?: string;
	primaryActionLabel: string;
	primaryActionIcon?: ReactNode;
	onPrimaryAction: () => void;
	onViewDetails: () => void;
}

const EventOverviewCard = ({
	title,
	date,
	createdAt,
	mapLink,
	primaryActionLabel,
	primaryActionIcon,
	onPrimaryAction,
	onViewDetails,
}: EventOverviewCardProps) => {
	const { t, i18n } = useTranslation();
	const {
		card,
		headerRow,
		iconBadge,
		title: titleClass,
		dateRow,
		dateStart,
		dateEnd,
		progressTrack,
		progressFill,
		weekStrip,
		weekDay,
		weekDayNumber,
		weekDayNumberActive,
		actionsRow,
		primaryActionButton,
		iconSquareButton,
		iconSquareButtonNeutral,
	} = eventOverviewCardStyles();

	const eventDate = useMemo(() => new Date(date), [date]);
	const eventCreatedAt = useMemo(() => (createdAt ? new Date(createdAt) : null), [createdAt]);

	const progressPercent = useMemo(() => {
		if (!eventCreatedAt) return 100;
		const total = eventDate.getTime() - eventCreatedAt.getTime();
		if (total <= 0) return 100;
		const elapsed = Date.now() - eventCreatedAt.getTime();
		return Math.min(100, Math.max(0, (elapsed / total) * 100));
	}, [eventDate, eventCreatedAt]);

	const weekStripDays = useMemo(() => {
		const monday = new Date(eventDate);
		const day = monday.getDay();
		const diffToMonday = day === 0 ? -6 : 1 - day;
		monday.setDate(monday.getDate() + diffToMonday);
		return Array.from({ length: 7 }, (_, index) => {
			const d = new Date(monday);
			d.setDate(monday.getDate() + index);
			return d;
		});
	}, [eventDate]);

	const locale = i18n.language === 'ar' ? 'ar' : i18n.language === 'fr' ? 'fr' : 'en';
	const formatDate = (d: Date) =>
		d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

	return (
		<div className={card}>
			<div className={headerRow}>
				<div className={iconBadge}>
					<EventIcon fontSize='small' />
				</div>
				<Typography className={titleClass}>{title}</Typography>
			</div>
			<div className={dateRow}>
				<span className={dateStart}>
					{eventCreatedAt ? `${t('admin.createdOn')} ${formatDate(eventCreatedAt)}` : ''}
				</span>
				<span className={dateEnd}>{formatDate(eventDate)}</span>
			</div>
			<div className={progressTrack}>
				<div className={progressFill} style={{ width: `${progressPercent}%` }} />
			</div>
			<div className={weekStrip}>
				{weekStripDays.map((d, index) => {
					const isEventDay = d.toDateString() === eventDate.toDateString();
					return (
						<div className={weekDay} key={d.toISOString()}>
							<span>{t(`admin.weekday.${WEEKDAY_KEYS[index]}`, WEEKDAY_KEYS[index])}</span>
							<span className={clsx(weekDayNumber, isEventDay && weekDayNumberActive)}>
								{d.getDate()}
							</span>
						</div>
					);
				})}
			</div>
			<div className={actionsRow}>
				<button type='button' className={primaryActionButton} onClick={onPrimaryAction}>
					{primaryActionLabel}
					{primaryActionIcon}
				</button>
				{mapLink && (
					<IconButton
						className={iconSquareButton}
						aria-label={t('admin.viewLocation')}
						component='a'
						href={mapLink}
						target='_blank'
						rel='noopener noreferrer'
					>
						<LocationOnIcon />
					</IconButton>
				)}
				<IconButton
					className={iconSquareButtonNeutral}
					aria-label={t('admin.viewDetails')}
					onClick={onViewDetails}
				>
					<ArrowForwardIcon />
				</IconButton>
			</div>
		</div>
	);
};

export default EventOverviewCard;
