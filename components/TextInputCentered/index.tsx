import React from "react"
import { TextInput, View, Text, TextInputProps, Animated } from "react-native"
import { MaskService, TextInputMaskProps, TextInputMaskTypeProp } from "react-native-masked-text"
import CustomTextInput from "../CustomTextInput"

type TextInputCustomMaskTypeProp =
    | 'fake'
    | 'default'

const TextInputCentered: React.FC<TextInputMaskProps & 
  { ref?: React.MutableRefObject<TextInput> } & {  type?: TextInputMaskTypeProp | TextInputCustomMaskTypeProp }
> = React.forwardRef(({ type='default' , ...props }, ref) => {
  const [width, setWidth] = React.useState<number>()
  const TextInputRef = React.useRef<TextInput>(null)

  React.useImperativeHandle(ref, () => TextInputRef.current)
  
  return (
     <Animated.View style={{ position: 'relative', }}>
        <CustomTextInput ref={TextInputRef} {...props} 
          type={type} 
          textAlign={'center'} textAlignVertical={'center'}
          style={[
            { zIndex: 99 ,minWidth: 1, position: 'absolute' }, 
            props.style,
            { width, textAlign: "left" }
          ]}  
          />
      <Text
        style={[
          props.style,
          { opacity: 0, zIndex: 0 }, 
          { flexShrink: 1 }
        ]}
        onLayout={e=>setWidth(e.nativeEvent.layout.width+10)}
        >
          {!!props?.value ? `${(type === 'fake' || type === 'default') ? props?.value
            : MaskService.toMask(type, `${props?.value}`, props?.options)
          }-` : `${props?.placeholder}-`}
      </Text>
     </Animated.View>
  )
})

export default TextInputCentered