import MaterialIcons from '@expo/vector-icons/build/MaterialIcons';
import React from 'react';
import { View, Text, ColorValue } from 'react-native';
import IconButton from '../IconButton';

interface BoardButtonProps {
    title: string
    icon: React.ComponentProps<typeof MaterialIcons>['name']
    iconSize?: number
    titleSize?: number
    tintColor?: ColorValue
    backgroundColor?: ColorValue
    disabled?: boolean
    onPress?: () => any
    onPressed?: () => any
    badgeEnable?: boolean
    badge?: {
        number?: number;
        color?: ColorValue;
        overlay?: ColorValue;
        background: ColorValue;
        bordered?: boolean
    }
}

const BoardButton: React.FC<BoardButtonProps> = ({ 
    title,
    titleSize=12,
    icon,
    tintColor='white',
    iconSize=24,
    backgroundColor='black',
    disabled=false,
    onPress,
    onPressed,
    badgeEnable=false,
    badge={ overlay: backgroundColor, background: 'red' }
}) => {
  return (
    <View style={{ 
        margin: 5, padding: 10, paddingTop: 0,
        flexGrow: 1, borderRadius: 10, backgroundColor,
        alignItems: 'center', 
      }}>
        <IconButton style={{ padding: 20 }}
          disabled={disabled}
          name={icon}
          size={iconSize}
          color={tintColor}
          onPress={onPress}
          onPressed={onPressed}
          badgeEnable={badgeEnable}
          badge={{ overlay: backgroundColor, ...badge }}
        />
        <Text style={{ color: tintColor, fontSize: titleSize, 
          position: 'absolute', bottom: 10, opacity: disabled ? .5 : 1
        }}>{title}</Text>
      </View>
  )
}

export default React.memo(BoardButton)