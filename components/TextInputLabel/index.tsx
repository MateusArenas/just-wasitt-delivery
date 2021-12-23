import React from 'react';
import { useTheme } from '@react-navigation/native';
import { View, Text, TextInput, StyleSheet, TouchableHighlight } from 'react-native';
import { TextInputMask, TextInputMaskProps, TextInputMaskTypeProp } from 'react-native-masked-text';

type TextInputCustomMaskTypeProp =
    | 'fake'
    | 'default'

type Modify<T, R> = Omit<T, keyof R> & R;
interface TextInputLabelProps extends Modify<TextInputMaskProps, {
  label?: string, 
  color?: string, 
  type?: TextInputMaskTypeProp | TextInputCustomMaskTypeProp
}> {}

const TextInputLabel: React.FC<TextInputLabelProps> = ({ 
  label, color, children, type='default', ...props 
}) => {

  return (
    <View style={styles.container}>
      <Text style={[styles.textInputDescribe, { color }]}>{label}</Text>
      <View style={[styles.textInputInner]}>
        <View style={{ flex: 1 }}>
          <InputType {...props} color={color} type={type} />
        </View>
        {children}
      </View>
      <View style={[styles.textInputIndicator, { backgroundColor: color }]} />
    </View>
  )
}

const InputType = ({ type, color, ...props }) => {
  const { colors } = useTheme()

  switch (type) {
    case 'default':
      return (
        <TextInput {...props}
          placeholderTextColor={color}
          style={[styles.textInput, props.style, { color, opacity: props?.value ? 1 : .5, }]} 
        />
      )
    case 'fake':
      return (
        <TouchableHighlight onPress={() => { props.onFocus(null as any) }}>
          <View style={[styles.textInput, props.style, { justifyContent: 'center' }]}>
            <Text style={[styles.textInput, { minHeight: 'auto' }, { 
              color,
              opacity: props?.value ? 1 : .5,
            }]}>
              {props.value ? props.value : props.placeholder}
            </Text>
          </View>
        </TouchableHighlight>
      )
    default:
      return (
        <TextInputMask type={type} {...props}
          placeholderTextColor={color}
          style={[styles.textInput, props.style, { color, opacity: props?.value ? 1 : .5, }]} 
        />
      )
  }
}

export default TextInputLabel;

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
    padding: 10,
  },
  textInputDescribe: {
    fontSize: 14,
    fontWeight: '500',
  },
  textInputInner: {
    flexDirection: 'row',
  },
  textInputIndicator: {
    opacity: .6,
    width: '100%', 
    height: 2, 
    borderRadius: 4
  },
  textInput: {
    minHeight: 42,
    fontSize: 16,
    fontWeight: '600'
  },
});