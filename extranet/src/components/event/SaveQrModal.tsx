import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { qrModalRedesignStyles } from '../../styles/qrModalRedesign';

interface SaveQrModalProps {
	open: boolean;
	/** A ready-to-display QR code image, e.g. event.qrCode (data URL). */
	qrCodeDataUrl: string;
	/** Filename the download is saved as, including extension. */
	downloadName: string;
	onClose: () => void;
}

// Was generating its own QR encoding a presence-confirmation link, shown to
// a donor right after registering for an event -- a QR they never asked to
// save, with no success message at all underneath it (see issue #322: donor
// registration now shows a success message instead). Repurposed as a
// generic "here's a QR code, save it" modal: the caller supplies the image
// directly (event.qrCode, generated server-side) instead of this component
// generating one itself.
const SaveQrModal = ({ open, qrCodeDataUrl, downloadName, onClose }: SaveQrModalProps) => {
	const { t } = useTranslation();
	const { scrim, card, title, subtitle, qrWrapper, qrImage, successWrapper, successIcon, actionsRow, saveButton } =
		qrModalRedesignStyles();

	const [saved, setSaved] = useState(false);

	if (!open) return null;

	const handleSave = () => {
		const link = document.createElement('a');
		link.href = qrCodeDataUrl;
		link.download = downloadName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setSaved(true);
		setTimeout(onClose, 1500);
	};

	return (
		<div className={scrim} onClick={onClose}>
			<div className={card} onClick={(e) => e.stopPropagation()}>
				<Typography className={title}>{t('events.qrModal.title')}</Typography>
				<Typography className={subtitle}>{t('events.qrModal.subtitle')}</Typography>

				{saved ? (
					<div className={successWrapper}>
						<CheckCircleIcon className={successIcon} />
					</div>
				) : (
					<div className={qrWrapper}>
						<img src={qrCodeDataUrl} alt='QR code' className={qrImage} />
					</div>
				)}

				{!saved && (
					<div className={actionsRow}>
						<Button type='button' className={saveButton} onClick={handleSave}>
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
