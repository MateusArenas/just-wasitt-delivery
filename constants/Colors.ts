import { DefaultTheme, DarkTheme } from "@react-navigation/native";

const primary = '#2f95dc';
const notification = '#b90924';

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
      background: '#1c1b21',
      // card: '#0d0d0d',
      card: 'rgb(38, 37, 45)',
      border: '#a79fd512',
    }
  },
} as themeProps
