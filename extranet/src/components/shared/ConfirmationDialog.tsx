import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import colors from '../../styles/colors';
import { authStyles } from '../../styles/mainStyles';

const useStyles = makeStyles({
	paper: {
		background: colors.formWhite,
		borderRadius: '30px',
		border: '1px solid white',
		padding: '20px',
	},
	dialogTitle: {
		textAlign: 'center',
		padding: '16px 24px 8px 24px',
		color: colors.purple,
		fontWeight: 'bold',
		fontSize: '1.5rem',
	},
	dialogContent: {
		textAlign: 'center',
		padding: '16px 24px',
	},
	warningText: {
		color: colors.error,
		fontWeight: 600,
		fontSize: '1.1rem',
		lineHeight: 1.4,
	},
	normalText: {
		color: colors.purple,
		fontWeight: 500,
		fontSize: '1.1rem',
		lineHeight: 1.4,
	},
	dialogActions: {
		justifyContent: 'center',
		padding: '16px 24px 24px 24px',
		gap: '16px',
		flexWrap: 'wrap',
	},
});

interface ConfirmationDialogProps {
	open: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	warning?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
	open,
	title,
	message,
	confirmText,
	cancelText,
	onConfirm,
	onCancel,
	warning = false,
}) => {
	const classes = useStyles();
	const { button } = authStyles();
	const { t } = useTranslation();
	// Defaulted through i18n rather than to the literals 'Confirm'/'Cancel':
	// this is a shared dialog in an Arabic-first UI, so a caller that forgets
	// to pass its own labels should still ask in the user's language. See
	// issue #420.
	const confirmLabel = confirmText || t('common.confirm');
	const cancelLabel = cancelText || t('common.cancel');

	return (
		<Dialog
			open={open}
			onClose={onCancel}
			aria-labelledby='confirmation-dialog-title'
			aria-describedby='confirmation-dialog-description'
			maxWidth='sm'
			fullWidth
			PaperProps={{
				className: classes.paper,
			}}
		>
			<DialogTitle
				id='confirmation-dialog-title'
				className={classes.dialogTitle}
			>
				{title}
			</DialogTitle>
			<DialogContent className={classes.dialogContent}>
				<DialogContentText
					id='confirmation-dialog-description'
					className={warning ? classes.warningText : classes.normalText}
				>
					{message}
				</DialogContentText>
			</DialogContent>
			<DialogActions className={classes.dialogActions}>
				<Button
					onClick={onCancel}
					variant='outlined'
					sx={{
						borderColor: colors.purple,
						color: colors.purple,
						borderRadius: '20px',
						padding: '10px 24px',
						fontWeight: 'bold',
						'&:hover': {
							backgroundColor: colors.purple,
							color: 'white',
							borderColor: colors.purple,
						},
					}}
				>
					{cancelLabel}
				</Button>
				<Button
					onClick={onConfirm}
					variant='contained'
					color={warning ? 'error' : 'primary'}
					className={button}
					autoFocus
				>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmationDialog;
