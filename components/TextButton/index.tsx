import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, ColorValue, TextStyle, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';

interface TextButtonProps {
  disabled?: boolean
  onPress: () => any
  onPressed?: () => any
  label: string
  fontSize: number
  color: ColorValue
  style?: StyleProp<ViewStyle>
  textTransform?: TextStyle["textTransform"]
  fontWeight?: TextStyle["fontWeight"]
  right?: React.ReactNode
}

const TextButton: React.FC<TextButtonProps> = ({
  disabled,
  onPress=()=>{},
  onPressed=()=>{},
  label,
  fontSize,
  color,
  style,
  textTransform,
  fontWeight='500',
  right
}) => {
  const opacity = disabled ? .5 : 1
  return (
    <TouchableOpacity onPress={() => { onPress(); onPressed(); }} disabled={disabled}>
      <View style={[{ padding: 10 }, style, { flexDirection: 'row', alignItems: 'center', opacity }]}>
        <Text numberOfLines={1} style={[
          { fontSize, color }, 
          { fontWeight, textTransform }
        ]}>{label}</Text>
        {right}
      </View>
    </TouchableOpacity>
  )
}

export default TextButton;