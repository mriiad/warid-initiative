import { Slide, Snackbar, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useSwipeable } from 'react-swipeable';
import CardComponent from './CardComponent';

const useStyles = makeStyles((theme: Theme) => ({
	alert: {
		backgroundColor: 'rgba(255, 255, 255, 0.35)',
	},
}));

interface SnackbarComponentProps {
	message: string;
	open: boolean;
	handleClose: () => void;
	autoHideDuration?: number;
	offsetTop?: number;
}

const SnackbarComponent: React.FC<SnackbarComponentProps> = ({
	message,
	open,
	handleClose,
	autoHideDuration,
	offsetTop = 0,
}) => {
	const { alert } = useStyles();

	// Minimum swipe distance
	const minSwipeDistance = 50;

	const reviewSnackbarHandlers = useSwipeable({
		onSwipedUp: handleClose,
		delta: 10,
		preventScrollOnSwipe: true,
		trackTouch: true,
		trackMouse: true,
	});

	return (
		<Snackbar
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			open={open}
			onClose={handleClose}
			autoHideDuration={autoHideDuration}
			style={{ top: offsetTop }}
		>
			<Slide
				direction='up'
				in={open}
				mountOnEnter
				unmountOnExit
				{...reviewSnackbarHandlers}
			>
				<CardComponent className={alert}>{message}</CardComponent>
			</Slide>
		</Snackbar>
	);
};

export default SnackbarComponent;
