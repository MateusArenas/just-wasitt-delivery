
import React, { memo, useContext } from 'react';
import { View, Text, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { ThemeContext } from 'styled-components/native';

import { Container, CustomTextInput, CharactersInfo } from './styles';

interface InputTextAreaProps {
  value: string | undefined
  onChangeText: ((v: any) => any) | undefined
  onFocus?: () => any
  maxLength: number
  placeholder: string | undefined
  style?: StyleProp<ViewStyle>
}
const InputTextArea: React.FC<InputTextAreaProps & TextInputProps> = (props) => {
  const { layout, colors, fonts, icons } = useContext(ThemeContext);

  const length = typeof props.value !== 'undefined' ? props.value?.length : 0

  return (
    <Container style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, props?.style]}>
      <CustomTextInput {...props}
        style={{ fontWeight: '500', flex: 1, opacity: .8 }}
        placeholderTextColor={colors?.text}
        value={props.value}
        onChangeText={props.onChangeText}
        multiline={true}
        textAlignVertical={"top"}
        textAlign={'left'}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        onFocus={props.onFocus}
      />
      <CharactersInfo style={{ fontWeight: '500', opacity: .5, position: 'relative', padding: 10 }}>{`${length} / ${props.maxLength}`}</CharactersInfo>
    </Container>
  )
}


export default memo(InputTextArea)