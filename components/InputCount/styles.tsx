import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1; 
  /* height: 20px; */
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: space-between;
`;

export const Number = styled.Text`
  /* flex-grow: 1;  */
  /* flex: 1;  */
  /* padding: ${props => props.theme.layout?.basePadding}px;  */
  /* width: 100%; */
  color: ${props => props.theme.colors?.primary}; 
  text-align: center;
`;

