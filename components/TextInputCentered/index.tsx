import { MaterialIcons } from "@expo/vector-icons"
import { useTheme } from "@react-navigation/native"
import React, { forwardRef } from "react"
import { TextInput, View, Text, TextInputProps, TouchableWithoutFeedback, Keyboard } from "react-native"
import { MaskService, TextInputMask, TextInputMaskProps, TextInputMaskTypeProp } from "react-native-masked-text"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated"
import { useKeyboard } from "../../hooks/useKeyboard"
import CustomTextInput from "../CustomTextInput"

type TextInputCustomMaskTypeProp =
    | 'fake'
    | 'default'

type Modify<T, R> = Omit<T, keyof R> & R;
interface TextInputCenteredProps extends Modify<TextInputMaskProps, {
  type?: TextInputMaskTypeProp | TextInputCustomMaskTypeProp
}> {}


const TextInputCentered: React.FC<TextInputCenteredProps & { 
  placeholderTextOpacity?: number,
  right?: React.ReactNode,
  showToMaxLength?: boolean
}> = ({ 
  type='default',
  placeholderTextOpacity=.5, 
  right,
  value='',
  maxLength=999999999,
  showToMaxLength=true,
  ...props 
}) => {
  const { colors } = useTheme()
  const TextInputRef = React.useRef<TextInput>(null)
  
    const opacity = useSharedValue(0);
  
    opacity.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(0, { duration: 250 })),
        withTiming(.5, { duration: 250 }),
      ),
      -1,
      false
    );
  
    const style = useAnimatedStyle(() => ({ opacity: opacity.value }), []);

  const keyboardShow = useKeyboard()
  
  return (
    <View style={{ flex: 1, padding: 10 }}>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }} >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <View>
              <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <View style={{
                  minHeight: 100, 
                  alignSelf: 'stretch',
                  justifyContent: 'center',
                  flexDirection: 'row', alignItems: 'center'
                }}>
                  {!keyboardShow && <Animated.View style={[{ 
                    height: 16*2, width: 2, backgroundColor: props.selectionColor || colors.primary,
                    borderRadius: 2, marginLeft: -2,
                  }, style]}/>}
                  <CustomTextInput selectionColor={props.selectionColor || colors.primary} {...props} 
                    placeholderTextColor={colors.text}
                    type={type as any} 
                    value={value}
                    maxLength={maxLength}
                    textAlign={'center'} textAlignVertical={'center'}
                    style={[{ 
                      textAlign: 'center',
                      padding: 10,
                      color: colors.text,
                      fontSize: 16*2, fontWeight: '500', textTransform: 'capitalize'
                    }, props.style, 
                    (value?.length <= 0 ) ? { opacity: placeholderTextOpacity } : {}
                  ]}
                    />
                </View>
              </View>
              </View>
              {(value?.length > 0) ? right : null}
            </View>
          </View>
        </View>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
          <View style={{ flex: 1 }}/>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback style={{ flex: 1}} onPress={Keyboard.dismiss} >
         <View>
            {(showToMaxLength && !!value) && <Text style={{
              position: 'absolute', bottom: 0,
              alignSelf: 'flex-end',
              fontWeight: '500', fontSize: 16,
              color: colors.text, opacity: .5,
              padding: 10, 
            }}>{value?.length + ' / ' + maxLength}</Text>}
            {keyboardShow && (
              <View style={{ 
                position: 'absolute', bottom: 0, alignSelf: 'center',
                padding: 10, alignItems: 'center', opacity: .5
              }}>
                <MaterialIcons
                  name="expand-more" 
                  size={24} 
                  color={colors.text} 
                />
                <Text style={{ textTransform: 'uppercase',
                  fontWeight: '500', fontSize: 12,
                  color: colors.text, textAlign: 'center'
                }}>{'recolher'}</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    // <View style={{ 
    //   flex: 1, 
    //   justifyContent: 'center', 
    //   alignItems: 'center' 
    // }}>
    //   <View style={{
    //     minHeight: 100, 
    //     alignSelf: 'stretch',
    //     justifyContent: 'center',
    //   }}>
    //     <CustomTextInput ref={TextInputRef as any} {...props} 
    //       type={type as any} 
    //       textAlign={'center'} textAlignVertical={'center'}
    //       style={[
    //         props.style,
    //       ]}  
    //       />
    //   </View>
    // </View>
  )
}

export default TextInputCentered