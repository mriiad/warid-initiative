import { Box } from '@mui/material';
import React from 'react';
import { useLandingPageStyles } from './LandingPageStyles';

interface NumbersContainerProps {
	animatedNumber: string;
}

const NumbersContainer = React.forwardRef<
	HTMLDivElement,
	NumbersContainerProps
>(({ animatedNumber }, ref) => {
	const { numberBackground, numbersContainer } = useLandingPageStyles();
	return (
		<div ref={ref} className={numbersContainer}>
			{animatedNumber.split('').map((num, index) => (
				<Box key={index} className={numberBackground}>
					{num}
				</Box>
			))}
		</div>
	);
});

export default NumbersContainer;
