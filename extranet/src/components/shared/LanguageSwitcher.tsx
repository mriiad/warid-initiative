import TranslateIcon from '@mui/icons-material/Translate';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import colors from '../../styles/colors';

const LANGUAGES: { code: 'ar' | 'en' | 'fr'; label: string }[] = [
	{ code: 'ar', label: 'العربية' },
	{ code: 'en', label: 'English' },
	{ code: 'fr', label: 'Français' },
];

const useStyles = makeStyles({
	menuItem: {
		fontWeight: 500,
		minWidth: '140px',
	},
	activeMenuItem: {
		fontWeight: 700,
		color: colors.rose,
	},
});

const LanguageSwitcher = () => {
	const { i18n } = useTranslation();
	const { menuItem, activeMenuItem } = useStyles();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleLanguageChange = (lang: string) => {
		i18n.changeLanguage(lang);
		setAnchorEl(null);
	};

	const currentLanguage = i18n.resolvedLanguage || i18n.language;

	return (
		<>
			<IconButton onClick={handleOpen} aria-label='change language' size='large'>
				<TranslateIcon />
			</IconButton>
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
				{LANGUAGES.map(({ code, label }) => (
					<MenuItem
						key={code}
						className={`${menuItem} ${currentLanguage === code ? activeMenuItem : ''}`}
						selected={currentLanguage === code}
						onClick={() => handleLanguageChange(code)}
					>
						{label}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default LanguageSwitcher;
