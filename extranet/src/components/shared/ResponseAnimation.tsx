import { Typography } from '@mui/material';
import React from 'react';
import { animationStyles } from '../../styles/mainStyles';

interface ResponseAnimationProps {
	isSuccess: boolean;
	isError: boolean;
	errorMessage?: string | null;
}

const ResponseAnimation: React.FC<ResponseAnimationProps> = ({
	isSuccess,
	isError,
	errorMessage,
}) => {
	const {
		successAnimation,
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
