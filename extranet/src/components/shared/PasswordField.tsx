import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authRedesignStyles } from '../../styles/authRedesign';

type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
	showLabel?: string;
	hideLabel?: string;
};

const PasswordField = ({ showLabel, hideLabel, ...textFieldProps }: PasswordFieldProps) => {
	const { t } = useTranslation();
	const [visible, setVisible] = useState(false);
	const { passwordInput } = authRedesignStyles();

	return (
		<TextField
			{...textFieldProps}
			className={clsx(textFieldProps.className, passwordInput)}
			type={visible ? 'text' : 'password'}
			InputProps={{
				...textFieldProps.InputProps,
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							aria-label={
								visible
									? hideLabel || t('auth.login.hidePassword')
									: showLabel || t('auth.login.showPassword')
							}
							onClick={() => setVisible((prev) => !prev)}
							edge='end'
						>
							{visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	);
};

export default PasswordField;
