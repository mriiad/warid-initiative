import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useEffect, useState } from 'react';
import colors from '../../styles/colors';

const useBloodDropsStyles = makeStyles({
	bloodDropsContainer: {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
		zIndex: 0,
		overflow: 'hidden',
	},
	bloodDrop: {
		position: 'absolute',
		width: '4px',
		height: '12px',
		background: `linear-gradient(180deg, ${colors.rose} 0%, ${colors.purple} 100%)`,
		borderRadius: '2px 2px 50% 50%',
		opacity: 0.7,
		animation: '$fall 8s linear infinite',
		boxShadow: `0 0 6px ${colors.rose}40`,
		'&:before': {
			content: '""',
			position: 'absolute',
			top: '8px',
			left: '0px',
			width: '4px',
			height: '8px',
			background: `linear-gradient(180deg, ${colors.purple} 0%, transparent 100%)`,
			borderRadius: '50%',
			opacity: 0.3,
		},
	},
	bloodDropSmall: {
		width: '2px',
		height: '8px',
		'&:before': {
			width: '2px',
			height: '6px',
			top: '6px',
		},
	},
	bloodDropLarge: {
		width: '6px',
		height: '16px',
		'&:before': {
			width: '6px',
			height: '10px',
			top: '10px',
		},
	},
	'@keyframes fall': {
		'0%': {
			transform: 'translateY(-20px) rotate(0deg)',
			opacity: 0,
		},
		'10%': {
			opacity: 0.7,
		},
		'90%': {
			opacity: 0.7,
		},
		'100%': {
			transform: 'translateY(120vh) rotate(360deg)',
			opacity: 0,
		},
	},
});

interface BloodDrop {
	id: number;
	x: number;
	size: 'small' | 'medium' | 'large';
	delay: number;
	duration: number;
}

const BloodDropsAnimation: React.FC = () => {
	const classes = useBloodDropsStyles();
	const [drops, setDrops] = useState<BloodDrop[]>([]);

	useEffect(() => {
		const generateDrops = () => {
			const newDrops: BloodDrop[] = [];
			const dropCount = 12;

			for (let i = 0; i < dropCount; i++) {
				newDrops.push({
					id: i,
					x: Math.random() * 100,
					size:
						Math.random() > 0.7
							? 'large'
							: Math.random() > 0.4
							? 'medium'
							: 'small',
					delay: Math.random() * 8,
					duration: 6 + Math.random() * 4,
				});
			}
			setDrops(newDrops);
		};

		generateDrops();

		const interval = setInterval(generateDrops, 10000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className={classes.bloodDropsContainer}>
			{drops.map((drop) => (
				<Box
					key={drop.id}
					className={`${classes.bloodDrop} ${
						drop.size === 'small'
							? classes.bloodDropSmall
							: drop.size === 'large'
							? classes.bloodDropLarge
							: ''
					}`}
					style={{
						left: `${drop.x}%`,
						animationDelay: `${drop.delay}s`,
						animationDuration: `${drop.duration}s`,
					}}
				/>
			))}
		</div>
	);
};

export default BloodDropsAnimation;
