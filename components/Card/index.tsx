import React, { memo } from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { View } from '../Themed';

import { 
  Container,
  InfoContainer,
  InfoTitle,
  InfoAbout,
  InfoPrice,
  ImageContainer,
  ContainerLine
} from './styles';

interface CardProps {
  onPress?: any
  name?: string
  about?: string
  price?: number
  uri?: string
}
const Card: React.FC<CardProps> = ({
  onPress,
  name,
  about,
  price,
  uri
}) => {
  
  return (
      <TouchableWithoutFeedback  
        onPress={onPress} 
      >
      <Container >
        <InfoContainer>
          <InfoTitle>{name}</InfoTitle>
          <InfoAbout numberOfLines={2} >{about}</InfoAbout>
          <InfoPrice>{`R$ ${Number(price).toFixed(2)}`}</InfoPrice>
        </InfoContainer>
        <View darkColor={'rgba(255,255,255,.2)'} lightColor={'rgba(0,0,0,.2)'}>
          <ImageContainer 
            style={{ flexDirection: 'row' }}
            source={{ uri }}
          >
          </ImageContainer>
        </View>
      </Container>
        <ContainerLine/>
      </TouchableWithoutFeedback>
  )
}

export default memo(Card)