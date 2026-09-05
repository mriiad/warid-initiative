import { Button, CircularProgress, Typography } from '@mui/material';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../auth/AuthContext';
import { useEvent, useCheckParticipation, useEventParticipantsDetails, useCreateParticipant } from '../../hooks';
import { eventsService } from '../../services';
import colors from '../../styles/colors';
import CanDonate from '../CanDonate';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import SnackbarComponent from '../shared/SnackbarComponent';
import AdminEventDetailView from './AdminEventDetailView';
import DonorEventDetailView from './DonorEventDetailView';
import EventConfirmation from './EventConfirmation';


const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	min-height: 60vh;
	color: ${colors.purple};
	width: 100%;
	padding: 0 20px;

	& > .loadingText {
		margin-top: 20px;
		font-size: 1.2rem;
		font-weight: 500;
		text-align: center;
	}
`;

const EventDetail: React.FC = () => {
	const { t } = useTranslation();
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const initialRoute: boolean = location.pathname === `/events/${reference}`;

	const {
		data: eventData,
		isLoading,
		isError,
		error: eventError,
	} = useEvent(reference || '');
	const event = eventData?.data?.event;
	// A 404 means the reference itself is wrong or the event is gone -- the
	// case behind printed QR codes and shared links pointing at a deleted
	// event -- and deserves different wording from a transient failure.
	const eventNotFound =
		(eventError as { response?: { status?: number } } | null)?.response
			?.status === 404;

	const { data: participationData } = useCheckParticipation(reference || '');
	const createParticipant = useCreateParticipant();
	const { data: participantStats } = useEventParticipantsDetails(reference || '', isAdmin);

	const hasParticipated = participationData?.data?.hasParticipated;

	// Confirmation dialog state
	const [confirmationDialog, setConfirmationDialog] = useState({
		open: false,
		title: '',
		message: '',
		confirmText: '',
		cancelText: '',
		onConfirm: () => { },
		warning: false,
	});

	const [message, setMessage] = useState<string | null>(null);

	const handleParticipateClick = async () => {
		if (!token) {
			navigate(`/login?redirect=/events/${reference}`);
			return;
		}

		createParticipant.mutate(reference, {
			onSuccess: (response: any) => {
				// Registering used to open SaveQrModal for a donor instead of
				// showing anything here -- a QR the donor never asked to save,
				// with no success message at all underneath it. See issue #322.
				setMessage(
					response.data.message || t('events.detail.participateSuccess')
				);
			},
			onError: (error: any) => {
				if (error.response && error.response.data?.message) {
					setMessage(error.response.data.message);
				} else {
					setMessage(t('events.detail.participateError'));
				}
				console.error('Participant registration failed:', error);
			},
		});
	};


	const handleDelete = () => {
		setConfirmationDialog({
			open: true,
			// Deleting an event is the only irreversible action on this screen
			// and was the last one still asking in English, under an otherwise
			// fully Arabic RTL page. Mirrors how UserDetailView's delete
			// dialog already reads its strings. See issue #420.
			title: t('events.detail.deleteTitle'),
			message: t('events.detail.deleteConfirm', { title: event?.title }),
			confirmText: t('common.delete'),
			cancelText: t('common.cancel'),
			onConfirm: async () => {
				try {
					setConfirmationDialog({ ...confirmationDialog, open: false });

					await eventsService.delete(reference ?? '');

					setMessage(t('events.detail.deleteSuccess'));
					setTimeout(() => {
						navigate('/events');
					}, 2000);
				} catch (error: any) {
					console.error('Error deleting event:', error);
					setMessage(
						t('events.detail.deleteError', {
							message: error.response?.data?.message || error.message,
						})
					);
				}
			},
			warning: true,
		});
	};

	const handleCloseSnackbar = () => {
		setMessage(null);
	};

	const handleCloseConfirmationDialog = () => {
		setConfirmationDialog({ ...confirmationDialog, open: false });
	};
	return (
		<>
			{isError ? (
				// `isLoading || !event` alone can't tell a slow fetch from a
				// failed one: on a 404 the query settles, `event` stays
				// undefined, and the spinner below used to hold forever with no
				// explanation and no way out. See issue #418.
				<LoadingContainer>
					<Typography className='loadingText'>
						{t(
							eventNotFound
								? 'events.detail.notFoundTitle'
								: 'events.detail.loadErrorTitle'
						)}
					</Typography>
					<Typography className='loadingText'>
						{t(
							eventNotFound
								? 'events.detail.notFoundBody'
								: 'events.detail.loadErrorBody'
						)}
					</Typography>
					<Button type='button' onClick={() => navigate('/events')}>
						{t('events.detail.backToEvents')}
					</Button>
				</LoadingContainer>
			) : isLoading || !event ? (
				<LoadingContainer>
					<CircularProgress size={60} />
					<Typography className='loadingText'>
						{t('events.detail.loading')}
					</Typography>
				</LoadingContainer>
			) : isAdmin && initialRoute ? (
				<AdminEventDetailView event={event} participantStats={participantStats} onDelete={handleDelete} />
			) : !isAdmin && initialRoute ? (
				<DonorEventDetailView
					event={event}
					hasParticipated={hasParticipated}
					isParticipating={createParticipant.isPending}
					onParticipate={handleParticipateClick}
				/>
			) : (
				// Only ever reached when `!initialRoute` (the two branches above
				// already cover isAdmin/!isAdmin at the exact reference URL), i.e.
				// the donor-only can-donate/confirmation sub-flow. Those two
				// screens are fully self-contained (own top bar, no bottom nav --
				// see flowRedesignStyles), so nothing else needs to render around
				// them here.
				<Routes>
					<Route path='can-donate' element={<CanDonate />} />
					<Route path='confirmation' element={<EventConfirmation />} />
				</Routes>
			)}
			{message && (
				<SnackbarComponent
					open={!!message}
					message={message}
					handleClose={handleCloseSnackbar}
				/>
			)}
			<ConfirmationDialog
				open={confirmationDialog.open}
				title={confirmationDialog.title}
				message={confirmationDialog.message}
				confirmText={confirmationDialog.confirmText}
				cancelText={confirmationDialog.cancelText}
				onConfirm={confirmationDialog.onConfirm}
				onCancel={handleCloseConfirmationDialog}
				warning={confirmationDialog.warning}
			/>
		</>
	);
};

export default EventDetail;
