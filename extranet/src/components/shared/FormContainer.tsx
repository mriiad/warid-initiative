import { Box } from '@mui/material';
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
		<div className={clsx(container, className)}>
			<div className={formContainer}>
				<Box className={formWrapper}>{children}</Box>
			</div>
		</div>
	);
};

export default FormContainer;
