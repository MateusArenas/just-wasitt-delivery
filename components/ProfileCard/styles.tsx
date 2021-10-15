import styled from 'styled-components/native';
import { DefaultTheme } from '@react-navigation/native'
import Colors from '../../constants/Colors';

export const ProfileImage = styled.View`
  height: 56px;
  width: 56px;
  background-color: ${({ theme }) => theme?.colors?.card};
  border-radius: 100px;
  overflow: hidden;
  margin: 5px;
`;

export const ProfileAbout = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme?.colors?.text};
  font-weight: bold;
  text-align: left;
  flex-shrink: 1;
  margin: 5px;
  flex-grow: 1;
  /* padding-top: 20px; */
`;

export const ProfileState = styled.Text`
  font-weight: bold;
  font-size: 12px;
  color: white;
  text-transform: uppercase;
  padding: 2px 6px;
  background-color: ${({ theme }) => theme?.colors?.text};
  border-radius: 20px;
`;
