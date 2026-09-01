import InstagramIcon from '@mui/icons-material/Instagram';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { IconButton, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '@/types';
import { useEvents } from '../../hooks';
import { landingRedesignStyles } from '../../styles/landingRedesign';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import EventOverviewCard from '../shared/EventOverviewCard';
import BloodDropsAnimation from './BloodDropsAnimation';
import PartnersList from './PartnersList';
import PhotoGallery from './PhotoGallery';

const LandingPage = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { token } = useAuth();
	const {
		screen,
		hero,
		heroTopRow,
		heroIcon,
		heroAccountButton,
		heroTitle,
		heroSubtitle,
		content,
		statStrip,
		statPill,
		statNumber,
		statLabel,
		sectionTitle,
		card,
		aboutRow,
		aboutIcon,
		aboutTitle,
		aboutBody,
		galleryWrapper,
		footer,
		footerLinksRow,
		footerLink,
		footerLinkDivider,
		footerCopyright,
		socialRow,
		socialButton,
	} = landingRedesignStyles();

	const { data: eventsResponse } = useEvents(1);

	const nextEvent: Event | undefined = useMemo(() => {
		const events: Event[] = eventsResponse?.data?.events || [];
		const now = new Date();
		const upcoming = events
			.filter((event) => !event.isGeneric)
			.filter((event) => new Date(event.date).getTime() >= now.setHours(0, 0, 0, 0))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		return upcoming[0];
	}, [eventsResponse]);

	const totalEvents = eventsResponse?.data?.totalItems;

	return (
		<div className={screen}>
			<BloodDropsAnimation />
			<div className={hero}>
				<div className={heroTopRow}>
					<div className={heroIcon}>
						<WaterDropIcon />
					</div>
					<IconButton
						className={heroAccountButton}
						aria-label={t('landing.myAccount')}
						onClick={() => navigate(token ? '/profile' : '/login')}
					>
						<PersonOutlineIcon />
					</IconButton>
				</div>
				<Typography className={heroTitle}>{t('landing.heroTitle')}</Typography>
				<Typography className={heroSubtitle}>{t('landing.heroSubtitle')}</Typography>
			</div>

			<div className={content}>
				{/*
					Only stats backed by a real response belong here. The donor
					count next to this one was a hardcoded 84,750 animated up
					from zero, sitting beside this genuinely API-driven figure
					with nothing to tell a visitor which was which. Restoring it
					needs a public counts endpoint -- /api/admin/stats is
					admin-gated -- rather than another constant. See issue #385.
				*/}
				<div className={statStrip}>
					<div className={statPill}>
						<Typography className={statNumber}>{totalEvents ?? '—'}</Typography>
						<Typography className={statLabel}>{t('landing.eventsLabel')}</Typography>
					</div>
				</div>

				<Typography className={sectionTitle}>{t('admin.nextEvent')}</Typography>
				{!nextEvent ? (
					<div className={card}>
						<Typography className={aboutBody}>{t('landing.noUpcomingEvents')}</Typography>
					</div>
				) : (
					<EventOverviewCard
						title={nextEvent.title}
						date={nextEvent.date}
						createdAt={nextEvent.createdAt}
						mapLink={nextEvent.mapLink}
						primaryActionLabel={t('landing.exploreEvents')}
						onPrimaryAction={() => navigate('/events')}
						onViewDetails={() => navigate(`/events/${nextEvent.reference}`)}
					/>
				)}

				<div className={card}>
					<div className={aboutRow}>
						<div className={aboutIcon}>🤝</div>
						<div>
							<Typography className={aboutTitle}>{t('landing.aboutTitle')}</Typography>
							<Typography className={aboutBody}>{t('landing.intro')}</Typography>
						</div>
					</div>
				</div>

				<Typography className={sectionTitle}>{t('landing.gallery')}</Typography>
				<div className={galleryWrapper}>
					<PhotoGallery />
				</div>

				<Typography className={sectionTitle}>{t('landing.partners')}</Typography>
				<div className={card}>
					<PartnersList />
				</div>

				<div className={footer}>
					<div className={socialRow}>
						<IconButton
							className={socialButton}
							aria-label='Instagram'
							component='a'
							href='https://www.instagram.com/warid_initiative'
							target='_blank'
							rel='noopener noreferrer'
						>
							<InstagramIcon fontSize='small' />
						</IconButton>
					</div>
					{/* regression (issue #328): /FAQ and /contact still exist and were
						redesigned onto the same styling system, but nothing in the
						current navigation links to either one -- the only place that
						ever did was the old, pre-redesign MobileNavbar, which is now
						unreachable for practically every route a normal user visits.
						Both routes work whether logged in or not (see App.tsx), so
						they belong here alongside Privacy Policy, not just on the
						(auth-only) profile page. */}
					<div className={footerLinksRow}>
						<button type='button' className={footerLink} onClick={() => navigate('/FAQ')}>
							{t('faq.pageTitle')}
						</button>
						<span className={footerLinkDivider} aria-hidden='true'>·</span>
						<button type='button' className={footerLink} onClick={() => navigate('/contact')}>
							{t('contact.title')}
						</button>
						<span className={footerLinkDivider} aria-hidden='true'>·</span>
						<a
							className={footerLink}
							href='/files/Warid_Policies.pdf'
							target='_blank'
							rel='noopener noreferrer'
						>
							{t('landing.privacyPolicy')}
						</a>
					</div>
					<Typography className={footerCopyright}>
						{t('landing.copyright', { year: new Date().getFullYear() })}
					</Typography>
				</div>
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default LandingPage;
