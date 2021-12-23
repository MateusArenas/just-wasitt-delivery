import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ColorValue, View, Text, StyleProp, TextStyle } from 'react-native';

interface BadgeProps {
    value?: number
    color?: ColorValue
    backgroundColor?: ColorValue
    bordered?: boolean
    overflowColor?: ColorValue
    fontSize?: number
    style?: StyleProp<TextStyle>
    offset?: { top?: number, right?: number, bottom?: number, left?: number }
}

const size = 18;
const miniSize = 8;


const Badge: React.FC<BadgeProps> = ({ 
    value, 
    style, 
    fontSize=12, 
    backgroundColor='blue', 
    bordered=false,
    overflowColor='transparent',
    color='white',
    offset={ top: -10, right: -10 }
}) => {
    const length = `${value}`?.length

    const multply = Math.min(length === 1 ? length : length * .75, 1.75)

    const position = Object.assign(
        !!offset?.top && { top: offset?.top },
        !!offset?.right && { right: offset?.right * multply },
        !!offset?.bottom && { bottom: offset?.bottom },
        !!offset?.left && { left: offset?.left * multply },
    )

  return (
    <View style={[{ 
        position: 'absolute', ...position, 
        backgroundColor: overflowColor, padding: 2,
        borderRadius: 50
      }, style]}>
        <View style={[{ 
           alignSelf: 'center',
           minWidth: size * multply,
           maxWidth: size * multply,
           height: size,
           borderRadius: size / 2,
           alignItems: 'center',
           justifyContent: 'center',
           backgroundColor: bordered ? 'transparent' : backgroundColor,
           borderWidth: bordered ? 1 : 0, borderColor: backgroundColor,
        }, !value ? { 
          paddingHorizontal: 0,
          paddingVertical: 0,
          minWidth: miniSize,
          height: miniSize,
          borderRadius: miniSize / 2,
        } : {}]}>
          {!!value && <Text style={{ 
            fontSize,
            color, fontWeight: '500',
            paddingHorizontal: 4, alignSelf: 'center', textAlignVertical: 'center', textAlign: 'center'
          }}>{length > 2 ? '99+' : value}</Text>}
        </View>
      </View>
  )
}

export default React.memo(Badge);