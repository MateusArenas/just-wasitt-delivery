import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Easing, View, Text, StyleProp, ViewStyle, TouchableOpacity, ColorValue } from 'react-native';
import { DotIndicator } from 'react-native-indicators';
import { Hoverable, Pressable, } from 'react-native-web-hover'

interface ContainerButtonProps {
  title: string
  loading?: boolean
  disabled?: boolean
  onSubimit?: () => any
  onSubimiting?: () => any
  transparent?: boolean
  color?: ColorValue
  border?: boolean
  style?: StyleProp<ViewStyle>
}
const ContainerButton: React.FC<ContainerButtonProps> = ({
  style,
  title,
  loading,
  disabled=false,
  onSubimit=()=>{},
  onSubimiting=()=>{},
  transparent,
  color,
  border
}) => {
  const { colors } = useTheme()
  return (
    <Hoverable>
      {({ hovered }) => (
        <TouchableOpacity disabled={disabled} onPress={() => { onSubimit(); onSubimiting(); }}>
          <View style={[style,{ 
            // flex: 1,
            flexDirection: 'row',
            borderWidth: border ? 1 : 0,
            borderColor: border ? colors.border : 'transparent',
            backgroundColor: transparent ? 'transparent' : disabled ? colors.border : colors.primary, 
            padding: 8, 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 4,
            maxHeight: 36,
            minHeight: 36,
            }, hovered && { backgroundColor: colors.border }]}>
            {!loading ? 
              <Text numberOfLines={1} style={{ 
                flex: 1, alignSelf: 'flex-end', textAlign: 'center',
                color: transparent ? color ? color : colors.text : 'white',
                fontWeight: '500', textTransform: 'uppercase',
                fontSize: 14, letterSpacing: 1, 
              }}>{title}</Text>
              : <DotIndicator 
                  style={{ padding: 14 }}
                  animationEasing={Easing.bounce}
                  count={3}
                  animating 
                  interaction
                  size={8}
                  color={transparent ? colors.primary : 'white'} 
                />
            }
          </View>
        </TouchableOpacity>
      )}
    </Hoverable>
  )
}

export default ContainerButton;