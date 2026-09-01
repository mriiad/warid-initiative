import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CircularProgress, IconButton, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useConfirmPresence, useEvent } from '../../hooks';
import { flowRedesignStyles } from '../../styles/flowRedesign';
import API_CONFIG from '../../utils/apiConfig';

const EventConfirmation: React.FC = () => {
	const { t } = useTranslation();
	const { reference } = useParams<{ reference: string }>();
	const { token } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [isConfirmed, setIsConfirmed] = useState(false);

	const { flowCenter, flowIconCircle, flowTitle } = flowRedesignStyles();

	const handleNavigate = (ref: string) => () => navigate(`/events/${ref}`);

	const { data: eventData, isLoading: isEventLoading, isError: isEventError } = useEvent(
		reference || ''
	);
	const confirmPresenceMutation = useConfirmPresence();
	// Destructured so useCallback below can depend on the mutate function
	// itself (stable across re-renders in TanStack Query v5) rather than the
	// whole mutation result object, which is a fresh object every render --
	// including every time isPending/isError changes. Depending on the
	// object would re-create the callback on every status transition, which
	// would in turn re-fire the effect below on every one of those
	// transitions instead of once.
	const { mutate: confirmPresence } = confirmPresenceMutation;

	const handleConfirmPresence = useCallback(
		(eventId: string) => {
			// Not `{ eventId, token }`: confirmPresence's own auth goes through
			// the Authorization header (apiClient's request interceptor), same
			// as every other call -- the backend controller never reads a
			// `token` field from the body. Sending it here was inert.
			confirmPresence(
				{ eventId },
				{
					onSuccess: () => {
						setIsConfirmed(true);
						setTimeout(() => navigate('/events'), API_CONFIG.ui.redirectDelay);
					},
					onError: (error) => {
						console.error('Error:', error);
					},
				}
			);
		},
		[confirmPresence, navigate]
	);

	useEffect(() => {
		// GET /api/events/:reference responds with `{ message, event }`, so the
		// event's own fields live at `eventData.data.event` -- reading
		// `eventData.data._id` sent eventId: undefined to the backend.
		if (!eventData?.data?.event) {
			return;
		}
		if (token) {
			handleConfirmPresence(eventData.data.event._id);
			return;
		}
		// `token` (AuthContext) starts null on every mount and only gets
		// populated by AuthContext's own hydration effect a tick later, so it
		// being falsy *right now* doesn't yet mean "logged out" -- reading
		// localStorage directly sidesteps that lag entirely (unlike the
		// context copy, it has no hydration delay) and tells us the real
		// answer. Without this fallback, a genuinely logged-out visitor (a
		// stale link, an expired session, a cold-opened bookmark) saw a
		// permanent blank page: this effect never fires without a token, and
		// every render branch below falls through to `return null`. See
		// issue #374.
		if (!localStorage.getItem('token')) {
			navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
		}
	}, [eventData, token, handleConfirmPresence, navigate, location.pathname]);

	if (isEventLoading || confirmPresenceMutation.isPending) {
		return (
			<div className={flowCenter}>
				<CircularProgress />
				<Typography className={flowTitle}>{t('events.confirmation.confirming')}</Typography>
			</div>
		);
	}

	if (isConfirmed) {
		return (
			<div className={flowCenter}>
				<div className={flowIconCircle} style={{ backgroundColor: '#DCEFC9', color: '#5C8A2B' }}>
					<CheckCircleIcon fontSize='large' />
				</div>
				<Typography className={flowTitle}>{t('events.confirmation.confirmed')}</Typography>
			</div>
		);
	}

	if (isEventError || confirmPresenceMutation.isError) {
		const error = confirmPresenceMutation.error as any;
		const errorMessage =
			error?.response?.data?.message || t('events.confirmation.unexpectedError');
		const details = error?.response?.data?.details;
		const errorReference = details?.reference;

		return (
			<div className={flowCenter}>
				<div className={flowIconCircle} style={{ backgroundColor: '#FBE4EA', color: '#C56D86' }}>
					<ErrorOutlineIcon fontSize='large' />
				</div>
				<Typography className={flowTitle}>{errorMessage}</Typography>
				{errorReference && (
					<IconButton aria-label={t('admin.viewDetails')} onClick={handleNavigate(errorReference)}>
						<OpenInNewIcon />
					</IconButton>
				)}
			</div>
		);
	}

	return null;
};

export default EventConfirmation;
