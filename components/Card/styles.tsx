import styled from 'styled-components/native';

export const Container = styled.View`
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: row;
`;

export const InfoContainer = styled.View`
  width: 50%;
`;

export const InfoTitle = styled.Text`
  color: ${props => props.theme?.colors?.primary };
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
`;

export const InfoAbout = styled.Text`
  color: ${props => props.theme?.colors?.text };
  font-size: 14px;
`;

export const InfoPrice = styled.Text`
  color: ${props => props.theme.colors?.text};
  font-size: 14px;
`;

export const ImageContainer = styled.ImageBackground`
  width: 120px;
  height: 80px;
  margin-left: 10px;
  border-radius: 4px;
  overflow: hidden;
`;

export const ContainerLine = styled.View`
  width: 95%;
  height: 1px;
  background-color: ${props => props.theme.colors?.text};
  opacity: .2;
  border-radius: 4px;
`;