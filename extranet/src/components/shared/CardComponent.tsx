import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { forwardRef } from 'react';

const useStyles = makeStyles({
	card: {
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		backdropFilter: 'blur(10px)',
		margin: '20px 0',
		padding: 20,
		borderRadius: 10,
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		maxWidth: 500,
		width: '100%',
		maxHeight: '216px',
		overflowY: 'auto',
	},
});

interface CardProps {
	children?: React.ReactNode;
	className?: string;
}

const CardComponent = forwardRef<HTMLDivElement, CardProps>(
	({ children, className }, ref) => {
		const { card } = useStyles();

		return (
			<div className={clsx(card, className)} ref={ref}>
				{children}
			</div>
		);
	}
);

export default CardComponent;
