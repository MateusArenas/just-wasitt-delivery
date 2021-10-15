import styled from 'styled-components/native';

export const Container = styled.View`
  
`;

export const Collunm = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
`;

export const CollumBetween = styled.View`
  /* border-bottom-width: ${ props => props.lasted ? '0px' : '1px' }; */
  padding: 10px 0;
  padding-right: 10px;
  /* border-color: ${props => props.theme.colors?.border}; */
`;

export const AboutLabel = styled.Text`
  padding-left: 10px; 
  font-size: 12px;
  font-weight: bold; 
  color: ${props => props.theme.colors?.text};
`;

