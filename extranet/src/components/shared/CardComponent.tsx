import { makeStyles } from '@mui/styles';
import React from 'react';

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
		maxHeight: '350px',
		overflowY: 'auto',
	},
});

interface CardProps {
	children?: React.ReactNode;
}

const CardComponent: React.FC<CardProps> = ({ children }) => {
	const { card } = useStyles();

	return <div className={card}>{children}</div>;
};

export default CardComponent;
