import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IconButton, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Emergency } from '../../data/Emergency';
import { emergencyListRedesignStyles } from '../../styles/emergencyListRedesign';

interface EmergencyCardProps {
	emergency: Emergency;
	onConfirm: () => void;
	isConfirming: boolean;
}

const EmergencyCard = ({ emergency, onConfirm, isConfirming }: EmergencyCardProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const {
		card,
		cardIcon,
		cardBloodBadge,
		cardDetails,
		cardCity,
		actionsRow,
		confirmButton,
		matchedUsersButton,
	} = emergencyListRedesignStyles();

	const handleMatchedUsers = () => {
		// The matched-users page has no endpoint of its own to fetch a single
		// emergency's details, so the context it needs for the WhatsApp
		// message (city, details) is forwarded here instead. The contact
		// number shown in that message is a fixed config value (see
		// API_CONFIG.emergency.whatsappContactNumber), not this emergency's
		// own submitted phone number, so it isn't forwarded.
		navigate(`/emergencies/${emergency._id}/matched-users`, {
			state: {
				bloodGroup: emergency.bloodGroup,
				city: emergency.city,
				details: emergency.details,
			},
		});
	};

	return (
		<div className={card}>
			<div className={cardIcon}>🚨</div>
			<Typography className={cardBloodBadge}>{emergency.bloodGroup}</Typography>
			<Typography className={cardDetails}>{emergency.details}</Typography>
			<Typography className={cardCity}>{emergency.city}</Typography>

			<div className={actionsRow}>
				<Button
					type='button'
					className={confirmButton}
					onClick={onConfirm}
					disabled={isConfirming}
				>
					{isConfirming ? t('emergency.card.confirming') : t('emergency.card.confirm')}
				</Button>
				<IconButton
					className={matchedUsersButton}
					aria-label={t('emergency.card.matchedUsers')}
					onClick={handleMatchedUsers}
				>
					<ArrowForwardIcon />
				</IconButton>
			</div>
		</div>
	);
};

export default EmergencyCard;
