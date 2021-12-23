import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import IconButton from '../IconButton';

const InputCheck: React.FC<{
  label: string
  check: boolean
  onPress: () => any,
  style?: StyleProp<ViewStyle> 
}> = ({ label, onPress, check=false, style }) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <View style={{ 
        width: "100%", 
        flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start'
      }}>
        <MaterialIcons style={{ padding: 10, opacity: check ? 1 : .8 }}
          name={check ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={check ? colors.primary : colors.text }
        />
        <Text style={{
          flex: 1, alignItems: 'center',
          alignSelf: 'flex-start',
          padding: 10,
          color: colors.text,
          fontSize: 16, fontWeight: '500',
        }}>{label}</Text>
        {/* <View style={{ flexGrow: 1, height: 2, backgroundColor: colors.border }} /> */}
        {/* <MaterialIcons style={{ opacity: .8 }}
          name={"chevron-right"}
          size={24}
          color={colors.text}
        /> */}
      </View>
    </TouchableOpacity>
  )
}

export default InputCheck;