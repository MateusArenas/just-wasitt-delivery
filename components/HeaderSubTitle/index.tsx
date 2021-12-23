import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Hoverable } from 'react-native-web-hover';

// import { Container } from './styles';

const HeaderSubTitle: React.FC<{
  onPress?: () => any
  disabled?: boolean
}> = ({ children, onPress, disabled }) => {
    const { colors } = useTheme()
  return (
    <Hoverable>{({ hovered }) => (
      <TouchableOpacity disabled={disabled} onPress={onPress}>
        <Text style={[
            { color: colors.text, opacity: .8, fontWeight: '500', fontSize: 12 },
            { textTransform: 'uppercase', marginBottom: -2 },
            (!disabled && hovered) && { textDecorationLine: 'underline' }
        ]}>{children}</Text>
      </TouchableOpacity>
    )}
    </Hoverable>
  )
}

export default HeaderSubTitle;