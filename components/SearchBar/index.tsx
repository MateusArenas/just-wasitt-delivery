import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { View } from '../Themed';

const SearchBar: React.FC<TextInputProps> = (props) => {
  const { colors, dark } = useTheme()
  return (
    <View style={{ 
        borderRadius: 10, overflow: 'hidden',
        // borderWidth: 1, borderColor: colors.border
      }}
      lightColor={'rgba( 0, 0, 0, .4)'} darkColor={'rgba( 255, 255, 255, .2)'}
    >
      <BlurView style={{ 
        flexDirection: 'row', alignItems: 'center',
        // borderRadius: 10, overflow: 'hidden',
      }}
        intensity={100} tint={dark ? 'dark' : 'light'}
      >
        <MaterialIcons style={{ padding: 5, opacity: .5 }} name="search" size={24} color={colors.text} />
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
            color: colors.text, 
            fontSize: 18, 
          }]}
        />
      </BlurView>
    </View>
  )
}

export default SearchBar;