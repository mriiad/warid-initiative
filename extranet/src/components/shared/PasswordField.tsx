import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import clsx from 'clsx';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authRedesignStyles } from '../../styles/authRedesign';

type PasswordFieldProps = Omit<TextFieldProps, 'type'> & {
	showLabel?: string;
	hideLabel?: string;
};

/**
 * Every call site renders this inside react-hook-form's <Controller> and
 * spreads `field` onto it -- and `field` carries a ref. As a plain function
 * component this couldn't receive one, so React warned and dropped it,
 * leaving RHF with no node to focus: `shouldFocusError` (on by default)
 * silently focused nothing when the password was the first invalid field.
 * forwardRef + inputRef puts the ref on the actual <input>. See #387.
 */
const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
	{ showLabel, hideLabel, inputRef, ...textFieldProps },
	ref
) {
	const { t } = useTranslation();
	const [visible, setVisible] = useState(false);
	const { passwordInput } = authRedesignStyles();

	return (
		<TextField
			{...textFieldProps}
			// The forwarded ref wins when there is one, but a caller passing
			// inputRef directly still gets it rather than having it dropped.
			inputRef={ref ?? inputRef}
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
});

export default PasswordField;
