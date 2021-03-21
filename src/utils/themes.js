import {
  Colors,
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme,
  configureFonts,
} from 'react-native-paper';

import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';

const fonts = configureFonts({
  default: {
    regular: {
      fontFamily: 'Quicksand-Regular',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Quicksand-Regular',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Quicksand-Regular',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Quicksand-Regular',
      fontWeight: '100',
    },
  },
});

export const primaryColors = [
  {
    name: 'blue',
    color: Colors.lightBlue900,
  },
  {
    name: 'cyan',
    color: Colors.cyan900,
  },
  {
    name: 'red',
    color: Colors.red900,
  },
  {
    name: 'pink',
    color: Colors.pink900,
  },
  {
    name: 'green',
    color: Colors.lightGreen900,
  },
  {
    name: 'teal',
    color: Colors.teal900,
  },
];

export const getTheme = (themeName, primaryColor) => {
  const CustomDefaultTheme = {
    ...NavigationDefaultTheme,
    ...PaperDefaultTheme,
    colors: {
      ...NavigationDefaultTheme.colors,
      ...PaperDefaultTheme.colors,
      primary: !!primaryColor ? primaryColor : Colors.lightBlue900,
      background: '#ffffff',
      background2: Colors.grey100,
      row1: Colors.grey200,
      row2: Colors.white,
      text: '#333333',
    },
    fonts,
  };

  const CustomDarkTheme = {
    ...NavigationDarkTheme,
    ...PaperDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      ...PaperDarkTheme.colors,
      primary: Colors.blueGrey900,
      background: '#333333',
      background2: Colors.grey800,
      row1: Colors.grey400,
      row2: Colors.grey600,
      text: '#ffffff',
    },
    fonts,
  };

  const themes = {
    light: CustomDefaultTheme,
    dark: CustomDarkTheme,
  };

  return themes[themeName];
};
