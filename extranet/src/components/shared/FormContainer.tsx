import { Box, Container } from '@mui/material';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { authStyles } from '../../styles/mainStyles';

interface FormContainerProps {
	children: ReactNode;
	className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
	children,
	className,
}) => {
	const { container, formContainer, formWrapper } = authStyles();

	return (
		<Container maxWidth='md' className={clsx(container, className)}>
			<div className={formContainer}>
				<Box className={formWrapper}>{children}</Box>
			</div>
		</Container>
	);
};

export default FormContainer;
