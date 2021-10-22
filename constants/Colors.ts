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
      text: '#515151',
      background: '#fafafa',
      card: '#fff',
      border: 'rgba(0,0,0,.05)',
    }
  },
  dark: {
    dark: true,
    colors : {
      primary,
      notification,
      text: '#fff',
      background: '#000',
      // card: '#0d0d0d',
      card: '#111111',
      border: 'rgba(255,255,255,.2)',
    }
  },
} as themeProps
