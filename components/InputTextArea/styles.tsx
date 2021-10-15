import styled from 'styled-components/native';

export const Container = styled.View`
  width: 100%;
  /* border-color: ${props => props.theme.colors?.border};  */
  /* border-width: 2px;  */
  border-radius: 4px;
  position: relative;
`;

export const CustomTextInput = styled.TextInput`
   padding: 10px;
   color: ${props => props.theme?.colors?.text};
   min-height: 20px;
   max-height: 60px;
`;

export const CharactersInfo = styled.Text`
  color: ${props => props.theme.colors?.text};
  padding-right: 10px;
  font-size: 14px;
  text-align: center;
`;