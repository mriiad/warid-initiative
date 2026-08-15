import { CircularProgress, Typography } from '@mui/material';

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
import SaveQrModal from './SaveQrModal';


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

	const { data: eventData, isLoading } = useEvent(reference || '');
	const event = eventData?.data?.event;

	const { data: participationData } = useCheckParticipation(reference || '');
	const createParticipant = useCreateParticipant();
	const { data: participantStats } = useEventParticipantsDetails(reference || '', isAdmin);

	const hasParticipated = participationData?.data?.hasParticipated;

	// Confirmation dialog state
	const [confirmationDialog, setConfirmationDialog] = useState({
		open: false,
		title: '',
		message: '',
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		onConfirm: () => { },
		warning: false,
	});

	const [message, setMessage] = useState<string | null>(null);
	const [showQrModal, setShowQrModal] = useState(false);

	const handleParticipateClick = async () => {
		if (!token) {
			navigate(`/login?redirect=/events/${reference}`);
			return;
		}

		createParticipant.mutate(reference, {
			onSuccess: (response: any) => {
				if (isAdmin) {
					setMessage(
						response.data.message || t('events.detail.participateSuccess')
					);
				} else {
					setShowQrModal(true);
				}
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
			title: 'Delete Event',
			message: `Are you sure you want to delete the event "${event?.title}"? This action cannot be undone.`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
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
			{isLoading || !event ? (
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
			{!isAdmin && (
				<SaveQrModal
					open={showQrModal}
					reference={reference || ''}
					onClose={() => setShowQrModal(false)}
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
