import { Button } from '@mui/material';
import { ReactNode } from 'react';
import { authRedesignStyles } from '../../styles/authRedesign';
import GoogleIcon from './GoogleIcon';

interface GoogleButtonProps {
	children: ReactNode;
	onClick?: () => void;
}

const GoogleButton = ({ children, onClick }: GoogleButtonProps) => {
	const { googleButton } = authRedesignStyles();

	return (
		<Button fullWidth type='button' className={googleButton} onClick={onClick}>
			<GoogleIcon />
			{children}
		</Button>
	);
};

export default GoogleButton;
