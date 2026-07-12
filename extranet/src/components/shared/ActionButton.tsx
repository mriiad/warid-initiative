import Button from '@mui/material/Button';
import { FC, MouseEvent, ReactNode } from 'react';
import { mainStyles } from '../../styles/mainStyles';

interface ActionButtonProps {
	icon?: ReactNode;
	onClick: (event: MouseEvent<HTMLDivElement>) => void;
	title: string;
}

const ActionButton: FC<ActionButtonProps> = ({ icon, onClick, title }) => {
	const { mainButton } = mainStyles();

	return (
		<div onClick={onClick} className={mainButton}>
			<Button startIcon={icon} variant='contained'>
				{title}
			</Button>
		</div>
	);
};

export default ActionButton;
