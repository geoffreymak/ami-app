import {useEffect, useState} from 'react';

import {storeData, getData} from '../storage';

const usePreferences = () => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('');
  const [preferencesIsMounted, setPreferencesIsMounted] = useState(false);

  const setMode = (mode) => {
    storeData('theme', mode);
    setTheme(mode);
  };

  const changePrimaryColor = (color) => {
    storeData('primaryColor', color);
    setPrimaryColor(color);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  useEffect(() => {
    const mounteTheme = async () => {
      const localTheme = await getData('theme');
      const localPrimaryColor = await getData('primaryColor');

      !!localTheme ? setTheme(localTheme) : setMode('light');
      !!localPrimaryColor && setPrimaryColor(localPrimaryColor);

      setPreferencesIsMounted(true);
    };
    mounteTheme();
  }, []);

  return {
    themeName: theme,
    primaryColor,
    toggleTheme,
    changePrimaryColor,
    preferencesIsMounted,
  };
};

export default usePreferences;
