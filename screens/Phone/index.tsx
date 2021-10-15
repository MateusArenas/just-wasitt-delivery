import React from 'react';
import { View, Text } from '../../components/Themed';
import Colors from '../../constants/Colors';

// import { Container } from './styles';
const textProps = {
  lightColor: Colors.light.text,
  darkColor:  Colors.dark.text
}
const Phone: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text {...textProps}>Phone</Text>
    </View>
  )
}

export default Phone