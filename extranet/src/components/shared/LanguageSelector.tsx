import LanguageIcon from '@mui/icons-material/Language';
import {
	Box,
	FormControl,
	MenuItem,
	Select,
	SelectChangeEvent,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FlagIcon from './FlagIcon';

const LanguageSelector: React.FC = () => {
	const { i18n, t } = useTranslation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));

	const handleLanguageChange = (event: SelectChangeEvent<string>) => {
		const selectedLanguage = event.target.value;
		i18n.changeLanguage(selectedLanguage);

		// Update document direction for RTL languages
		document.documentElement.dir = selectedLanguage === 'ar' ? 'rtl' : 'ltr';
		document.documentElement.lang = selectedLanguage;

		// Force re-render of mobile header to maintain layout
		if (isMobile) {
			window.dispatchEvent(new Event('languageChange'));
		}
	};

	const languages = [
		{ code: 'fr', name: 'Français', country: 'france' },
		{ code: 'en', name: 'English', country: 'uk' },
		{ code: 'ar', name: 'العربية', country: 'morocco' },
	];

	if (isMobile) {
		return (
			<FormControl
				size='small'
				className='navbar-language-stable'
				sx={{ minWidth: 80 }}
			>
				<Select
					value={i18n.language}
					onChange={handleLanguageChange}
					displayEmpty
					sx={{
						color: '#3B2A82',
						fontSize: '0.8rem',
						'& .MuiSelect-icon': {
							color: '#3B2A82',
							fontSize: '1rem',
						},
						'& .MuiOutlinedInput-notchedOutline': {
							borderColor: 'rgba(255, 255, 255, 0.3)',
						},
						'&:hover .MuiOutlinedInput-notchedOutline': {
							borderColor: '#3B2A82',
						},
						'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
							borderColor: '#3B2A82',
						},
						backgroundColor: 'rgba(255, 255, 255, 0.1)',
						backdropFilter: 'blur(10px)',
					}}
					startAdornment={
						<LanguageIcon
							sx={{ mr: 0.5, color: '#3B2A82', fontSize: '1rem' }}
						/>
					}
				>
					{languages.map((language) => (
						<MenuItem
							key={language.code}
							value={language.code}
							sx={{ fontSize: '0.8rem' }}
						>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<FlagIcon
									country={language.country as 'morocco' | 'france' | 'uk'}
									size={16}
									className='flag-emoji'
								/>
								<Typography variant='body2' sx={{ fontSize: '0.8rem' }}>
									{language.code.toUpperCase()}
								</Typography>
							</Box>
						</MenuItem>
					))}
				</Select>
			</FormControl>
		);
	}

	return (
		<FormControl
			size='small'
			className='desktop-language-selector'
			sx={{ minWidth: 120 }}
		>
			<Select
				value={i18n.language}
				onChange={handleLanguageChange}
				displayEmpty
				sx={{
					color: '#3B2A82',
					'& .MuiSelect-icon': {
						color: '#3B2A82',
					},
					'& .MuiOutlinedInput-notchedOutline': {
						borderColor: 'rgba(255, 255, 255, 0.3)',
					},
					'&:hover .MuiOutlinedInput-notchedOutline': {
						borderColor: '#3B2A82',
					},
					'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
						borderColor: '#3B2A82',
					},
					backgroundColor: 'rgba(255, 255, 255, 0.1)',
					backdropFilter: 'blur(10px)',
				}}
				startAdornment={
					<LanguageIcon sx={{ mr: 1, color: '#3B2A82', fontSize: '1.2rem' }} />
				}
			>
				{languages.map((language) => (
					<MenuItem key={language.code} value={language.code}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
							<FlagIcon
								country={language.country as 'morocco' | 'france' | 'uk'}
								size={20}
								className='flag-emoji'
							/>
							<Typography variant='body2'>{language.name}</Typography>
						</Box>
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default LanguageSelector;
