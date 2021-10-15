import { MaterialIcons } from '@expo/vector-icons';
import { HeaderTitle } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Text } from '../Themed';

// import { Container } from './styles';
interface IconButtonProps {
  name: React.ComponentProps<typeof MaterialIcons>['name']
  label?: string
  size: number
  color: string | undefined
  onPress: () => any
}
const IconButton: React.FC<IconButtonProps> = ({
  name,
  size,
  color,
  label,
  onPress
}) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={{ padding: 10, flexDirection: 'row' }}>
        {label && <HeaderTitle style={{ color }} >{label}</HeaderTitle>}
        <MaterialIcons name={name} size={size} color={color} />
      </View>
    </TouchableWithoutFeedback>
  )
}

export default IconButton;