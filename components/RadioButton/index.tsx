import { useTheme } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { View, SectionList, Text  } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import { ThemeContext } from 'styled-components/native';


import { AboutLabel, CollumBetween, Container } from './styles';

interface RadioButtonComponentProps {
  data: Array<dataProps>
  index?: number
  onChangeIndex?: (index: number) => any 
  formHorizontal?: boolean
  rowReverse?: boolean
}

interface dataProps {
  label: string
  about?: string
  expandComponent?: any
  key?: string
}

const RadioButtonComponent: React.FC<RadioButtonComponentProps> = ({
  data,
  index,
  onChangeIndex,
  formHorizontal=false,
  rowReverse=false
}) => {
  const { colors } = useTheme();

  return <Container>
    <RadioForm
    
           formHorizontal={formHorizontal}
           animation={true}
           style={{ paddingVertical: 10, justifyContent: 'space-between', flex:1, flexWrap: 'wrap' }}
        >
         { data.map((obj, i) => (
        <View style={{ flex: 1, width: '100%' }}>
        
         <CollumBetween 
          lasted={(i === data.length -1)}
        >
      <RadioButton labelHorizontal={true} key={i} 
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: rowReverse ? 'row-reverse' : 'row'
          }}
      >
        {/*  You can set RadioButtonLabel before RadioButtonInput */}
        <RadioButtonLabel
          obj={obj}
          index={i}
          labelHorizontal={true}
          labelStyle={{ 
            padding: 0,
            marginLeft: formHorizontal ? 10 : 0,
            fontSize: 16, 
            fontWeight: '500', 
            color: colors?.text, 
            opacity: 1,
          }}
          labelWrapStyle={{}}
        />
        <RadioButtonInput
          obj={obj}
          index={i}
          isSelected={index === i}
          onPress={v => onChangeIndex(i)}
          borderWidth={index === i ? 8 : 2}
          buttonInnerColor={colors?.card}
          buttonOuterColor={index  === i ? colors?.primary : colors?.border}
          buttonSize={10}
          buttonOuterSize={20}
          buttonStyle={{
            // display: 'flex',
            // alignItems: 'center',
            // justifyContent: 'space-between',
          }}
          // buttonWrapStyle={{marginLeft: 10}}
        />
        
      </RadioButton>
      <AboutLabel style={{ fontSize: 14, padding: 0, opacity: .8, fontWeight: '500', color: colors.text}}>{obj.about}</AboutLabel>
      </CollumBetween>
          {index === i && obj.expandComponent}
      </View>
    ))
  }  
  
        </RadioForm>
  </Container>;
}

export default RadioButtonComponent;