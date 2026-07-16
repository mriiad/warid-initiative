import { useId } from 'react';
import PhoneInput from 'react-phone-number-input';
import { makeStyles } from '@mui/styles';
import { redesignColors } from '../../styles/authRedesign';
import 'react-phone-number-input/style.css';

const useStyles = makeStyles({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		gap: '6px',
		width: '100%',
	},
	label: {
		fontSize: '13px',
		fontWeight: 600,
		color: redesignColors.inputText,
	},
	phoneInput: {
		'& .PhoneInputCountry': {
			marginRight: '10px',
		},
		'& .PhoneInputInput': {
			border: `1px solid ${redesignColors.inputBorder}`,
			borderRadius: '12px',
			padding: '14.5px 16px',
			fontSize: '15px',
			color: redesignColors.inputText,
			outline: 'none',
			width: '100%',
			fontFamily: 'inherit',
		},
		'& .PhoneInputInput:focus': {
			borderColor: redesignColors.primaryButton,
		},
	},
	phoneInputError: {
		'& .PhoneInputInput': {
			borderColor: '#B3261E',
		},
	},
	helperText: {
		fontSize: '12px',
		color: '#B3261E',
		marginTop: '-2px',
	},
});

interface PhoneNumberFieldProps {
	value?: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	label: string;
	error?: boolean;
	helperText?: string;
	defaultCountry?: string;
}

// Real country selector + E.164-formatted value (e.g. "+212612345678"),
// replacing the old hardcoded-Morocco flag chip. The underlying `PhoneInput`
// renders its own plain <input>, not a MUI TextField, so this wraps it with
// a plain <label htmlFor> instead of MUI's floating-label machinery -- that
// keeps `getByLabel(label)` working the same way it did for the TextField
// this replaces, since the label/input are associated the standard HTML way.
const PhoneNumberField = ({
	value,
	onChange,
	onBlur,
	label,
	error,
	helperText,
	defaultCountry = 'MA',
}: PhoneNumberFieldProps) => {
	const classes = useStyles();
	const inputId = useId();

	return (
		<div className={classes.wrapper}>
			<label htmlFor={inputId} className={classes.label}>
				{label}
			</label>
			<PhoneInput
				defaultCountry={defaultCountry as never}
				value={value}
				onChange={(newValue) => onChange(newValue || '')}
				onBlur={onBlur}
				className={`${classes.phoneInput} ${error ? classes.phoneInputError : ''}`}
				numberInputProps={{ id: inputId, 'aria-invalid': Boolean(error) }}
			/>
			{helperText && <span className={classes.helperText}>{helperText}</span>}
		</div>
	);
};

export default PhoneNumberField;
