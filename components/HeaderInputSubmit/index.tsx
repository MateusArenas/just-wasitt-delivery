import React from 'react';
import { StackHeaderTitleProps } from "@react-navigation/stack"
import { useTheme } from '@react-navigation/native';
import { TextInput, View, Text } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Loading from '../Loading';

export interface HeaderInputSubmitProps extends StackHeaderTitleProps {
  loading?: boolean
  submitText?: string
  value: string
  onChangeValue: (value: string) => any
  onSubmit: () => any
  disabled?: boolean
}
const HeaderInputSubmit: React.FC<HeaderInputSubmitProps> = ({
  loading,
  submitText='Concluir',
  value, onChangeValue, onSubmit, disabled,
  children,
  tintColor,
}) => {
  const { colors } = useTheme()
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 12, opacity: .5, color: colors.text, fontWeight: '500' }}>{children}</Text>
        <TextInput autoFocus
          style={{ 
            fontSize: 18, color: tintColor, 
            paddingBottom: 5,
            width: '100%', fontWeight: '500',
          }}
          placeholder={'Nome'}
          value={value}
          onChangeText={onChangeValue}
          onSubmitEditing={onSubmit}
        />
      </View>
      <TouchableWithoutFeedback disabled={disabled} onPress={onSubmit}> 
        {loading ?
          <Loading />
          : <Text style={{ 
              opacity: disabled ? .6 : 1,
              color: colors.primary, 
              fontWeight: '500', fontSize: 16, padding: 20 
            }}>{submitText}</Text>
        }
      </TouchableWithoutFeedback>
    </View>
  )
}

export default HeaderInputSubmit