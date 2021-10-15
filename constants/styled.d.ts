import {} from 'styled-components/native';
import { Theme } from "@react-navigation/native";
declare module 'styled-components/native' {
  export interface DefaultTheme extends Theme {} // extends the global DefaultTheme with our ThemeType.
}