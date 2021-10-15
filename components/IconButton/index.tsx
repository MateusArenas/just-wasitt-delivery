import { MaterialIcons } from '@expo/vector-icons';
import { HeaderTitle } from '@react-navigation/stack';
import React from 'react';
import { TouchableOpacity, StyleProp, View, ViewStyle } from 'react-native';
import { Text } from '../Themed';

// import { Container } from './styles';
interface IconButtonProps {
  name: React.ComponentProps<typeof MaterialIcons>['name']
  label?: string
  size: number
  color: string | undefined
  onPress: () => any
  onPressed?: () => any
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  fontSize?: number
}
const IconButton: React.FC<IconButtonProps> = ({
  name,
  size,
  color,
  label,
  onPress=()=>{},
  onPressed=()=>{},
  disabled,
  style,
  fontSize
}) => {
  return (
    <TouchableOpacity style={{ opacity: disabled ? .5 : 1 }} 
      onPress={() => { onPress(); onPressed(); }} disabled={disabled}
    >
      <View style={[{ padding: 10, flexDirection: 'row' }, style]}>
        {label && <HeaderTitle style={[{ color }, fontSize && { fontSize }]} >{label}</HeaderTitle>}
        <MaterialIcons name={name} size={size} color={color} />
      </View>
    </TouchableOpacity>
  )
}

export default IconButton;