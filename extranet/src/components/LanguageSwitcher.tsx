import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

const useStyles = makeStyles({
  languageSwitcher: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  menuItem: {
    fontWeight: 'bold',
  },
  activeMenuItem: {
    color: '#FF3366', 
  },
});

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const { languageSwitcher, menuItem, activeMenuItem } = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setAnchorEl(null);
  };

  return (
    <div className={languageSwitcher}>
      <IconButton onClick={handleClick}>
        <TranslateIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
      >
        <MenuItem
          className={`${menuItem} ${i18n.language === 'en' ? activeMenuItem : ''}`}
          onClick={() => handleLanguageChange('en')}
        >
          English
        </MenuItem>
        <MenuItem
          className={`${menuItem} ${i18n.language === 'ar' ? activeMenuItem : ''}`}
          onClick={() => handleLanguageChange('ar')}
        >
          Arabic
        </MenuItem>
        <MenuItem
          className={`${menuItem} ${i18n.language === 'fr' ? activeMenuItem : ''}`}
          onClick={() => handleLanguageChange('fr')}
        >
          French
        </MenuItem>
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
