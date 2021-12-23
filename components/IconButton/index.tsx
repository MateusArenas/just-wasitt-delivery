import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { HeaderTitle } from '@react-navigation/stack';
import React from 'react';
import { TouchableOpacity, StyleProp, View, ViewStyle, TextStyle, ColorValue } from 'react-native';
import { Easing, useSharedValue, withSequence, interpolate, cancelAnimation, withTiming } from 'react-native-reanimated';
import Badge from '../Badge';
import { Text } from '../Themed';

import { Hoverable, Pressable, } from 'react-native-web-hover'

// import { Container } from './styles';
interface IconButtonProps {
  name: React.ComponentProps<typeof MaterialIcons>['name']
  label?: string
  reverse?: boolean
  size: number
  color: ColorValue
  onPress: () => any
  onPressed?: () => any
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  fontSize?: number
  fontWeight?: TextStyle['fontWeight']
  textOpacity?: TextStyle['opacity']
  badgeEnable?: boolean
  badge?: { number?: number, color?: ColorValue, overlay: ColorValue, background: ColorValue, bordered?: boolean }
  badgeNumber?: number
}
const IconButton: React.FC<IconButtonProps> = ({
  name,
  size,
  color,
  label,
  reverse=false,
  onPress=()=>{},
  onPressed=()=>{},
  disabled,
  style,
  fontSize,
  fontWeight='500',
  textOpacity=1,
  badge={ enable: false, color: 'white', overlay: 'transparent', background: 'red' },
  badgeEnable=false,
}) => {
  const { colors } = useTheme()
  return (
    <Hoverable>
      {({ hovered }) => (
        <TouchableOpacity style={[
          { opacity: disabled ? .5 : 1 }, { borderRadius: 4, overflow: 'hidden' },
          !disabled && hovered && { backgroundColor: colors.border }
        ]} 
          onPress={() => { onPress(); onPressed(); }} disabled={disabled}
        >
          <View style={[
            { padding: 10, flexDirection: reverse ? 'row-reverse' : 'row' }, 
            !disabled && hovered && { backgroundColor: colors.border },
            style
          ]}>
            {label && <Text style={[{ color }, fontSize && { fontSize, fontWeight, opacity: textOpacity }]} >{label}</Text>}
            <View>
              <MaterialIcons name={name} size={size} color={color} />
              {(badgeEnable) && <Badge 
                value={badge?.number}
                overflowColor={badge?.overlay}
                backgroundColor={badge?.background}
                color={badge?.color}
                bordered={badge?.bordered}
              />}
            </View>
          </View>
        </TouchableOpacity>
      )}
    </Hoverable>
  )
}

export default IconButton;