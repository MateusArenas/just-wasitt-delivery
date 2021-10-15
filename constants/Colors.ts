import { DefaultTheme, DarkTheme } from "@react-navigation/native";

const primary = '#2f95dc';
const notification = 'red';

interface themeProps {
  light: typeof DefaultTheme
  dark: typeof DarkTheme
}

export default {
  light: {
    dark: false,
    colors: {
      primary,
      notification,
      text: '#000',
      background: '#fff',
      card: '#fafafa',
      border: 'rgba(0,0,0,.1)',
    }
  },
  dark: {
    dark: true,
    colors : {
      primary,
      notification,
      text: '#fff',
      background: '#000',
      card: '#4f535e',
      border: 'rgba(255,255,255,.1)',
    }
  },
} as themeProps
