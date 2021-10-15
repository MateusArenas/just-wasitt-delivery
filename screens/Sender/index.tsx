import React from 'react';
import { View, Text } from '../../components/Themed';
import Colors from '../../constants/Colors';

// import { Container } from './styles';
const textProps = {
  lightColor: Colors.light.colors.text,
  darkColor:  Colors.dark.colors.text
}
const Sender: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text {...textProps}>Sender</Text>
    </View>
  )
}

export default Sender