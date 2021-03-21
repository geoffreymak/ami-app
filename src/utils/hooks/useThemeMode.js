import {useMemo} from 'react';
import {getTheme} from '../themes';
import {useSelector} from 'react-redux';

const DEFAULT_THEME = 'light';

export default function useThemeMode() {
  const {themeName, primaryColor} = useSelector((state) => state.settings);
  return useMemo(
    () =>
      !!themeName
        ? getTheme(themeName, primaryColor)
        : getTheme(DEFAULT_THEME, primaryColor),
    [themeName, primaryColor],
  );
}
