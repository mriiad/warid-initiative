import InstagramIcon from '@mui/icons-material/Instagram';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { IconButton, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import { useEvents } from '../../hooks';
import { landingRedesignStyles } from '../../styles/landingRedesign';
import API_CONFIG from '../../utils/apiConfig';
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
		footerLink,
		footerCopyright,
		socialRow,
		socialButton,
	} = landingRedesignStyles();

	const numbersRef = useRef(null);
	const [animatedDonorCount, setAnimatedDonorCount] = useState(0);
	const [startAnimation, setStartAnimation] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setStartAnimation(true);
				}
			},
			{ threshold: 0.5 }
		);

		if (numbersRef.current) {
			observer.observe(numbersRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		if (startAnimation) {
			const targetNumber = 84750;
			const duration = API_CONFIG.ui.snackbarDuration;
			const start = performance.now();

			const animateCount = (now) => {
				const elapsedTime = now - start;
				const progress = Math.min(elapsedTime / duration, 1);
				setAnimatedDonorCount(Math.floor(progress * targetNumber));

				if (progress < 1) {
					requestAnimationFrame(animateCount);
				}
			};

			requestAnimationFrame(animateCount);
		}
	}, [startAnimation]);

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
				<div className={statStrip} ref={numbersRef}>
					<div className={statPill}>
						<Typography className={statNumber}>
							{animatedDonorCount.toLocaleString()}
						</Typography>
						<Typography className={statLabel}>{t('landing.donorsLabel')}</Typography>
					</div>
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
					<a
						className={footerLink}
						href='/files/Warid_Policies.pdf'
						target='_blank'
						rel='noopener noreferrer'
					>
						{t('landing.privacyPolicy')}
					</a>
					<Typography className={footerCopyright}>{t('landing.copyright')}</Typography>
				</div>
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default LandingPage;
