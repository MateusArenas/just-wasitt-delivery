import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import React, { forwardRef } from 'react';
import { useImperativeHandle } from 'react';
import { View, ScrollView, StyleProp, ViewStyle, Insets } from 'react-native';
import { AndressData } from '../../services/andress';
import KeyboardSpacer from '../KeyboardSpacer';
import TextInputLabel from '../TextInputLabel';

interface FormAndressProps {
  state: AndressData
  onChangeState: (state: AndressData) => any
  contentContainerStyle?: StyleProp<ViewStyle>
  scrollIndicatorInsets?: Insets
}
const FormAndress: React.FC<FormAndressProps> = React.forwardRef((
  { state, onChangeState, contentContainerStyle, scrollIndicatorInsets }, ref: React.ForwardedRef<ScrollView>
) => {
  const { colors } = useTheme()

  return (
      <ScrollView ref={ref} focusable
        contentContainerStyle={contentContainerStyle}
        scrollIndicatorInsets={scrollIndicatorInsets}
        keyboardDismissMode={'none'}
        keyboardShouldPersistTaps={'handled'}
        style={{ flex: 1, padding: 10, backgroundColor: colors.card }}
      >
        <TextInputLabel 
          label={'CEEP'}
          color={colors.text} 
          placeholder="00000-000" 
          value={state?.ceep} 
          onChangeText={ceep => onChangeState({ ...state, ceep })}
        />
        <TextInputLabel 
          label={'Rua'}
          color={colors.text} 
          placeholder="Rua" 
          value={state?.street} 
          onChangeText={street => onChangeState({ ...state, street })}
        />
        <TextInputLabel 
          label={'Bairro'}
          color={colors.text} 
          placeholder="Bairro" 
          value={state?.district} 
          onChangeText={district => onChangeState({ ...state, district })}
        />
        <TextInputLabel 
          label={'Cidade'}
          color={colors.text} 
          placeholder="Cidade" 
          value={state?.city} 
          onChangeText={city => onChangeState({ ...state, city })}
        />
        <TextInputLabel 
          label={'Estado'}
          color={colors.text} 
          placeholder="Estado" 
          value={state?.state} 
          onChangeText={_state => onChangeState({ ...state, state: _state })}
        />
        <TextInputLabel 
          label={'Número'}
          color={colors.text} 
          placeholder="Número" 
          value={state?.houseNumber} 
          onChangeText={houseNumber => onChangeState({ ...state, houseNumber })}
        />
        <TextInputLabel 
          label={'Complemento'}
          color={colors.text} 
          placeholder="Complemento" 
          value={state?.complement} 
          onChangeText={complement => onChangeState({ ...state, complement })}
        />
      </ScrollView>
  )
})

export default FormAndress;