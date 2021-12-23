
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React, { memo, useContext } from 'react';
import { View, Text, TextInputProps, ViewStyle, StyleProp, TextStyle, Keyboard, TextInput, TouchableWithoutFeedback } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useKeyboard } from '../../hooks/useKeyboard';


interface InputTextAreaProps {
  value: string | undefined
  onChangeText: ((v: any) => any) | undefined
  onFocus?: () => any
  maxLength: number
  placeholder: string | undefined
  style?: StyleProp<TextStyle>
  infoStyle?: StyleProp<TextStyle>
  containerStyle?: StyleProp<ViewStyle>
  cursorPointered?: boolean
}
const InputTextArea: React.FC<InputTextAreaProps & TextInputProps> = ({ infoStyle={}, containerStyle={}, cursorPointered=true, ...props}) => {
  const { colors } = useTheme();

  const length = typeof props.value !== 'undefined' ? props.value?.length : 0

  const keyboardShow = useKeyboard()

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
  
  return (
    <View style={[{ flex: 1, width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, containerStyle]}>
      {(cursorPointered && !keyboardShow) && <Animated.View style={[{ 
        height: 12*2, width: 2, backgroundColor: props.selectionColor || colors.primary,
        borderRadius: 2, marginLeft: -2, marginTop: 3
      }, style]}/>}
      <TextInput {...props}
        style={[{ 
          fontWeight: '500', 
          flex: 1,
          padding: 10,
          minHeight: 20,
          maxHeight: 60, color: colors.text, 
        }, props?.style, props?.value?.length <= 0 ? { opacity: .5 } : {}]}
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
      {keyboardShow && <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
        <View style={{ 
          width: '100%',
          position: 'absolute', bottom: 0, alignSelf: 'center',
          padding: 10, alignItems: 'center', opacity: .5, 
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
      </TouchableWithoutFeedback>}
      <Text style={[{ 
        color: colors.text,
        fontWeight: '500', 
        opacity: .5, 
        position: 'relative', alignSelf: 'flex-end',
        padding: 10,
        }, infoStyle]}>{`${length} / ${props.maxLength}`}</Text>
    </View>
  )
}


export default memo(InputTextArea)