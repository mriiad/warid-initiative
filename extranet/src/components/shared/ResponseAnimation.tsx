import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import colors from '../../styles/colors';

const animationStyles = makeStyles({
	successAnimation: { margin: '80px auto' },
	checkmark: {
		width: 100,
		height: 100,
		borderRadius: '50%',
		display: 'block',
		strokeWidth: 2,
		stroke: colors.success,
		strokeMiterlimit: 10,
		boxShadow: `inset 0px 0px 0px ${colors.success}`,
		animation:
			'$fill .4s ease-in-out .4s forwards, $scale .3s ease-in-out .9s both',
		position: 'relative',
		top: 5,
		right: 5,
		margin: '0 auto',
	},
	checkmarkCircle: {
		strokeDasharray: 166,
		strokeDashoffset: 166,
		strokeWidth: 2,
		strokeMiterlimit: 10,
		stroke: colors.success,
		fill: '#fff',
		animation: '$stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
	},
	checkmarkCheck: {
		transformOrigin: '50% 50%',
		strokeDasharray: 48,
		strokeDashoffset: 48,
		animation: '$stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
	},
	errorAnimation: { margin: '80px auto' },
	successMessage: { color: colors.purple, textAlign: 'center' },
	errorCheckmark: {
		width: 100,
		height: 100,
		borderRadius: '50%',
		display: 'block',
		strokeWidth: 2,
		stroke: colors.error,
		strokeMiterlimit: 10,
		boxShadow: `inset 0px 0px 0px ${colors.error}`,
		animation:
			'$fillError .4s ease-in-out .4s forwards, $scale .3s ease-in-out .9s both',
		position: 'relative',
		top: 5,
		right: 5,
		margin: '0 auto',
	},
	errorCheckmarkCircle: {
		strokeDasharray: 166,
		strokeDashoffset: 166,
		strokeWidth: 2,
		strokeMiterlimit: 10,
		stroke: colors.error,
		fill: '#fff',
		animation: '$stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards',
	},
	errorCheckmarkCheck: {
		transformOrigin: '50% 50%',
		strokeDasharray: 48,
		strokeDashoffset: 48,
		animation: '$stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards',
	},
	'@keyframes fillError': {
		'100%': {
			boxShadow: `inset 0px 0px 0px 30px ${colors.error}`,
		},
	},
	'@keyframes stroke': {
		'100%': {
			strokeDashoffset: 0,
		},
	},
	'@keyframes scale': {
		'0%, 100%': {
			transform: 'none',
		},
		'50%': {
			transform: 'scale3d(1.1, 1.1, 1)',
		},
	},
	'@keyframes fill': {
		'100%': {
			boxShadow: `inset 0px 0px 0px 30px ${colors.success}`,
		},
	},
});

interface ResponseAnimationProps {
	responseMessage: string;
	actionMessage: string;
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string | null;
}

const ResponseAnimation: React.FC<ResponseAnimationProps> = ({
	responseMessage,
	actionMessage,
	isSuccess,
	isError,
	errorMessage,
}) => {
	const {
		successAnimation,
		successMessage,
		checkmark,
		checkmarkCheck,
		checkmarkCircle,
		errorAnimation,
		errorCheckmark,
		errorCheckmarkCheck,
		errorCheckmarkCircle,
	} = animationStyles();

	return (
		<div>
			{isSuccess && (
				<>
					<div className={successAnimation}>
						<svg
							className={checkmark}
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 52 52'
						>
							<circle
								className={checkmarkCircle}
								cx='26'
								cy='26'
								r='25'
								fill='none'
							/>
							<path
								className={checkmarkCheck}
								fill='none'
								d='M14.1 27.2l7.1 7.2 16.7-16.8'
							/>
						</svg>
					</div>
					<div className={successMessage}>
						<Typography>{responseMessage}</Typography>
						<Typography>{actionMessage}</Typography>
					</div>
				</>
			)}
			{isError && (
				<>
					<div className={errorAnimation}>
						<svg
							className={errorCheckmark}
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 52 52'
						>
							<circle
								className={errorCheckmarkCircle}
								cx='26'
								cy='26'
								r='25'
								fill='none'
							/>
							<path
								className={errorCheckmarkCheck}
								fill='none'
								d='M16 16 L36 36 M36 16 L16 36'
							/>
						</svg>
					</div>
					{errorMessage && (
						<Typography color='error'>{errorMessage}</Typography>
					)}
				</>
			)}
		</div>
	);
};

export default ResponseAnimation;
