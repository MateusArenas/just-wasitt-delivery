import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Text, TextInput, TouchableHighlight, View } from 'react-native';
import { TextInputMask, TextInputMaskProps, TextInputMaskTypeProp } from 'react-native-masked-text';

type TextInputCustomMaskTypeProp =
    | 'fake'
    | 'default'

type Modify<T, R> = Omit<T, keyof R> & R;
interface TextInputLabelProps extends Modify<TextInputMaskProps, {
  type?: TextInputMaskTypeProp | TextInputCustomMaskTypeProp
}> {}

const CustomTextInput: React.FC<TextInputLabelProps> = React.forwardRef(({ type='default', ...props}, ref) => {
  const TextInputRef = React.useRef<TextInput>(null)

  React.useImperativeHandle(ref, () => TextInputRef.current)
  
  const { colors } = useTheme()

  React.useEffect(() => {
    console.log({ value: props?.value });
  }, [props?.value])

  if (type === 'default') return <TextInput ref={TextInputRef} {...props}/>

  if (type === 'fake') return (
    <TouchableHighlight onPress={() => { props.onFocus(null as any) }}>
      <View style={[props?.style, { justifyContent: 'center' }]}>
        <Text style={[{ minHeight: 'auto' }, { 
          color: colors.border
        }, props?.style]}>
          {props?.value ? props?.value : props?.placeholder}
        </Text>
      </View>
    </TouchableHighlight>
  )
  
  return <TextInputMask type={type} {...props} />
})

    
  export default CustomTextInput;