import React, { useState } from 'react';
import { View, Image, Text, TouchableHighlight,TouchableOpacity, ImageBackground } from 'react-native';
import Swiper, { SwiperProps } from 'react-native-web-swiper';
import { useThemeColor } from '../Themed';

import { Container } from './styles';

interface SliderProps {
  swiperProps?: SwiperProps
  data: Array<itemDataProps>
  height: number
  onPressChange?: any
}
const Slider: React.FC<SliderProps> = (props) => {
  const backgroundColor = useThemeColor({ 
    dark: 'rgba(255,255,255,.2)', 
    light: 'rgba(0,0,0,.2)' 
  }, 'card')

  const data = props.data
  return (
    <Container 
      style={{ height: props.height }}
    >
      { props.data === data && <Swiper
        slideWrapperStyle={{ 
          marginRight: 10, 
          borderRadius: 8, 
          overflow: 'hidden', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${(100/data.length)}%`,
          backgroundColor
        }}

        // swipeAreaStyle={{  }}
        springConfig={{ speed: 11 }}
        innerContainerStyle={{ overflow: 'visible', width: '100%', marginLeft: -10 }}
        loop
        from={data.length > 1 ? 1 : 0}
        // timeout={5}
        minDistanceToCapture={1}
        minDistanceForAction={0.1} 
        containerStyle={{ width: '90%' }}
        controlsEnabled={false}    
        {...props.swiperProps}
      >
        { data?.map(item => (
          <Item 
            key={item.id} 
            item={item} 
            onPressChange={props.onPressChange} 
            height={props.height}
          />
        ))}
      </Swiper> }
    </Container>
  )
}

interface itemDataProps {
  id: number
  uri: string 
}

interface ItemProps {
  activeIndex?: number
  index?: number
  item: itemDataProps
  onPressChange?: ((item: itemDataProps) => void) | undefined
  height: number
}
const Item: React.FC<ItemProps> = (props) => {
  return (
    <TouchableOpacity
      style={{
        width: '100%', 
        height: props.height, 
      }}
      onPress={() => props.onPressChange ? props.onPressChange(props.item) : null}
    >
      <ImageBackground 
        defaultSource={{ uri: '' }}
        source={{ uri: props.item?.uri }}
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: 4,
          marginRight: 5,
          overflow: 'hidden',
        }}>
        
      </ImageBackground>
    </TouchableOpacity>
  )
}

export default Slider;