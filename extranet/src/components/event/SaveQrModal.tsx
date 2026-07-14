import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../../hooks';
import { qrModalRedesignStyles } from '../../styles/qrModalRedesign';

interface SaveQrModalProps {
	open: boolean;
	reference: string;
	onClose: () => void;
}

// There's no per-user "daily log"/attendance QR concept anywhere in the
// backend (only a per-event QR the app already shows elsewhere, encoding a
// donate link). This QR instead encodes a link to the app's own, real
// presence-confirmation route (POST /api/event/confirmPresence via
// EventConfirmation.tsx) so scanning/opening it does something real,
// rather than fabricating an attendance system that doesn't exist.
const SaveQrModal = ({ open, reference, onClose }: SaveQrModalProps) => {
	const { t } = useTranslation();
	const { data: profileResponse } = useUserProfile();
	const { scrim, card, avatar, title, subtitle, qrWrapper, qrImage, successWrapper, successIcon, actionsRow, saveButton } =
		qrModalRedesignStyles();

	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);

	const firstName: string | undefined = profileResponse?.data?.firstname;

	useEffect(() => {
		if (!open || !reference) return;
		setSaved(false);
		setQrDataUrl(null);
		const confirmationUrl = `${window.location.origin}/events/${reference}/confirmation`;
		QRCode.toDataURL(confirmationUrl, { width: 440, margin: 1 })
			.then(setQrDataUrl)
			.catch(() => setQrDataUrl(null));
	}, [open, reference]);

	if (!open) return null;

	const handleSave = () => {
		if (!qrDataUrl) return;
		const link = document.createElement('a');
		link.href = qrDataUrl;
		link.download = `warid-event-${reference}-qr.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setSaved(true);
		setTimeout(onClose, 1500);
	};

	return (
		<div className={scrim} onClick={onClose}>
			<div className={card} onClick={(e) => e.stopPropagation()}>
				<div className={avatar}>{(firstName || '?').charAt(0).toUpperCase()}</div>
				<Typography className={title}>{t('events.qrModal.title')}</Typography>
				<Typography className={subtitle}>{t('events.qrModal.subtitle')}</Typography>

				{saved ? (
					<div className={successWrapper}>
						<CheckCircleIcon className={successIcon} />
					</div>
				) : (
					<div className={qrWrapper}>
						{qrDataUrl && <img src={qrDataUrl} alt='QR code' className={qrImage} />}
					</div>
				)}

				{!saved && (
					<div className={actionsRow}>
						<Button
							type='button'
							className={saveButton}
							onClick={handleSave}
							disabled={!qrDataUrl}
						>
							<DownloadIcon fontSize='small' />
							{t('events.qrModal.save')}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default SaveQrModal;
