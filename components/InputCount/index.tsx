import { MaterialIcons } from '@expo/vector-icons';
import React, { memo, useContext, useEffect, useReducer, useState } from 'react';
import { TextInput, TouchableOpacity, View, Text, StyleSheet, TextStyle, ColorValue } from 'react-native';

import { Container, Number } from './styles';

import IconButton from '../IconButton';
import { useTheme } from '@react-navigation/native';
import { StyleProp } from 'react-native';

interface InputCountProps {
  money?: any
  vertical?: boolean
  value?: number // 
  minValue?: number //
  maxValue?: number
  onChangeValue?: (changeValue: number) => any  //
  children?: JSX.Element
  decreaseIcon?: React.ComponentProps<typeof MaterialIcons>['name']
  increaseIcon?: React.ComponentProps<typeof MaterialIcons>['name']
  tintColor?: ColorValue
}

const InputCount: React.FC<InputCountProps> = ({ 
  money,
  value,
  minValue = 0,
  maxValue = 999,
  vertical= false,
  onChangeValue,
  decreaseIcon="remove",
  increaseIcon="add",
  tintColor,
  children,
}) => {
  const { colors } = useTheme()

  const onDecrease = () => onChangeValue && onChangeValue(value-1)
  const onIncrease = () => onChangeValue && onChangeValue(value+1)

  const disableDecrease = (typeof minValue !== 'undefined' 
    ? value <= minValue : false
  )

  const disableIncrease = (typeof maxValue !== 'undefined' 
    ? value >= maxValue : false
  )

  const binarySwitch = (minValue === 0 && maxValue === 1)

  return (
    <Container style={{ flexDirection: vertical ? 'column-reverse' : 'row' }} >
      {<IconButton
        style={{ 
          opacity: (binarySwitch) ? 0 : 1,
          padding: (binarySwitch) ? 1.25 : 10
        }}
        name={decreaseIcon}
        color={colors.text}
        size={24}
        disabled={disableDecrease}
        onPress={onDecrease}
      />}


      {(binarySwitch && !disableDecrease)  && <IconButton
        // style={{ padding: 0 }}
        name={decreaseIcon}
        color={colors.text}
        size={24}
        disabled={disableDecrease}
        onPress={onDecrease}
      />}

      {!binarySwitch && <View style={{ flexDirection: 'row' }}>
        {children}
        {!children && <Number style={{ color: tintColor ? tintColor : colors?.text, fontWeight: '500' }}>
          {value}
        </Number>}
      </View>}

      {(binarySwitch && !disableIncrease) &&<IconButton 
        // style={{ padding: 0 }}
        name={increaseIcon}
        color={colors.text}
        size={24}
        disabled={disableIncrease}
        onPress={onIncrease}
      />}
      
      {<IconButton 
        style={{ 
          opacity: (binarySwitch) ? 0 : 1,
          padding: (binarySwitch) ? 1.25 : 10
        }}
        name={increaseIcon}
        color={colors.text}
        size={24}
        disabled={disableIncrease}
        onPress={onIncrease}
      />}
    </Container>
  )
}

export default memo(InputCount)