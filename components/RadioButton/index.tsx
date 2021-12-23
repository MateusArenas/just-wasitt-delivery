import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, SectionList, StyleProp, ViewStyle, Text, TextStyle, TouchableOpacity, ColorValue  } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { ThemeContext } from 'styled-components/native';


interface RadioButtonComponentProps {
  data: Array<dataProps>
  index?: number
  onChangeIndex?: (index: number) => any 
  formHorizontal?: boolean
  rowReverse?: boolean
  style?: StyleProp<ViewStyle>
  radioStyle?: StyleProp<ViewStyle>
  radioSelectedStyle?: StyleProp<ViewStyle>
  radioLabelStyle?: StyleProp<TextStyle>
  radioAboutStyle?: StyleProp<TextStyle>
  tintColor?: ColorValue
  defaultIcon?: React.ComponentProps<typeof MaterialIcons>['name']
  borderColor?: ColorValue
}

interface dataProps {
  label: string
  about?: string
  expandComponent?: any
  key?: number | string
}

const RadioButtonComponent: React.FC<RadioButtonComponentProps> = ({
  data,
  index,
  onChangeIndex,
  formHorizontal=false,
  rowReverse=false,
  style={},
  radioStyle={},
  radioSelectedStyle={},
  radioLabelStyle,
  radioAboutStyle={},
  tintColor='transparent',
  borderColor="white",
  defaultIcon='check',
}) => {
  const { colors } = useTheme();

  return (
    <FlatList style={[style]} scrollEnabled
      nestedScrollEnabled 
      data={data}
      keyExtractor={(item, index) => `${item?.key}-${index}`}
      renderItem={({ item: obj, index: i }) => (
        <TouchableOpacity onPress={() => onChangeIndex(i)} >
            <View key={i} style={[{ 
              padding: 10,
            }, 
              radioStyle, index === i ? radioSelectedStyle : {}
            ]}>
                
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={[{ 
                  fontSize: 16, 
                  fontWeight: '500', 
                  color: colors?.text, 
                  opacity: 1,
                }, radioLabelStyle]}
              >{obj?.label}</Text>

              <View style={[{
                width: 24,
                height: 24, 
                borderRadius: 60,
                borderWidth: 2, borderColor: borderColor,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'transparent'
              }, index === i ? 
                { backgroundColor: tintColor } : {}
              ]}>
                {index === i && <MaterialIcons name={defaultIcon} size={20} color={borderColor} />}
              </View>

            </View>
            <Text style={[{ 
              fontSize: 14, padding: 0, opacity: .5, fontWeight: '500', color: colors.text,
              paddingRight: 20
            }, radioAboutStyle]}>
              {obj?.about}
            </Text>
          {index === i && obj?.expandComponent}
          </View>
          </TouchableOpacity>
      )}
    />
  );
}

export default React.memo(RadioButtonComponent);