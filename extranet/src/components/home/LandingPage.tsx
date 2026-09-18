import InstagramIcon from '@mui/icons-material/Instagram';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Button, CircularProgress, IconButton, Typography } from '@mui/material';
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

	// isError and isLoading are read, not just data: without them a request in
	// flight, one that failed, and an empty database all left totalItems
	// undefined, and the stat pill rendered the same em dash for all three --
	// so a failure was indistinguishable from "we have no events". Same flaw
	// issue #418 fixed on EventDetail. See issue #452.
	// Filtered server-side, not client-side. Asking for page 1 unfiltered
	// returns the five *oldest* events -- getEvents sorts date ascending --
	// and narrowing that page here meant five past events were enough to
	// empty the card for good while upcoming ones sat on later pages. The
	// admin dashboard already asked correctly; this screen was missed. Same
	// bug issue #417 fixed for the donor list. See issue #453.
	//
	// It also makes totalItems count upcoming events, so the number in the
	// stat pill and the card beneath it describe the same set rather than
	// two different ones.
	const {
		data: eventsResponse,
		isLoading: isLoadingEvents,
		isError: isEventsError,
		refetch: refetchEvents,
	} = useEvents(1, { upcoming: true, includeGeneric: false });

	// The server now returns upcoming, non-generic events already, so this is
	// defence in depth rather than the filter the screen depends on: a stale
	// cache entry or a response that ignored the params must not advertise an
	// event that has been and gone. startOfToday is computed once instead of
	// through setHours on a shared Date, which mutated it inside the filter.
	const nextEvent: Event | undefined = useMemo(() => {
		const events: Event[] = eventsResponse?.data?.events || [];
		const startOfToday = new Date().setHours(0, 0, 0, 0);
		const upcoming = events
			.filter((event) => !event.isGeneric)
			.filter((event) => new Date(event.date).getTime() >= startOfToday)
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
				{/*
					The count and the next-event card are both drawn from this
					one request, so its failure is reported once for both.
					Showing "couldn't load" above "no upcoming events" would
					contradict itself.
				*/}
				{isEventsError ? (
					<div className={card}>
						<Typography className={aboutBody}>
							{t('landing.eventsLoadError')}
						</Typography>
						<Button type='button' onClick={() => refetchEvents()}>
							{t('common.retry')}
						</Button>
					</div>
				) : (
					<>
						<div className={statStrip}>
							<div className={statPill}>
								<Typography className={statNumber}>
									{isLoadingEvents ? (
										<CircularProgress size={20} aria-label={t('common.loading')} />
									) : (
										// Unreachable now that both other states are
										// handled above, kept so a future fourth state
										// cannot silently render as a number.
										(totalEvents ?? '—')
									)}
								</Typography>
								<Typography className={statLabel}>{t('landing.eventsLabel')}</Typography>
							</div>
						</div>

						<Typography className={sectionTitle}>{t('admin.nextEvent')}</Typography>
						{isLoadingEvents ? (
							<div className={card}>
								<Typography className={aboutBody}>{t('common.loading')}</Typography>
							</div>
						) : !nextEvent ? (
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
					</>
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
