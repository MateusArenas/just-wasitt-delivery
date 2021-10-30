import React from 'react';
import { ColorValue, View, Text, StyleProp, TextStyle } from 'react-native';

interface BadgeProps {
    value?: number
    color?: ColorValue
    backgroundColor?: ColorValue
    fontSize?: number
    style?: StyleProp<TextStyle>
}

const Badge: React.FC<BadgeProps> = ({ 
    value, 
    style, 
    fontSize=12, 
    backgroundColor='blue', 
    color='white' 
}) => {
  return (
      <View style={[{ alignItems: 'center', justifyContent: 'center', padding: 10 }, style]}>
        <View style={{ 
            backgroundColor, borderRadius: 30, overflow: 'hidden',
            minWidth: 24, maxHeight: 24,
            alignItems: 'center', justifyContent: 'center',
        }}>
            <Text numberOfLines={1} style={{ 
                alignSelf: 'center', textAlign: 'center',
                flex: 1, flexDirection: 'row',
                padding: 5,
                color,
                fontWeight: '500',
                fontSize,
            }}>{value}</Text>
        </View>
      </View>
  )
}

export default React.memo(Badge);