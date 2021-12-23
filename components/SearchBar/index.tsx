import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native';


const SearchBar: React.FC<TextInputProps & { 
  right?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
}> = (props) => {
  const { colors, dark } = useTheme()
  return (
    <View style={[{ 
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 4, overflow: 'hidden',
        backgroundColor: colors.border,
        padding: 5
        // borderWidth: 1, borderColor: colors.border
      }, props.containerStyle]}
    >
      {/* <BlurView style={{ 
        flexDirection: 'row', alignItems: 'center',
        // borderRadius: 10, overflow: 'hidden',
      }}
        intensity={100} tint={dark ? 'dark' : 'light'}
      > */}
        <MaterialIcons style={{ padding: 5, paddingHorizontal: 10, opacity: .5 }} name="search" size={24} color={colors.text} />
        <TextInput {...props}
          clearButtonMode={'always'}
          defaultValue={props?.defaultValue}
          onChangeText={props?.onChangeText}
          onLayout={props?.onLayout}
          allowFontScaling={props.allowFontScaling}
          autoFocus={props?.autoFocus}
          placeholderTextColor={colors.text}
          placeholder={props.placeholder}
          style={[props.style as any, { 
            flex: 1,
            opacity: (!!props?.defaultValue || props?.value) ? 1 : .5,
            padding: 5, 
            paddingLeft: 0,
            color: colors.text, 
            fontSize: 18, 
          }]}
        />
        {props?.right}
      {/* </BlurView> */}
    </View>
  )
}

export default SearchBar;