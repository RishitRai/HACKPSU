// src/theme/CustomTheme.js
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { DefaultTheme as PaperDefaultTheme } from 'react-native-paper';

const baseColor = '#000000'; // Black
const accentColor = '#1abc9c'; // Teal

export const CustomTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  dark: true,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
    primary: accentColor,
    background: baseColor,
    surface: '#121212', // dark card background
    text: '#ffffff',
    accent: accentColor,
    placeholder: '#aaaaaa',
    notification: accentColor,
    border: accentColor,
  },
};